import { useEffect, useState } from 'react';
import { useAppTheme } from './use-app-theme';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useAppTheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
