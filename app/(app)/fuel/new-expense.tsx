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
import { useExpensesStore } from '@/store/useExpensesStore';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import { EXPENSE_CATEGORY_LABELS } from '@/constants/domain';
import type { ExpenseCategory } from '@/types';

const CATEGORY_OPTIONS = Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => ({
  label,
  value: value as ExpenseCategory,
}));

export default function NewExpenseScreen() {
  const { vehicleId: vehicleIdParam } = useLocalSearchParams<{ vehicleId?: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { addExpense } = useExpensesStore();
  const { vehicles } = useVehiclesStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const vehicleOptions = vehicles.map((v) => ({
    label: `${v.make} ${v.model} (${v.year})`,
    value: v.id,
  }));

  const [vehicleId, setVehicleId] = React.useState(vehicleIdParam ?? vehicles[0]?.id ?? '');
  const [category, setCategory] = React.useState<ExpenseCategory>('maintenance');
  const [title, setTitle] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [date, setDate] = React.useState(new Date());
  const [mileage, setMileage] = React.useState('');
  const [vendor, setVendor] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!vehicleId) newErrors.vehicleId = 'Seleccioná un vehículo';
    if (!title.trim()) newErrors.title = 'El título es requerido';
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) newErrors.amount = 'Monto inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setIsLoading(true);
    try {
      await addExpense({
        vehicleId,
        userId: user.id,
        category,
        title: title.trim(),
        description: description.trim() || undefined,
        amount: parseFloat(amount),
        date: date.getTime(),
        mileage: mileage ? parseFloat(mileage) : undefined,
        vendor: vendor.trim() || undefined,
        isRecurring: false,
      });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el gasto.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardView>
      <View className="flex-row items-center justify-between mb-6" style={{ paddingTop: insets.top }}>
        <Text variant="h2">Nuevo gasto</Text>
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
        label="Categoría"
        options={CATEGORY_OPTIONS}
        value={category}
        onChange={setCategory}
      />

      <Input
        label="Título *"
        placeholder="Ej: Seguro anual"
        value={title}
        onChangeText={setTitle}
        error={errors.title}
      />

      <Input
        label="Monto *"
        placeholder="50000"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        error={errors.amount}
      />

      <DatePicker label="Fecha" value={date} onChange={setDate} maximumDate={new Date()} />

      <Input
        label="Proveedor / Comercio"
        placeholder="Nombre del proveedor"
        value={vendor}
        onChangeText={setVendor}
      />

      <Input
        label="Kilometraje (opcional)"
        placeholder="52000"
        value={mileage}
        onChangeText={setMileage}
        keyboardType="numeric"
      />

      <Input
        label="Descripción"
        placeholder="Notas adicionales..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={2}
      />

      <Button onPress={handleSubmit} loading={isLoading} className="mt-2">
        Guardar gasto
      </Button>
    </KeyboardView>
  );
}
