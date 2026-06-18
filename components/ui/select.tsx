import * as React from 'react';
import { View, Pressable, Modal, FlatList, type ViewProps } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';
import { Text } from './text';

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
}

interface SelectProps<T extends string = string> extends ViewProps {
  label?: string;
  placeholder?: string;
  value?: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  error?: string;
}

function Select<T extends string = string>({
  label,
  placeholder = 'Seleccioná una opción',
  value,
  options,
  onChange,
  error,
  className,
  ...props
}: SelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const insets = useSafeAreaInsets();
  const selected = options.find((o) => o.value === value);

  return (
    <View className={cn('w-full gap-1.5', className)} {...props}>
      {label && (
        <Text variant="small" className="font-medium text-foreground">{label}</Text>
      )}
      <Pressable
        onPress={() => setOpen(true)}
        className={cn(
          'flex-row items-center min-h-12 rounded-lg border bg-transparent px-3',
          error ? 'border-destructive' : 'border-input',
        )}
      >
        <Text
          className={cn('flex-1 text-base', selected ? 'text-foreground' : 'text-muted-foreground')}
        >
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={18} color="#71717a" />
      </Pressable>
      {error && (
        <Text variant="small" className="text-destructive">{error}</Text>
      )}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end">
          <Pressable
            className="absolute inset-0 bg-black/50"
            onPress={() => setOpen(false)}
          />
          <View
            className="bg-background rounded-t-3xl px-4 pt-4"
            style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
          >
            <View className="w-12 h-1 rounded-full bg-border self-center mb-4" />
            {label && (
              <Text variant="h3" className="mb-3">{label}</Text>
            )}
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  className="flex-row items-center py-3.5 px-2 border-b border-border/50"
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text className={cn('flex-1 text-base', item.value === value ? 'text-primary font-semibold' : 'text-foreground')}>
                    {item.label}
                  </Text>
                  {item.value === value && <Check size={18} color="#18181b" />}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

export { Select };
