import { Stack } from 'expo-router';

export default function CommitmentDetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="check-in" />
      <Stack.Screen name="supporters" />
      <Stack.Screen name="invite" />
      <Stack.Screen name="progress" />
      <Stack.Screen name="activity" />
    </Stack>
  );
}
