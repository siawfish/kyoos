import { computeTabBarVisible } from '@/constants/navigation/tabBarVisibility';
import { usePathname, useSegments } from 'expo-router';

/** True when the floating tab bar is shown (same rules as app/(tabs)/_layout.tsx). */
export function useTabBarShown(): boolean {
  const pathname = usePathname();
  const segments = useSegments();
  return computeTabBarVisible(pathname, segments);
}
