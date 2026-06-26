import * as React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { ChevronDown, ChevronUp, Info } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { findCatalogSpecs } from '@/lib/vehicleSpecs';
import { isUniformRow, resolveSpecCell, type VehicleSpecRow } from '@/constants/vehicleSpecs';
import { normalizeTrim } from '@/lib/vehicleCatalog';
import type { Vehicle } from '@/types';
import { cn } from '@/lib/utils';

interface VehicleSpecsPanelProps {
  vehicle: Vehicle;
}

function VehicleSpecsPanel({ vehicle }: VehicleSpecsPanelProps) {
  const [open, setOpen] = React.useState(false);
  const catalog = findCatalogSpecs(vehicle.make, vehicle.model, vehicle.year);

  const activeTrim = vehicle.trim ? normalizeTrim(vehicle.trim) : null;
  const highlightedVersion =
    activeTrim && catalog?.versions.some((v) => v.toLowerCase() === activeTrim.toLowerCase())
      ? catalog.versions.find((v) => v.toLowerCase() === activeTrim.toLowerCase())
      : null;

  return (
    <View className="rounded-xl border border-border bg-card overflow-hidden">
      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="flex-row items-center justify-between p-4"
        accessibilityLabel="Ficha técnica"
      >
        <View className="flex-1 gap-0.5 pr-2">
          <Text variant="h3">Ficha técnica</Text>
          {catalog && !open && (
            <Text variant="muted" className="text-xs" numberOfLines={2}>
              {catalog.versions.length} versiones · {catalog.displayName}
            </Text>
          )}
        </View>
        {open ? (
          <ChevronUp size={20} color="#71717a" />
        ) : (
          <ChevronDown size={20} color="#71717a" />
        )}
      </Pressable>

      {open && (
        <View className="border-t border-border px-4 pb-4 gap-4 pt-3">
          {catalog ? (
            <>
              <View className="gap-1">
                <Text className="text-base font-semibold">{catalog.displayName}</Text>
                <Text variant="muted" className="text-sm">
                  {catalog.subtitle}
                </Text>
                {highlightedVersion && (
                  <Text className="text-xs font-medium text-primary">
                    Tu versión: {highlightedVersion}
                  </Text>
                )}
              </View>

              {catalog.sections.map((section) => (
                <SpecTable
                  key={section.title}
                  title={section.title}
                  versions={catalog.versions}
                  rows={section.rows}
                  highlightedVersion={highlightedVersion}
                />
              ))}

              <View className="flex-row items-start gap-2 rounded-lg bg-muted/60 px-3 py-2.5">
                <Info size={14} color="#71717a" style={{ marginTop: 2 }} />
                <Text variant="muted" className="flex-1 text-xs leading-5">
                  Valores de referencia por versión. Pueden variar según año de fabricación. No
                  reemplazan el manual del fabricante.
                </Text>
              </View>
            </>
          ) : (
            <View className="rounded-lg border border-dashed border-border px-3 py-5 gap-2">
              <Text variant="muted" className="text-center text-sm">
                Todavía no tenemos ficha técnica para {vehicle.make} {vehicle.model}.
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function SpecTable({
  title,
  versions,
  rows,
  highlightedVersion,
}: {
  title: string;
  versions: string[];
  rows: VehicleSpecRow[];
  highlightedVersion: string | null | undefined;
}) {
  const labelWidth = 108;
  const colWidth = 88;

  return (
    <View className="gap-2">
      <Text className="text-sm font-bold uppercase tracking-wide text-foreground">{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="overflow-hidden rounded-lg border border-border">
          <View className="flex-row border-b border-border bg-muted/50">
            <View style={{ width: labelWidth }} className="border-r border-border px-2 py-2">
              <Text variant="muted" className="text-[10px] font-semibold uppercase">
                Especificación
              </Text>
            </View>
            {versions.map((version) => (
              <View
                key={version}
                style={{ width: colWidth }}
                className={cn(
                  'border-r border-border px-1.5 py-2 last:border-r-0',
                  highlightedVersion === version && 'bg-primary/10',
                )}
              >
                <Text
                  className={cn(
                    'text-[10px] font-semibold text-center',
                    highlightedVersion === version ? 'text-primary' : 'text-foreground',
                  )}
                  numberOfLines={2}
                >
                  {version}
                </Text>
              </View>
            ))}
          </View>

          {rows.map((row, index) => {
            const uniform = isUniformRow(row, versions);
            if (uniform) {
              const cell = resolveSpecCell(row, versions[0]);
              return (
                <View
                  key={row.label}
                  className={cn(
                    'flex-row border-b border-border/50 last:border-b-0',
                    index % 2 === 0 ? 'bg-muted/20' : 'bg-card',
                  )}
                >
                  <View
                    style={{ width: labelWidth }}
                    className="border-r border-border/50 px-2 py-2 justify-center"
                  >
                    <Text variant="muted" className="text-xs leading-4">
                      {row.label}
                    </Text>
                  </View>
                  <View
                    style={{ width: colWidth * versions.length }}
                    className="items-center justify-center px-2 py-2.5"
                  >
                    <Text className="text-xs leading-4 text-center">{cell}</Text>
                  </View>
                </View>
              );
            }

            return (
              <View
                key={row.label}
                className={cn(
                  'flex-row border-b border-border/50 last:border-b-0',
                  index % 2 === 0 ? 'bg-muted/20' : 'bg-card',
                )}
              >
                <View
                  style={{ width: labelWidth }}
                  className="border-r border-border/50 px-2 py-2 justify-center"
                >
                  <Text variant="muted" className="text-xs leading-4">
                    {row.label}
                  </Text>
                </View>
                {versions.map((version) => (
                  <View
                    key={version}
                    style={{ width: colWidth }}
                    className={cn(
                      'border-r border-border/50 px-1.5 py-2 justify-center last:border-r-0',
                      highlightedVersion === version && 'bg-primary/5',
                    )}
                  >
                    <Text className="text-xs text-center leading-4">
                      {resolveSpecCell(row, version)}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

export { VehicleSpecsPanel };
