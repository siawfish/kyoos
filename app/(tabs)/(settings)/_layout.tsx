import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: 'settings',
};

export default function SettingsLayout() {
  return (
    <Stack initialRouteName="settings">
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
        name="notification-settings"
        options={{
          headerShown: false
        }}
      />
    </Stack>
  );
}
