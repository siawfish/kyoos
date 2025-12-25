import { SafeAreaView, type ViewProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedSafeAreaView({ 
  style, 
  lightColor=colors.light.background, 
  darkColor=colors.dark.background, 
  ...otherProps 
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <SafeAreaView style={[styles.safeAreaView, { backgroundColor }, style]} {...otherProps} />;
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
});
