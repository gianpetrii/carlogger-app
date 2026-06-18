import * as React from 'react';
import { View, ScrollView, Image, Alert, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Edit, Trash2, Car, Wrench, Fuel, DollarSign } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { VehicleCard } from '@/components/ui/vehicle-card';
import { MaintenanceCard } from '@/components/ui/maintenance-card';
import { EmptyState } from '@/components/ui/empty-state';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import { useMaintenanceStore } from '@/store/useMaintenanceStore';
import { useFuelStore } from '@/store/useFuelStore';
import { useExpensesStore } from '@/store/useExpensesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS, EXPENSE_CATEGORY_LABELS } from '@/constants/domain';
import { cn } from '@/lib/utils';

type Tab = 'info' | 'maintenance' | 'fuel' | 'expenses';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { vehicles, deleteVehicle } = useVehiclesStore();
  const { records, fetchRecords } = useMaintenanceStore();
  const { entries, fetchEntries } = useFuelStore();
  const { expenses, fetchExpenses } = useExpensesStore();
  const [activeTab, setActiveTab] = React.useState<Tab>('info');

  const vehicle = vehicles.find((v) => v.id === id);

  React.useEffect(() => {
    if (!user || !id) return;
    fetchRecords(user.id, id);
    fetchEntries(user.id, id);
    fetchExpenses(user.id, id);
  }, [user, id]);

  if (!vehicle) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text variant="muted">Vehículo no encontrado</Text>
      </View>
    );
  }

  const vehicleRecords = records.filter((r) => r.vehicleId === id);
  const vehicleEntries = entries.filter((e) => e.vehicleId === id);
  const vehicleExpenses = expenses.filter((e) => e.vehicleId === id);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar vehículo',
      `¿Estás seguro de eliminar ${vehicle.make} ${vehicle.model}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteVehicle(id);
            router.back();
          },
        },
      ],
    );
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'info', label: 'Info', icon: Car },
    { key: 'maintenance', label: 'Service', icon: Wrench },
    { key: 'fuel', label: 'Combustible', icon: Fuel },
    { key: 'expenses', label: 'Gastos', icon: DollarSign },
  ];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full">
          <ArrowLeft size={22} color="#18181b" />
        </Pressable>
        <Text variant="h3" numberOfLines={1} className="flex-1 text-center">
          {vehicle.make} {vehicle.model}
        </Text>
        <View className="flex-row gap-1">
          <Pressable
            onPress={() => router.push({ pathname: '/(app)/vehicles/edit', params: { id } })}
            className="w-10 h-10 items-center justify-center rounded-full"
          >
            <Edit size={20} color="#71717a" />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            className="w-10 h-10 items-center justify-center rounded-full"
          >
            <Trash2 size={20} color="#ef4444" />
          </Pressable>
        </View>
      </View>

      {/* Photo banner */}
      {vehicle.photos?.[0] ? (
        <Image
          source={{ uri: vehicle.photos[0] }}
          className="w-full h-48"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-32 bg-muted items-center justify-center">
          <Car size={48} color="#71717a" />
        </View>
      )}

      {/* Tab bar */}
      <View className="flex-row border-b border-border bg-background">
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 items-center py-3 border-b-2',
              activeTab === tab.key ? 'border-primary' : 'border-transparent',
            )}
          >
            <tab.icon
              size={18}
              color={activeTab === tab.key ? '#18181b' : '#71717a'}
            />
            <Text
              className={cn(
                'text-xs mt-0.5',
                activeTab === tab.key ? 'text-foreground font-semibold' : 'text-muted-foreground',
              )}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tab content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'info' && (
          <View className="gap-4">
            <View className="rounded-xl border border-border bg-card p-4 gap-3">
              <Text variant="h3">Detalles del vehículo</Text>
              <InfoRow label="Marca" value={vehicle.make} />
              <InfoRow label="Modelo" value={vehicle.model} />
              <InfoRow label="Año" value={String(vehicle.year)} />
              <InfoRow label="Color" value={vehicle.color ?? '—'} />
              <InfoRow label="Combustible" value={FUEL_TYPE_LABELS[vehicle.fuelType]} />
              {vehicle.engine && <InfoRow label="Motor" value={vehicle.engine} />}
              {vehicle.transmission && (
                <InfoRow label="Transmisión" value={TRANSMISSION_LABELS[vehicle.transmission]} />
              )}
              <InfoRow label="Kilometraje" value={`${vehicle.mileage.toLocaleString()} km`} />
              {vehicle.licensePlate && (
                <InfoRow label="Patente" value={vehicle.licensePlate} />
              )}
              {vehicle.vin && <InfoRow label="VIN" value={vehicle.vin} />}
              <InfoRow
                label="Registrado"
                value={format(vehicle.createdAt, "d 'de' MMMM yyyy", { locale: es })}
              />
            </View>
            {vehicle.notes && (
              <View className="rounded-xl border border-border bg-card p-4 gap-2">
                <Text variant="h3">Notas</Text>
                <Text variant="muted">{vehicle.notes}</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'maintenance' && (
          vehicleRecords.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="Sin servicios"
              description="Registrá el primer servicio de este vehículo"
              actionLabel="Agregar service"
              onAction={() => router.push({ pathname: '/(app)/maintenance/new', params: { vehicleId: id } })}
            />
          ) : (
            <View className="gap-3">
              {vehicleRecords.map((record) => (
                <MaintenanceCard
                  key={record.id}
                  record={record}
                  onPress={() => router.push(`/(app)/maintenance/${record.id}`)}
                />
              ))}
            </View>
          )
        )}

        {activeTab === 'fuel' && (
          vehicleEntries.length === 0 ? (
            <EmptyState
              icon={Fuel}
              title="Sin cargas"
              description="Registrá las cargas de combustible para calcular el consumo"
              actionLabel="Cargar combustible"
              onAction={() => router.push({ pathname: '/(app)/fuel/new', params: { vehicleId: id } })}
            />
          ) : (
            <View className="gap-2">
              {vehicleEntries.map((entry) => (
                <View key={entry.id} className="rounded-xl border border-border bg-card p-4">
                  <View className="flex-row justify-between items-start">
                    <View>
                      <Text className="font-semibold">{entry.liters.toFixed(1)} L</Text>
                      <Text variant="muted" className="text-xs">
                        {format(entry.date, "d MMM yyyy", { locale: es })} • {entry.mileage.toLocaleString()} km
                      </Text>
                    </View>
                    <Text className="font-medium">${entry.totalCost.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</Text>
                  </View>
                  <Text variant="muted" className="text-xs mt-1">
                    ${entry.pricePerLiter.toFixed(2)}/L{entry.gasStation ? ` • ${entry.gasStation}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          )
        )}

        {activeTab === 'expenses' && (
          vehicleExpenses.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="Sin gastos"
              description="Registrá los gastos de este vehículo para llevar el control"
              actionLabel="Registrar gasto"
              onAction={() => router.push('/(app)/fuel')}
            />
          ) : (
            <View className="gap-2">
              {vehicleExpenses.map((expense) => (
                <View key={expense.id} className="rounded-xl border border-border bg-card p-4">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-semibold" numberOfLines={1}>{expense.title}</Text>
                      <Text variant="muted" className="text-xs">
                        {EXPENSE_CATEGORY_LABELS[expense.category]} • {format(expense.date, "d MMM yyyy", { locale: es })}
                      </Text>
                    </View>
                    <Text className="font-medium">${expense.amount.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</Text>
                  </View>
                </View>
              ))}
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-1 border-b border-border/40 last:border-0">
      <Text variant="muted" className="text-sm">{label}</Text>
      <Text className="text-sm font-medium text-foreground">{value}</Text>
    </View>
  );
}
