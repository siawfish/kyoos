import BackButton from '@/components/ui/BackButton';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { type ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
  type StyleProp,
  type TextStyle,
} from 'react-native';

const ACCENT_WIDTH = widthPixel(40);
const ACCENT_HEIGHT = heightPixel(4);

export function AccentBar() {
  const theme = useAppTheme();
  const isDark = theme === 'dark';
  const color = isDark ? colors.dark.white : colors.light.black;
  return (
    <View
      style={[
        styles.accentBarBase,
        { backgroundColor: color },
      ]}
    />
  );
}

export type AccentScreenHeaderProps = {
  readonly onBackPress?: () => void;
  readonly title?: string | ReactNode;
  readonly subtitle?: string | ReactNode;
  readonly titleStyle?: StyleProp<TextStyle>;
  readonly subtitleStyle?: StyleProp<TextStyle>;
  readonly renderRight?: () => ReactNode;
  readonly containerStyle?: StyleProp<ViewStyle>;
};

export function AccentScreenHeader({
  onBackPress,
  title,
  subtitle,
  titleStyle,
  subtitleStyle,
  renderRight,
  containerStyle,
}: AccentScreenHeaderProps) {
  const labelColor = useThemeColor(
    { light: colors.light.secondary, dark: colors.dark.secondary },
    'text'
  );
  const textColor = useThemeColor(
    { light: colors.light.text, dark: colors.dark.text },
    'text'
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.headerContainer}>
        <View style={styles.accentContainer}>
          <AccentBar />
          {
            onBackPress && <BackButton onPress={onBackPress} iconName="arrow-left" />
          }
          {
            typeof title === 'string' ? (
              <Text style={[styles.titleDefault, { color: textColor }, titleStyle]}>{title}</Text>
            ) : (
              title
            )
          }
          {
            typeof subtitle === 'string' ? (
              <Text style={[styles.subtitle, { color: labelColor }, subtitleStyle]}>{subtitle}</Text>
            ) : (
              subtitle
            )
          }
        </View>
        {renderRight?.()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: widthPixel(16),
    gap: heightPixel(16), 
    paddingBottom: heightPixel(20),
  },
  headerContainer: {
    flexDirection: 'row',
    gap: widthPixel(16),
    justifyContent: 'space-between',
  },
  accentContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: widthPixel(16),
  },
  accentBarBase: {
    width: ACCENT_WIDTH,
    height: ACCENT_HEIGHT,
    alignSelf: 'flex-start',
  },
  titleDefault: {
    fontSize: fontPixel(24),
    fontFamily: 'Bold',
    letterSpacing: -0.5,
    lineHeight: fontPixel(28),
  },
  subtitle: {
    fontSize: fontPixel(14),
    fontFamily: 'Regular',
  },
});
