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
import { DatePicker } from '@/components/ui/date-picker';
import { ImagePickerField } from '@/components/ui/image-picker';
import { useAuthStore } from '@/store/useAuthStore';
import { useMaintenanceStore } from '@/store/useMaintenanceStore';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import { MAINTENANCE_TYPE_LABELS } from '@/constants/domain';
import type { MaintenanceType } from '@/types';

const TYPE_OPTIONS = Object.entries(MAINTENANCE_TYPE_LABELS).map(([value, label]) => ({
  label,
  value: value as MaintenanceType,
}));

export default function NewMaintenanceScreen() {
  const { vehicleId: vehicleIdParam } = useLocalSearchParams<{ vehicleId?: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { addRecord } = useMaintenanceStore();
  const { vehicles } = useVehiclesStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const vehicleOptions = vehicles.map((v) => ({
    label: `${v.make} ${v.model} (${v.year})`,
    value: v.id,
  }));

  const [vehicleId, setVehicleId] = React.useState(vehicleIdParam ?? vehicles[0]?.id ?? '');
  const [type, setType] = React.useState<MaintenanceType>('oil_change');
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [date, setDate] = React.useState(new Date());
  const [mileage, setMileage] = React.useState('');
  const [cost, setCost] = React.useState('');
  const [serviceProvider, setServiceProvider] = React.useState('');
  const [nextServiceMileage, setNextServiceMileage] = React.useState('');
  const [parts, setParts] = React.useState('');
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [notes, setNotes] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Auto-fill title when type changes
  React.useEffect(() => {
    if (!title) setTitle(MAINTENANCE_TYPE_LABELS[type]);
  }, [type]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!vehicleId) newErrors.vehicleId = 'Seleccioná un vehículo';
    if (!title.trim()) newErrors.title = 'El título es requerido';
    if (!mileage || isNaN(parseFloat(mileage))) newErrors.mileage = 'Kilometraje inválido';
    if (!cost || isNaN(parseFloat(cost))) newErrors.cost = 'Costo inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setIsLoading(true);
    try {
      await addRecord({
        vehicleId,
        userId: user.id,
        type,
        title: title.trim(),
        description: description.trim(),
        date: date.getTime(),
        mileage: parseFloat(mileage),
        cost: parseFloat(cost),
        serviceProvider: serviceProvider.trim() || undefined,
        nextServiceMileage: nextServiceMileage ? parseFloat(nextServiceMileage) : undefined,
        parts: parts.trim() ? parts.split(',').map((p) => p.trim()).filter(Boolean) : [],
        photos,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el registro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardView>
      <View className="flex-row items-center justify-between mb-6" style={{ paddingTop: insets.top }}>
        <Text variant="h2">Nuevo service</Text>
        <Pressable onPress={() => router.back()} className="w-9 h-9 rounded-full bg-muted items-center justify-center">
          <X size={18} color="#71717a" />
        </Pressable>
      </View>

      {vehicleOptions.length > 0 && (
        <Select
          label="Vehículo *"
          options={vehicleOptions}
          value={vehicleId}
          onChange={setVehicleId}
          error={errors.vehicleId}
        />
      )}

      <Select
        label="Tipo de servicio"
        options={TYPE_OPTIONS}
        value={type}
        onChange={setType}
      />

      <Input
        label="Título *"
        placeholder="Ej: Cambio de aceite y filtro"
        value={title}
        onChangeText={setTitle}
        error={errors.title}
      />

      <Input
        label="Descripción"
        placeholder="Detalles del servicio..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={2}
      />

      <DatePicker
        label="Fecha"
        value={date}
        onChange={setDate}
        maximumDate={new Date()}
      />

      <View className="flex-row gap-3">
        <Input
          label="Kilometraje *"
          placeholder="50000"
          value={mileage}
          onChangeText={setMileage}
          keyboardType="numeric"
          error={errors.mileage}
          className="flex-1"
        />
        <Input
          label="Costo *"
          placeholder="15000"
          value={cost}
          onChangeText={setCost}
          keyboardType="decimal-pad"
          error={errors.cost}
          className="flex-1"
        />
      </View>

      <Input
        label="Taller / Prestador"
        placeholder="Nombre del taller"
        value={serviceProvider}
        onChangeText={setServiceProvider}
      />

      <Input
        label="Próximo service (km)"
        placeholder="60000"
        value={nextServiceMileage}
        onChangeText={setNextServiceMileage}
        keyboardType="numeric"
      />

      <Input
        label="Repuestos utilizados"
        placeholder="Filtro de aceite, aceite 5W30... (separados por coma)"
        value={parts}
        onChangeText={setParts}
        multiline
        numberOfLines={2}
      />

      <ImagePickerField
        label="Fotos (comprobantes, etc.)"
        images={photos}
        onChange={setPhotos}
        maxImages={4}
      />

      <Input
        label="Notas"
        placeholder="Observaciones adicionales..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={2}
      />

      <Button onPress={handleSubmit} loading={isLoading} className="mt-2">
        Guardar service
      </Button>
    </KeyboardView>
  );
}
