import * as React from 'react';
import { View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardView } from '@/components/layout/KeyboardView';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { ImagePickerField } from '@/components/ui/image-picker';
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

export default function EditVehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { vehicles, updateVehicle } = useVehiclesStore();
  const vehicle = vehicles.find((v) => v.id === id);
  const [isLoading, setIsLoading] = React.useState(false);

  const [make, setMake] = React.useState(vehicle?.make ?? '');
  const [model, setModel] = React.useState(vehicle?.model ?? '');
  const [year, setYear] = React.useState(String(vehicle?.year ?? ''));
  const [color, setColor] = React.useState(vehicle?.color ?? '');
  const [licensePlate, setLicensePlate] = React.useState(vehicle?.licensePlate ?? '');
  const [vin, setVin] = React.useState(vehicle?.vin ?? '');
  const [mileage, setMileage] = React.useState(String(vehicle?.mileage ?? ''));
  const [fuelType, setFuelType] = React.useState<FuelType>(vehicle?.fuelType ?? 'gasoline');
  const [engine, setEngine] = React.useState(vehicle?.engine ?? '');
  const [transmission, setTransmission] = React.useState<Transmission>(vehicle?.transmission ?? 'manual');
  const [photos, setPhotos] = React.useState<string[]>(vehicle?.photos ?? []);
  const [notes, setNotes] = React.useState(vehicle?.notes ?? '');

  if (!vehicle) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text variant="muted">Vehículo no encontrado</Text>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      await updateVehicle(id, {
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
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardView>
      <View className="flex-row items-center justify-between mb-6" style={{ paddingTop: insets.top }}>
        <Text variant="h2">Editar vehículo</Text>
        <Pressable onPress={() => router.back()} className="w-9 h-9 rounded-full bg-muted items-center justify-center">
          <X size={18} color="#71717a" />
        </Pressable>
      </View>

      <ImagePickerField label="Fotos" images={photos} onChange={setPhotos} maxImages={6} />

      <View className="flex-row gap-3">
        <Input label="Marca *" value={make} onChangeText={setMake} containerClassName="flex-1" />
        <Input label="Modelo *" value={model} onChangeText={setModel} containerClassName="flex-1" />
      </View>

      <View className="flex-row gap-3">
        <Input label="Año *" value={year} onChangeText={setYear} keyboardType="numeric" containerClassName="flex-1" />
        <Input label="Color" value={color} onChangeText={setColor} containerClassName="flex-1" />
      </View>

      <View className="flex-row gap-3">
        <Input label="Patente" value={licensePlate} onChangeText={setLicensePlate} autoCapitalize="characters" containerClassName="flex-1" />
        <Input label="Kilometraje *" value={mileage} onChangeText={setMileage} keyboardType="numeric" containerClassName="flex-1" />
      </View>

      <Select label="Combustible" options={FUEL_OPTIONS} value={fuelType} onChange={setFuelType} />

      <View className="flex-row gap-3">
        <Input label="Motor" value={engine} onChangeText={setEngine} containerClassName="flex-1" />
        <Select label="Transmisión" options={TRANSMISSION_OPTIONS} value={transmission} onChange={setTransmission} className="flex-1" />
      </View>

      <Input label="VIN" value={vin} onChangeText={setVin} autoCapitalize="characters" />
      <Input label="Notas" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

      <Button onPress={handleSubmit} loading={isLoading} className="mt-2">
        Guardar cambios
      </Button>
    </KeyboardView>
  );
}
