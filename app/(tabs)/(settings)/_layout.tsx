import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="settings" 
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="profile"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="appearance"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="notifications"
        options={{
          headerShown: false
        }}
      />
    </Stack>
  );
}
