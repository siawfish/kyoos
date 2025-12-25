import { Stack } from 'expo-router';

export default function SearchLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="results" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="(artisan)" 
        options={{
          headerShown: false,
          header: () => null
        }}
      />
      <Stack.Screen 
        name="portfolio" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="(booking)" 
        options={{
            header: () => null
        }}
      />
      <Stack.Screen 
        name="location" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="ai-search" 
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
