import { Stack } from 'expo-router';

export default function SearchLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="results" />
      <Stack.Screen name="(artisan)" />
      <Stack.Screen name="portfolio" />
      <Stack.Screen name="(booking)" />
      <Stack.Screen name="location" />
    </Stack>
  );
}
