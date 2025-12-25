import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="booking" 
      />
      <Stack.Screen 
        name="review-booking" 
      />
    </Stack>
  );
}


