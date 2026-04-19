import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: 'artisan',
};

export default function ArtisanLayout() {
  return (
    <Stack initialRouteName="artisan" screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="artisan" 
      />
      <Stack.Screen 
        name="(portfolio)" 
      />
    </Stack>
  );
}


