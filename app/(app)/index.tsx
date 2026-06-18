import * as React from 'react';
import { View, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Car, Wrench, AlertTriangle, DollarSign } from 'lucide-react-native';
import { format, startOfMonth, endOfMonth, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui/text';
import { StatCard } from '@/components/ui/stat-card';
import { VehicleCard } from '@/components/ui/vehicle-card';
import { MaintenanceCard } from '@/components/ui/maintenance-card';
import { useAuthStore } from '@/store/useAuthStore';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import { useMaintenanceStore } from '@/store/useMaintenanceStore';
import { useRemindersStore } from '@/store/useRemindersStore';
import { useExpensesStore } from '@/store/useExpensesStore';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { vehicles, fetchVehicles } = useVehiclesStore();
  const { records, fetchRecords } = useMaintenanceStore();
  const { reminders, fetchReminders } = useRemindersStore();
  const { expenses, fetchExpenses } = useExpensesStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = React.useCallback(async () => {
    if (!user) return;
    await Promise.all([
      fetchVehicles(user.id),
      fetchRecords(user.id),
      fetchReminders(user.id),
      fetchExpenses(user.id),
    ]);
  }, [user, fetchVehicles, fetchRecords, fetchReminders, fetchExpenses]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const now = Date.now();
  const monthStart = startOfMonth(now).getTime();
  const monthEnd = endOfMonth(now).getTime();

  const upcomingReminders = reminders.filter(
    (r) => !r.isCompleted && r.targetDate && r.targetDate > now,
  );
  const overdueReminders = reminders.filter(
    (r) => !r.isCompleted && r.targetDate && r.targetDate <= now,
  );
  const monthExpenses = expenses.filter((e) => e.date >= monthStart && e.date <= monthEnd);
  const totalMonthExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const recentMaintenance = records.slice(0, 3);
  const urgentReminders = [...overdueReminders, ...upcomingReminders].slice(0, 3);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <Screen
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="gap-1 mb-2">
        <Text variant="muted">{greeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</Text>
        <Text variant="h1">Panel principal</Text>
      </View>

      {/* Stats grid */}
      <View className="flex-row gap-3">
        <StatCard
          title="Vehículos"
          value={vehicles.length}
          icon={Car}
          iconBgClass="bg-blue-100 dark:bg-blue-950"
          iconColor="#3b82f6"
          className="flex-1"
        />
        <StatCard
          title="Services"
          value={upcomingReminders.length + overdueReminders.length}
          icon={Wrench}
          iconBgClass="bg-green-100 dark:bg-green-950"
          iconColor="#22c55e"
          className="flex-1"
        />
      </View>

      <View className="flex-row gap-3">
        <StatCard
          title="Vencidos"
          value={overdueReminders.length}
          icon={AlertTriangle}
          iconBgClass="bg-red-100 dark:bg-red-950"
          iconColor="#ef4444"
          className="flex-1"
        />
        <StatCard
          title="Gastos del mes"
          value={`$${totalMonthExpenses.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`}
          description={format(now, 'MMMM yyyy', { locale: es })}
          icon={DollarSign}
          iconBgClass="bg-purple-100 dark:bg-purple-950"
          iconColor="#a855f7"
          className="flex-1"
        />
      </View>

      {/* Mis vehículos */}
      {vehicles.length > 0 && (
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text variant="h3">Mis vehículos</Text>
            <Text
              variant="small"
              className="text-primary"
              onPress={() => router.push('/(app)/vehicles')}
            >
              Ver todos
            </Text>
          </View>
          {vehicles.slice(0, 3).map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPress={() => router.push(`/(app)/vehicles/${vehicle.id}`)}
            />
          ))}
        </View>
      )}

      {/* Recordatorios urgentes */}
      {urgentReminders.length > 0 && (
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text variant="h3">Recordatorios</Text>
            <Text
              variant="small"
              className="text-primary"
              onPress={() => router.push('/(app)/maintenance')}
            >
              Ver todos
            </Text>
          </View>
          {urgentReminders.map((reminder) => {
            const isOverdue = reminder.targetDate && reminder.targetDate <= now;
            return (
              <View
                key={reminder.id}
                className={`rounded-xl border p-4 gap-1 ${isOverdue ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950' : 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950'}`}
              >
                <View className="flex-row items-center gap-2">
                  <AlertTriangle size={16} color={isOverdue ? '#ef4444' : '#f59e0b'} />
                  <Text className="font-semibold text-foreground flex-1" numberOfLines={1}>
                    {reminder.title}
                  </Text>
                </View>
                {reminder.targetDate && (
                  <Text variant="muted" className="text-xs ml-6">
                    {isOverdue ? 'Venció el ' : 'Vence el '}
                    {format(reminder.targetDate, "d 'de' MMMM", { locale: es })}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Últimos mantenimientos */}
      {recentMaintenance.length > 0 && (
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text variant="h3">Últimos services</Text>
            <Text
              variant="small"
              className="text-primary"
              onPress={() => router.push('/(app)/maintenance')}
            >
              Ver todos
            </Text>
          </View>
          {recentMaintenance.map((record) => (
            <MaintenanceCard
              key={record.id}
              record={record}
              onPress={() => router.push(`/(app)/maintenance/${record.id}`)}
            />
          ))}
        </View>
      )}

      {vehicles.length === 0 && (
        <View className="rounded-xl border border-dashed border-border p-8 items-center gap-3 mt-4">
          <Car size={36} color="#71717a" />
          <Text variant="h3" className="text-center">Agregá tu primer vehículo</Text>
          <Text variant="muted" className="text-center text-sm">
            Comenzá a llevar el registro de mantenimiento, combustible y gastos
          </Text>
          <Text
            className="text-primary font-medium"
            onPress={() => router.push('/(app)/vehicles/new')}
          >
            Agregar vehículo →
          </Text>
        </View>
      )}
    </Screen>
  );
}
