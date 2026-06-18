import * as React from 'react';
import { View, Alert } from 'react-native';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardView } from '@/components/layout/KeyboardView';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { ImagePickerField } from '@/components/ui/image-picker';
import { useAuthStore } from '@/store/useAuthStore';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import type { FuelType, Transmission } from '@/types';

const FUEL_OPTIONS = [
  { label: 'Nafta', value: 'gasoline' as FuelType },
  { label: 'Diesel', value: 'diesel' as FuelType },
  { label: 'Eléctrico', value: 'electric' as FuelType },
  { label: 'Híbrido', value: 'hybrid' as FuelType },
];

const TRANSMISSION_OPTIONS = [
  { label: 'Manual', value: 'manual' as Transmission },
  { label: 'Automático', value: 'automatic' as Transmission },
  { label: 'CVT', value: 'cvt' as Transmission },
];

export default function NewVehicleScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { addVehicle } = useVehiclesStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const [make, setMake] = React.useState('');
  const [model, setModel] = React.useState('');
  const [year, setYear] = React.useState(String(new Date().getFullYear()));
  const [color, setColor] = React.useState('');
  const [licensePlate, setLicensePlate] = React.useState('');
  const [vin, setVin] = React.useState('');
  const [mileage, setMileage] = React.useState('');
  const [fuelType, setFuelType] = React.useState<FuelType>('gasoline');
  const [engine, setEngine] = React.useState('');
  const [transmission, setTransmission] = React.useState<Transmission>('manual');
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [notes, setNotes] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!make.trim()) newErrors.make = 'La marca es requerida';
    if (!model.trim()) newErrors.model = 'El modelo es requerido';
    const yearNum = parseInt(year);
    if (!year || isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      newErrors.year = 'Año inválido';
    }
    if (!mileage || isNaN(parseFloat(mileage)) || parseFloat(mileage) < 0) {
      newErrors.mileage = 'Kilometraje inválido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setIsLoading(true);
    try {
      await addVehicle({
        userId: user.id,
        make: make.trim(),
        model: model.trim(),
        year: parseInt(year),
        color: color.trim() || undefined,
        licensePlate: licensePlate.trim().toUpperCase() || undefined,
        vin: vin.trim() || undefined,
        mileage: parseFloat(mileage),
        fuelType,
        engine: engine.trim() || undefined,
        transmission,
        photos,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el vehículo. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardView>
      <View className="flex-row items-center justify-between mb-6" style={{ paddingTop: insets.top }}>
        <Text variant="h2">Nuevo vehículo</Text>
        <Pressable onPress={() => router.back()} className="w-9 h-9 rounded-full bg-muted items-center justify-center">
          <X size={18} color="#71717a" />
        </Pressable>
      </View>

      <ImagePickerField
        label="Fotos del vehículo"
        images={photos}
        onChange={setPhotos}
        maxImages={6}
      />

      <View className="flex-row gap-3">
        <Input
          label="Marca *"
          placeholder="Toyota"
          value={make}
          onChangeText={setMake}
          error={errors.make}
          className="flex-1"
        />
        <Input
          label="Modelo *"
          placeholder="Corolla"
          value={model}
          onChangeText={setModel}
          error={errors.model}
          className="flex-1"
        />
      </View>

      <View className="flex-row gap-3">
        <Input
          label="Año *"
          placeholder="2020"
          value={year}
          onChangeText={setYear}
          keyboardType="numeric"
          error={errors.year}
          className="flex-1"
        />
        <Input
          label="Color"
          placeholder="Blanco"
          value={color}
          onChangeText={setColor}
          className="flex-1"
        />
      </View>

      <View className="flex-row gap-3">
        <Input
          label="Patente"
          placeholder="AB123CD"
          value={licensePlate}
          onChangeText={setLicensePlate}
          autoCapitalize="characters"
          className="flex-1"
        />
        <Input
          label="Kilometraje *"
          placeholder="50000"
          value={mileage}
          onChangeText={setMileage}
          keyboardType="numeric"
          error={errors.mileage}
          className="flex-1"
        />
      </View>

      <Select
        label="Tipo de combustible"
        options={FUEL_OPTIONS}
        value={fuelType}
        onChange={setFuelType}
      />

      <View className="flex-row gap-3">
        <Input
          label="Motor"
          placeholder="2.0L"
          value={engine}
          onChangeText={setEngine}
          className="flex-1"
        />
        <Select
          label="Transmisión"
          options={TRANSMISSION_OPTIONS}
          value={transmission}
          onChange={setTransmission}
          className="flex-1"
        />
      </View>

      <Input
        label="VIN"
        placeholder="Número de chasis"
        value={vin}
        onChangeText={setVin}
        autoCapitalize="characters"
      />

      <Input
        label="Notas"
        placeholder="Información adicional..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      <Button onPress={handleSubmit} loading={isLoading} className="mt-2">
        Guardar vehículo
      </Button>
    </KeyboardView>
  );
}
