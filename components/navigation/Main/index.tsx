import { useInAppNotificationActions } from "@/hooks/useInAppNotificationActions";
import { selectHasSeenOnboarding, selectIsAuthenticated } from "@/redux/app/selector";
import { useAppSelector } from "@/store/hooks";
import { Stack } from "expo-router";
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const trigger = notification.request.trigger as { type?: string; remoteMessage?: { notification: unknown } | null } | null;
    // Android data-only remote pushes have `remoteMessage.notification === null`.
    // Suppress them so the background task can present a local notification with title/body
    // and category action buttons instead of showing an empty banner.
    if (trigger?.type === 'push' && trigger?.remoteMessage?.notification === null) {
      return {
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
      };
    }
    return {
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

export default function Main() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const hasSeenOnboarding = useAppSelector(selectHasSeenOnboarding);
  useInAppNotificationActions();
  return (
    <Stack>
        <Stack.Protected guard={isAuthenticated}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
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