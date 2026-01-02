import { useColorScheme } from 'react-native';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/redux/app/selector';
import { Theme } from '@/redux/app/types';

/**
 * Returns the effective theme based on user settings.
 * If theme is SYSTEM, returns device color scheme.
 * Otherwise, returns the user's selected theme (LIGHT or DARK).
 * @returns 'light' | 'dark'
 */
export function useAppTheme(): 'light' | 'dark' {
  const user = useAppSelector(selectUser);
  const deviceColorScheme = useColorScheme();
  
  // If no user is logged in, fall back to device theme
  if (!user?.settings?.theme) {
    return deviceColorScheme === 'dark' ? 'dark' : 'light';
  }
  
  // If theme is SYSTEM, use device color scheme
  if (user.settings.theme === Theme.SYSTEM) {
    return deviceColorScheme === 'dark' ? 'dark' : 'light';
  }
  
  // Otherwise, use user's selected theme
  return user.settings.theme === Theme.DARK ? 'dark' : 'light';
}

