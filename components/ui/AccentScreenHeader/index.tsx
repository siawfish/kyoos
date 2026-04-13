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
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import HeaderNotificationButton from './HeaderNotificationButton';

const ACCENT_WIDTH = widthPixel(40);
const ACCENT_HEIGHT = heightPixel(4);

export type AccentBarSpacing = 'default' | 'split' | 'tight' | 'section' | 'loose';

export type AccentBarProps = {
  color?: string;
  spacing?: AccentBarSpacing;
  style?: StyleProp<ViewStyle>;
};

const accentSpacingToMargin = (s: AccentBarSpacing) => {
  switch (s) {
    case 'split':
      return heightPixel(16);
    case 'tight':
      return heightPixel(10);
    case 'section':
      return heightPixel(12);
    case 'loose':
      return heightPixel(24);
    default:
      return heightPixel(20);
  }
};

/** Shared 40×4 accent bar (also used by section blocks that only need the bar). */
export function AccentBar({ color, spacing = 'default', style }: AccentBarProps) {
  const theme = useAppTheme();
  const isDark = theme === 'dark';
  const fallback = isDark ? colors.dark.white : colors.light.black;
  return (
    <View
      style={[
        styles.accentBarBase,
        { backgroundColor: color ?? fallback, marginBottom: accentSpacingToMargin(spacing) },
        style,
      ]}
    />
  );
}

export type AccentScreenHeaderProps = {
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  accentSpacing?: AccentBarSpacing;
  accentColor?: string;
  accentBarStyle?: StyleProp<ViewStyle>;
  onBackPress?: () => void;
  /** Replaces the default back control when set (pass `null` to omit). */
  backButton?: ReactNode;
  /**
   * Right side of the toolbar row. `undefined` with a back button shows the default notifications control.
   * Pass `null` for no trailing control, or a node to replace the default (e.g. close, calendar).
   */
  trailing?: ReactNode | null;
  title?: ReactNode;
  subtitle?: ReactNode;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  /** Space below the toolbar row when present. */
  toolbarBottomGap?: number;
};

export function AccentScreenHeader({
  style,
  containerStyle,
  accentSpacing = 'default',
  accentColor,
  accentBarStyle,
  onBackPress,
  backButton,
  trailing,
  title,
  subtitle,
  titleStyle,
  subtitleStyle,
  toolbarBottomGap: toolbarBottomGapProp,
}: AccentScreenHeaderProps) {
  const theme = useAppTheme();
  const isDark = theme === 'dark';
  const accent = accentColor ?? (isDark ? colors.dark.white : colors.light.black);
  const labelColor = useThemeColor(
    { light: colors.light.secondary, dark: colors.dark.secondary },
    'text'
  );
  const textColor = useThemeColor(
    { light: colors.light.text, dark: colors.dark.text },
    'text'
  );

  const leftToolbar: ReactNode =
    backButton !== undefined
      ? backButton
      : onBackPress != null
        ? <BackButton onPress={onBackPress} iconName="arrow-left" />
        : null;

  const hasLeft = leftToolbar != null;
  const showToolbar = hasLeft || trailing !== undefined;

  let rightToolbar: ReactNode = null;
  if (showToolbar) {
    if (trailing !== undefined) {
      rightToolbar = trailing;
    } else if (hasLeft) {
      rightToolbar = <HeaderNotificationButton />;
    }
  }

  const resolvedToolbarBottomGap =
    toolbarBottomGapProp !== undefined
      ? toolbarBottomGapProp
      : showToolbar && (title != null || subtitle != null)
        ? heightPixel(16)
        : 0;

  const titleEl =
    title != null && title !== '' ? (
      typeof title === 'string' || typeof title === 'number' ? (
        <Text style={[styles.titleDefault, { color: textColor }, titleStyle]}>{title}</Text>
      ) : (
        title
      )
    ) : null;

  const subtitleEl =
    subtitle != null && subtitle !== '' ? (
      typeof subtitle === 'string' || typeof subtitle === 'number' ? (
        <Text style={[styles.subtitle, { color: labelColor }, subtitleStyle]}>{subtitle}</Text>
      ) : (
        subtitle
      )
    ) : null;

  return (
    <View style={[style, containerStyle]}>
      <AccentBar color={accent} spacing={accentSpacing} style={accentBarStyle} />
      {showToolbar ? (
        <View style={[styles.toolbarRow, { marginBottom: resolvedToolbarBottomGap }]}>
          {hasLeft ? (
            <View style={styles.toolbarLeft}>{leftToolbar}</View>
          ) : (
            <View style={styles.toolbarFlexSpacer} />
          )}
          <View style={styles.toolbarRight}>{rightToolbar}</View>
        </View>
      ) : null}
      {titleEl}
      {subtitleEl}
    </View>
  );
}

const styles = StyleSheet.create({
  accentBarBase: {
    width: ACCENT_WIDTH,
    height: ACCENT_HEIGHT,
    alignSelf: 'flex-start',
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  toolbarLeft: {
    minHeight: heightPixel(44),
    justifyContent: 'center',
  },
  toolbarRight: {
    minHeight: heightPixel(44),
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  toolbarFlexSpacer: {
    flex: 1,
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
