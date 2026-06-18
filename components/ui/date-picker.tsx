import * as React from 'react';
import { View, Pressable, Platform, Modal } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { Text } from './text';
import { Button } from './button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DatePickerProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  className?: string;
}

function DatePicker({ label, value, onChange, error, minimumDate, maximumDate, className }: DatePickerProps) {
  const [show, setShow] = React.useState(false);
  const [temp, setTemp] = React.useState(value);
  const insets = useSafeAreaInsets();

  const handleChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (selected) onChange(selected);
    } else {
      if (selected) setTemp(selected);
    }
  };

  return (
    <View className={cn('w-full gap-1.5', className)}>
      {label && (
        <Text variant="small" className="font-medium text-foreground">{label}</Text>
      )}
      <Pressable
        onPress={() => { setTemp(value); setShow(true); }}
        className={cn(
          'flex-row items-center min-h-12 rounded-lg border bg-transparent px-3',
          error ? 'border-destructive' : 'border-input',
        )}
      >
        <Text className="flex-1 text-base text-foreground">
          {format(value, "d 'de' MMMM 'de' yyyy", { locale: es })}
        </Text>
        <Calendar size={18} color="#71717a" />
      </Pressable>
      {error && (
        <Text variant="small" className="text-destructive">{error}</Text>
      )}

      {Platform.OS === 'android' && show && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={show} transparent animationType="slide" onRequestClose={() => setShow(false)}>
          <View className="flex-1 justify-end">
            <Pressable className="absolute inset-0 bg-black/50" onPress={() => setShow(false)} />
            <View
              className="bg-background rounded-t-3xl px-4 pt-4"
              style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
            >
              <View className="w-12 h-1 rounded-full bg-border self-center mb-4" />
              <DateTimePicker
                value={temp}
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                locale="es"
              />
              <View className="flex-row gap-3 mt-2">
                <Button variant="outline" onPress={() => setShow(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onPress={() => { onChange(temp); setShow(false); }} className="flex-1">
                  Confirmar
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

export { DatePicker };
