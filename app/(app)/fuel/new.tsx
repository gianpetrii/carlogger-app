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
import { useAuthStore } from '@/store/useAuthStore';
import { useFuelStore } from '@/store/useFuelStore';
import { useVehiclesStore } from '@/store/useVehiclesStore';

export default function NewFuelEntryScreen() {
  const { vehicleId: vehicleIdParam } = useLocalSearchParams<{ vehicleId?: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { addEntry } = useFuelStore();
  const { vehicles } = useVehiclesStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const vehicleOptions = vehicles.map((v) => ({
    label: `${v.make} ${v.model} (${v.year})`,
    value: v.id,
  }));

  const [vehicleId, setVehicleId] = React.useState(vehicleIdParam ?? vehicles[0]?.id ?? '');
  const [date, setDate] = React.useState(new Date());
  const [mileage, setMileage] = React.useState('');
  const [liters, setLiters] = React.useState('');
  const [pricePerLiter, setPricePerLiter] = React.useState('');
  const [gasStation, setGasStation] = React.useState('');
  const [isFullTank, setIsFullTank] = React.useState(true);
  const [notes, setNotes] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const totalCost = React.useMemo(() => {
    const l = parseFloat(liters);
    const p = parseFloat(pricePerLiter);
    return !isNaN(l) && !isNaN(p) ? l * p : 0;
  }, [liters, pricePerLiter]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!vehicleId) newErrors.vehicleId = 'Seleccioná un vehículo';
    if (!mileage || isNaN(parseFloat(mileage))) newErrors.mileage = 'Kilometraje inválido';
    if (!liters || isNaN(parseFloat(liters)) || parseFloat(liters) <= 0) newErrors.liters = 'Litros inválidos';
    if (!pricePerLiter || isNaN(parseFloat(pricePerLiter)) || parseFloat(pricePerLiter) <= 0) newErrors.pricePerLiter = 'Precio inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setIsLoading(true);
    try {
      await addEntry({
        vehicleId,
        userId: user.id,
        date: date.getTime(),
        mileage: parseFloat(mileage),
        liters: parseFloat(liters),
        pricePerLiter: parseFloat(pricePerLiter),
        totalCost,
        gasStation: gasStation.trim() || undefined,
        isFullTank,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la carga.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardView>
      <View className="flex-row items-center justify-between mb-6" style={{ paddingTop: insets.top }}>
        <Text variant="h2">Cargar combustible</Text>
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

      <DatePicker label="Fecha" value={date} onChange={setDate} maximumDate={new Date()} />

      <Input
        label="Kilometraje actual *"
        placeholder="52000"
        value={mileage}
        onChangeText={setMileage}
        keyboardType="numeric"
        error={errors.mileage}
      />

      <View className="flex-row gap-3">
        <Input
          label="Litros *"
          placeholder="40.5"
          value={liters}
          onChangeText={setLiters}
          keyboardType="decimal-pad"
          error={errors.liters}
          className="flex-1"
        />
        <Input
          label="Precio/L *"
          placeholder="1200"
          value={pricePerLiter}
          onChangeText={setPricePerLiter}
          keyboardType="decimal-pad"
          error={errors.pricePerLiter}
          className="flex-1"
        />
      </View>

      {totalCost > 0 && (
        <View className="rounded-lg bg-muted px-4 py-3">
          <Text variant="muted" className="text-xs">Total calculado</Text>
          <Text className="text-lg font-bold text-foreground">
            ${totalCost.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
          </Text>
        </View>
      )}

      <Input
        label="Estación de servicio"
        placeholder="YPF Cabildo..."
        value={gasStation}
        onChangeText={setGasStation}
      />

      <Pressable
        onPress={() => setIsFullTank(!isFullTank)}
        className="flex-row items-center gap-3 py-1"
      >
        <View className={`w-5 h-5 rounded border-2 items-center justify-center ${isFullTank ? 'bg-primary border-primary' : 'border-input'}`}>
          {isFullTank && <Text className="text-primary-foreground text-xs font-bold">✓</Text>}
        </View>
        <Text className="text-foreground">Tanque lleno</Text>
      </Pressable>

      <Input
        label="Notas"
        placeholder="Observaciones..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={2}
      />

      <Button onPress={handleSubmit} loading={isLoading} className="mt-2">
        Guardar carga
      </Button>
    </KeyboardView>
  );
}
