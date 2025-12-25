import { colors } from '@/constants/theme/colors';
import { fontPixel } from '@/constants/normalize';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack } from 'expo-router';

export default function SettingsLayout() {
  const tintColor = useThemeColor({
    light: colors.light.tint,
    dark: colors.dark.tint,
  }, 'tint')
  
  return (
    <Stack>
      <Stack.Screen 
        name="settings" 
        options={{
          headerLargeTitleShadowVisible: false,
          headerLargeTitle: true,
          headerBackVisible: true,
          headerLargeTitleStyle: {
            fontSize: fontPixel(32),
            fontFamily: 'Bold',
          },
          headerSearchBarOptions: {
            placeholder: "Search settings",
            tintColor: tintColor,
          },
          title: "Settings",
          contentStyle: {
            paddingTop: 0
          }
        }}
      />
      <Stack.Screen 
        name="appearance"
        options={{
          headerShown: true,
          headerTintColor: tintColor,
          title: "",
          headerLargeTitle: false,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen 
        name="notifications"
        options={{
          headerShown: true,
          headerTintColor: tintColor,
          title: "",
          headerLargeTitle: false,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen 
        name="profile"
        options={{
          headerShown: true,
          headerTintColor: tintColor,
          title: "",
          headerLargeTitle: false,
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
