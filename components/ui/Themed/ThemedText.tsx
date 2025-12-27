import { fontPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: fontPixel(16),
    fontFamily: 'Regular',
  },
  defaultSemiBold: {
    fontSize: fontPixel(16),
    fontFamily: 'Bold',
  },
  title: {
    fontSize: fontPixel(32),
    fontFamily: 'ExtraBold',
  },
  subtitle: {
    fontSize: fontPixel(18),
    fontFamily: 'Medium',
    fontWeight: 400,
  },
  link: {
    fontSize: fontPixel(16),
    color: colors.light.tint,
    fontFamily: 'Light',
  },
});
