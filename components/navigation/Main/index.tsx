import { selectHasSeenOnboarding, selectIsAuthenticated } from "@/redux/app/selector";
import { useAppSelector } from "@/store/hooks";
import { Stack } from "expo-router";

export default function Main() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const hasSeenOnboarding = useAppSelector(selectHasSeenOnboarding);
  return (
    <Stack>
        <Stack.Protected guard={isAuthenticated}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated && hasSeenOnboarding}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!hasSeenOnboarding}>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
    </Stack>
  );
}