import { Stack } from 'expo-router';

export default function MessagingLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="messaging" 
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="[id]" 
        options={{
          headerShown: false
        }}
      />
    </Stack>
  );
}

