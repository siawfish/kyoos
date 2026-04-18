import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SafeAreaView, type SafeAreaViewProps } from 'react-native-safe-area-context';

export type ThemedSafeAreaViewProps = SafeAreaViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedSafeAreaView({
  style,
  lightColor = colors.light.background,
  darkColor = colors.dark.background,
  ...otherProps
}: ThemedSafeAreaViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background'
  );

  return <SafeAreaView style={[{ backgroundColor }, style]} {...otherProps} />;
}
