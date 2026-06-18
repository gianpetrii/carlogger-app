import { Stack } from 'expo-router';
import { modalScreenOptions } from '@/constants/navigation';

export default function FuelLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new" options={modalScreenOptions} />
      <Stack.Screen name="new-expense" options={modalScreenOptions} />
    </Stack>
  );
}
