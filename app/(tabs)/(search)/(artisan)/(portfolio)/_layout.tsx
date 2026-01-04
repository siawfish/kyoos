import { Stack } from 'expo-router';

export default function PortfolioLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen 
                name="[id]" 
            />
            <Stack.Screen 
                name="comment" 
            />
        </Stack>
    );
}


