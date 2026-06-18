import * as React from 'react';
import { View, RefreshControl, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Wrench, Plus, ChevronDown } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { MaintenanceCard } from '@/components/ui/maintenance-card';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuthStore } from '@/store/useAuthStore';
import { useMaintenanceStore } from '@/store/useMaintenanceStore';
import { useVehiclesStore } from '@/store/useVehiclesStore';
import { cn } from '@/lib/utils';

export default function MaintenanceListScreen() {
  const { user } = useAuthStore();
  const { records, isLoading, fetchRecords } = useMaintenanceStore();
  const { vehicles } = useVehiclesStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = React.useState<string | null>(null);
  const [showFilter, setShowFilter] = React.useState(false);

  React.useEffect(() => {
    if (user) fetchRecords(user.id);
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) await fetchRecords(user.id);
    setRefreshing(false);
  };

  const filtered = selectedVehicleId
    ? records.filter((r) => r.vehicleId === selectedVehicleId)
    : records;

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <Screen
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="flex-row items-center justify-between">
        <Text variant="h1">Mantenimiento</Text>
        <Button
          size="sm"
          onPress={() => router.push('/(app)/maintenance/new')}
          className="gap-1"
        >
          <Plus size={16} color="white" />
          Nuevo
        </Button>
      </View>

      {/* Vehicle filter */}
      {vehicles.length > 0 && (
        <View>
          <Pressable
            onPress={() => setShowFilter(!showFilter)}
            className="flex-row items-center gap-2 rounded-lg border border-border px-3 py-2.5 bg-card"
          >
            <Text className={cn('flex-1 text-sm', selectedVehicleId ? 'text-foreground font-medium' : 'text-muted-foreground')}>
              {selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : 'Todos los vehículos'}
            </Text>
            <ChevronDown size={16} color="#71717a" />
          </Pressable>

          {showFilter && (
            <View className="rounded-lg border border-border bg-card mt-1 overflow-hidden">
              <Pressable
                className="px-3 py-3 border-b border-border/50"
                onPress={() => { setSelectedVehicleId(null); setShowFilter(false); }}
              >
                <Text className={cn('text-sm', !selectedVehicleId && 'font-semibold text-primary')}>
                  Todos los vehículos
                </Text>
              </Pressable>
              {vehicles.map((v) => (
                <Pressable
                  key={v.id}
                  className="px-3 py-3 border-b border-border/50 last:border-0"
                  onPress={() => { setSelectedVehicleId(v.id); setShowFilter(false); }}
                >
                  <Text className={cn('text-sm', selectedVehicleId === v.id && 'font-semibold text-primary')}>
                    {v.make} {v.model} {v.year}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}

      {filtered.length === 0 && !isLoading ? (
        <EmptyState
          icon={Wrench}
          title="Sin registros"
          description="Registrá el primer servicio o mantenimiento"
          actionLabel="Agregar service"
          onAction={() => router.push('/(app)/maintenance/new')}
        />
      ) : (
        <View className="gap-3">
          <Text variant="muted" className="text-xs">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</Text>
          {filtered.map((record) => (
            <MaintenanceCard
              key={record.id}
              record={record}
              onPress={() => router.push(`/(app)/maintenance/${record.id}`)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
