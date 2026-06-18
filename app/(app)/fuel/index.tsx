import * as React from 'react';
import { View, RefreshControl, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Fuel, Plus, DollarSign } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuthStore } from '@/store/useAuthStore';
import { useFuelStore } from '@/store/useFuelStore';
import { useExpensesStore } from '@/store/useExpensesStore';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import { EXPENSE_CATEGORY_LABELS } from '@/constants/domain';
import { cn } from '@/lib/utils';

type Tab = 'fuel' | 'expenses';

export default function FuelScreen() {
  const { user } = useAuthStore();
  const { entries, isLoading: fuelLoading, fetchEntries } = useFuelStore();
  const { expenses, isLoading: expLoading, fetchExpenses } = useExpensesStore();
  const { vehicles } = useVehiclesStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<Tab>('fuel');

  React.useEffect(() => {
    if (user) {
      fetchEntries(user.id);
      fetchExpenses(user.id);
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) await Promise.all([fetchEntries(user.id), fetchExpenses(user.id)]);
    setRefreshing(false);
  };

  const getVehicleName = (vehicleId: string) => {
    const v = vehicles.find((v) => v.id === vehicleId);
    return v ? `${v.make} ${v.model}` : '—';
  };

  const avgConsumption = React.useMemo(() => {
    if (entries.length < 2) return null;
    const sorted = [...entries].sort((a, b) => a.mileage - b.mileage);
    const totalKm = sorted[sorted.length - 1].mileage - sorted[0].mileage;
    const totalLiters = sorted.slice(1).reduce((sum, e) => sum + e.liters, 0);
    if (totalKm <= 0 || totalLiters <= 0) return null;
    return (totalLiters / totalKm) * 100;
  }, [entries]);

  return (
    <Screen
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text variant="h1">Combustible</Text>
        <Button
          size="sm"
          onPress={() => router.push(activeTab === 'fuel' ? '/(app)/fuel/new' : '/(app)/fuel/new-expense')}
          className="gap-1"
        >
          <Plus size={16} color="white" />
          Nuevo
        </Button>
      </View>

      {/* Tab switch */}
      <View className="flex-row gap-1 p-1 bg-muted rounded-xl">
        <Pressable
          onPress={() => setActiveTab('fuel')}
          className={cn('flex-1 py-2 rounded-lg items-center', activeTab === 'fuel' && 'bg-background shadow-sm')}
        >
          <Text className={cn('text-sm font-medium', activeTab === 'fuel' ? 'text-foreground' : 'text-muted-foreground')}>
            Combustible
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('expenses')}
          className={cn('flex-1 py-2 rounded-lg items-center', activeTab === 'expenses' && 'bg-background shadow-sm')}
        >
          <Text className={cn('text-sm font-medium', activeTab === 'expenses' ? 'text-foreground' : 'text-muted-foreground')}>
            Gastos
          </Text>
        </Pressable>
      </View>

      {activeTab === 'fuel' && (
        <>
          {avgConsumption !== null && (
            <View className="rounded-xl border border-border bg-card p-4 flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 items-center justify-center">
                <Fuel size={20} color="#3b82f6" />
              </View>
              <View>
                <Text className="text-xl font-bold">{avgConsumption.toFixed(1)} L/100km</Text>
                <Text variant="muted" className="text-xs">Consumo promedio</Text>
              </View>
            </View>
          )}

          {entries.length === 0 && !fuelLoading ? (
            <EmptyState
              icon={Fuel}
              title="Sin cargas registradas"
              description="Registrá las cargas de combustible para calcular el consumo"
              actionLabel="Registrar carga"
              onAction={() => router.push('/(app)/fuel/new')}
            />
          ) : (
            <View className="gap-2">
              {entries.map((entry) => (
                <View key={entry.id} className="rounded-xl border border-border bg-card p-4">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-semibold">{entry.liters.toFixed(1)} L</Text>
                      <Text variant="muted" className="text-xs">
                        {format(entry.date, "d MMM yyyy", { locale: es })} · {entry.mileage.toLocaleString()} km
                      </Text>
                      <Text variant="muted" className="text-xs">{getVehicleName(entry.vehicleId)}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="font-bold">${entry.totalCost.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</Text>
                      <Text variant="muted" className="text-xs">${entry.pricePerLiter.toFixed(2)}/L</Text>
                    </View>
                  </View>
                  {entry.gasStation && (
                    <Text variant="muted" className="text-xs mt-1">{entry.gasStation}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {activeTab === 'expenses' && (
        expenses.length === 0 && !expLoading ? (
          <EmptyState
            icon={DollarSign}
            title="Sin gastos registrados"
            description="Registrá los gastos de tus vehículos"
            actionLabel="Registrar gasto"
            onAction={() => router.push('/(app)/fuel/new-expense')}
          />
        ) : (
          <View className="gap-2">
            {expenses.map((expense) => (
              <View key={expense.id} className="rounded-xl border border-border bg-card p-4">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="font-semibold" numberOfLines={1}>{expense.title}</Text>
                    <Text variant="muted" className="text-xs">
                      {EXPENSE_CATEGORY_LABELS[expense.category]} · {format(expense.date, "d MMM yyyy", { locale: es })}
                    </Text>
                    <Text variant="muted" className="text-xs">{getVehicleName(expense.vehicleId)}</Text>
                  </View>
                  <Text className="font-bold">${expense.amount.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</Text>
                </View>
              </View>
            ))}
          </View>
        )
      )}
    </Screen>
  );
}
