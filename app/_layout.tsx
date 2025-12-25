import 'react-native-reanimated';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalProvider } from '@gorhom/portal';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';
import { createToastConfig } from '@/constants/toast';
import { heightPixel } from '@/constants/normalize';
import Main from '@/components/navigation/Main';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { store, persistor } from '@/store';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Bold: require('../assets/fonts/CabinetGrotesk/CabinetGrotesk-Bold.otf'),
    Medium: require('../assets/fonts/CabinetGrotesk/CabinetGrotesk-Medium.otf'),
    Regular: require('../assets/fonts/CabinetGrotesk/CabinetGrotesk-Regular.otf'),
    Light: require('../assets/fonts/CabinetGrotesk/CabinetGrotesk-Light.otf'),
    ExtraBold: require('../assets/fonts/CabinetGrotesk/CabinetGrotesk-Extrabold.otf'),
    Thin: require('../assets/fonts/CabinetGrotesk/CabinetGrotesk-Thin.otf'),
    ExtraLight: require('../assets/fonts/CabinetGrotesk/CabinetGrotesk-Extralight.otf'),
    Black: require('../assets/fonts/CabinetGrotesk/CabinetGrotesk-Black.otf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <PortalProvider>
              <Main />
            </PortalProvider>
            <Toast 
              config={createToastConfig(colorScheme || 'light')} 
              topOffset={heightPixel(60)}
            />
            <StatusBar style="auto" />
          </GestureHandlerRootView>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
