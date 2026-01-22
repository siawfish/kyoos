import Main from '@/components/navigation/Main';
import { createToastConfig } from '@/components/ui/Toast';
import { heightPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { persistor, store } from '@/store';
import { PortalProvider } from '@gorhom/portal';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

// Custom minimal black and white navigation themes
const LightNavigationTheme = {
  dark: false,
  colors: {
    primary: colors.light.black,
    background: colors.light.background,
    card: colors.light.white,
    text: colors.light.text,
    border: colors.light.grey,
    notification: colors.light.danger,
  },
  fonts: DefaultTheme.fonts,
};

const DarkNavigationTheme = {
  dark: true,
  colors: {
    primary: colors.dark.white,
    background: colors.dark.background,
    card: colors.dark.black,
    text: colors.dark.text,
    border: colors.dark.grey,
    notification: colors.dark.danger,
  },
  fonts: DefaultTheme.fonts,
};

// Wrapper component that uses theme hook inside Provider
function ThemedApp() {
  const theme = useAppTheme();

  return (
    <ThemeProvider value={theme === 'dark' ? DarkNavigationTheme : LightNavigationTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PortalProvider>
          <Main />
          <Toast 
            config={createToastConfig(theme)} 
            topOffset={heightPixel(60)}
            visibilityTime={8000}
          />
          <StatusBar style={theme} />
        </PortalProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Bold: require('../assets/fonts/maison-neue/fonnts.com-Maison_Neue_Bold.ttf'),
    Medium: require('../assets/fonts/maison-neue/fonnts.com-Maison_Neue_Book.ttf'),
    Regular: require('../assets/fonts/maison-neue/fonnts.com-Maison_Neue_Book.ttf'),
    Light: require('../assets/fonts/maison-neue/fonnts.com-Maison_Neue_Light.ttf'),
    ExtraBold: require('../assets/fonts/maison-neue/fonnts.com-Maison_Neue_Bold.ttf'),
    Thin: require('../assets/fonts/maison-neue/fonnts.com-Maison_Neue_Light.ttf'),
    ExtraLight: require('../assets/fonts/maison-neue/fonnts.com-Maison_Neue_Light.ttf'),
    Black: require('../assets/fonts/maison-neue/fonnts.com-Maison_Neue_Bold.ttf'),
    Mono: require('../assets/fonts/maison-neue/fonnts.com-Maison_Neue_Mono.ttf'),
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
        <ThemedApp />
      </PersistGate>
    </Provider>
  );
}
