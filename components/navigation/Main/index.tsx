import { useInAppNotificationActions } from "@/hooks/useInAppNotificationActions";
import { selectHasSeenOnboarding, selectIsAuthenticated } from "@/redux/app/selector";
import { useAppSelector } from "@/store/hooks";
import { Stack } from "expo-router";
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Main() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const hasSeenOnboarding = useAppSelector(selectHasSeenOnboarding);
  useInAppNotificationActions();
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