import { Stack } from 'expo-router';

export default function MessagingLayout() {
  return (
    <Stack initialRouteName="messaging" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="messaging" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="(bookings)" />
    </Stack>
  );
}

