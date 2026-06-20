import { Stack } from 'expo-router';

export default function SupportingDetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="check-ins/[checkInId]" />
    </Stack>
  );
}
