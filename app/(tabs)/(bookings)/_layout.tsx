import { Stack } from 'expo-router';

export default function BookingsLayout() {
  return (
    <Stack
      initialRouteName="bookings"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="bookings" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
