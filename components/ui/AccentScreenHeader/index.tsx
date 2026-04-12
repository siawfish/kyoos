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

const ACCENT_WIDTH = widthPixel(40);
const ACCENT_HEIGHT = heightPixel(4);

export type AccentHeaderLayout = 'stack' | 'split' | 'accentToolbar';

/** Outer padding for the header block; pick the preset that matches each screen’s previous layout. */
export type AccentHeaderPaddingPreset =
  | 'none'
  /** Tab screens: horizontal 16, bottom 20 (messages list, settings root). */
  | 'consumerTab'
  /** Bookings-style hero: horizontal 16, margin bottom 24. */
  | 'consumerHero'
  /** Settings subpages with back row: horizontal 16, bottom 20. */
  | 'consumerSettingsNested'
  /** Pro tab hero: horizontal 20, top 32, margin bottom 24. */
  | 'proTabHero'
  /** Modal / sheet split header: horizontal 20, bottom 24. */
  | 'sheetSplit'
  /** AISearchFlow-style: horizontal 20, top 20, bottom 24. */
  | 'modalStack'
  /** Conversation detail: horizontal 16, bottom 20. */
  | 'conversationToolbar'
  /** Portfolio detail (consumer): horizontal 20, top 32, bottom 20. */
  | 'portfolioScreen';

export type AccentHeaderTitlePreset = 'default' | 'hero' | 'section' | 'detail';

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

const paddingPresetStyles: Record<AccentHeaderPaddingPreset, ViewStyle> = {
  none: {},
  consumerTab: {
    paddingHorizontal: widthPixel(16),
    paddingBottom: heightPixel(20),
  },
  consumerHero: {
    paddingHorizontal: widthPixel(16),
    marginBottom: heightPixel(24),
  },
  consumerSettingsNested: {
    paddingHorizontal: widthPixel(16),
    paddingBottom: heightPixel(20),
  },
  proTabHero: {
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(32),
    marginBottom: heightPixel(24),
  },
  sheetSplit: {
    paddingHorizontal: widthPixel(20),
    paddingBottom: heightPixel(24),
  },
  modalStack: {
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(20),
    paddingBottom: heightPixel(24),
  },
  conversationToolbar: {
    paddingHorizontal: widthPixel(16),
    paddingBottom: heightPixel(20),
  },
  portfolioScreen: {
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(32),
    paddingBottom: heightPixel(20),
  },
};

/** Label row: default (10 / 1.5) vs hero tab row (11 / 2) used on bookings. */
export type AccentHeaderLabelVariant = 'default' | 'hero';

export type AccentScreenHeaderProps = {
  layout?: AccentHeaderLayout;
  paddingPreset?: AccentHeaderPaddingPreset;
  /** When preset is insufficient. */
  containerStyle?: StyleProp<ViewStyle>;
  accentSpacing?: AccentBarSpacing;
  /** Override theme accent (e.g. sheet border color). */
  accentColor?: string;
  label?: string;
  labelVariant?: AccentHeaderLabelVariant;
  title?: ReactNode;
  subtitle?: ReactNode;
  titlePreset?: AccentHeaderTitlePreset;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  /** Stack: rendered after title/subtitle. Split / toolbar: same. */
  children?: ReactNode;
  /** Split layout: right column (e.g. close). */
  right?: ReactNode;
  /** accentToolbar: full-width row directly under accent (back row, actions). */
  afterAccent?: ReactNode;
  /** Space between toolbar row and following label (appearance screen). */
  toolbarBottomGap?: number;
  /** Override accent bar dimensions (e.g. thinner bar on review screen). */
  accentBarStyle?: StyleProp<ViewStyle>;
};

export function AccentScreenHeader({
  layout = 'stack',
  paddingPreset = 'consumerTab',
  containerStyle,
  accentSpacing: accentSpacingProp,
  accentColor,
  label,
  labelVariant = 'default',
  title,
  subtitle,
  titlePreset = 'default',
  titleStyle,
  subtitleStyle,
  labelStyle,
  children,
  right,
  afterAccent,
  toolbarBottomGap = heightPixel(16),
  accentBarStyle,
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

  const accentSpacing =
    accentSpacingProp ?? (layout === 'split' ? 'split' : 'default');

  const presetWrap = paddingPresetStyles[paddingPreset];

  const hasBodyBelowLabel = Boolean(
    (title != null && title !== '') ||
      (subtitle != null && subtitle !== '') ||
      children
  );

  const labelBase =
    labelVariant === 'hero' ? styles.labelHero : styles.labelDefault;

  const labelEl =
    label != null && label !== '' ? (
      <Text
        style={[
          labelBase,
          { color: labelColor },
          !hasBodyBelowLabel ? styles.labelNoMargin : null,
          labelStyle,
        ]}
      >
        {label}
      </Text>
    ) : null;

  const titleStyles =
    titlePreset === 'hero'
      ? styles.titleHero
      : titlePreset === 'section'
        ? styles.titleSection
        : titlePreset === 'detail'
          ? styles.titleDetail
          : styles.titleDefault;

  const titleEl =
    title != null && title !== '' ? (
      typeof title === 'string' || typeof title === 'number' ? (
        <Text style={[titleStyles, { color: textColor }, titleStyle]}>{title}</Text>
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

  const textStack = (
    <>
      {labelEl}
      {titleEl}
      {subtitleEl}
      {children}
    </>
  );

  const accentBlock = (
    <AccentBar color={accent} spacing={accentSpacing} style={accentBarStyle} />
  );

  if (layout === 'split') {
    return (
      <View style={[presetWrap, containerStyle]}>
        <View style={styles.splitRow}>
          <View style={styles.splitLeft}>
            {accentBlock}
            {labelEl}
            {titleEl}
            {subtitleEl}
            {children}
          </View>
          {right}
        </View>
      </View>
    );
  }

  if (layout === 'accentToolbar') {
    return (
      <View style={[presetWrap, containerStyle]}>
        {accentBlock}
        {afterAccent != null ? (
          <View style={[styles.toolbarRow, { marginBottom: toolbarBottomGap }]}>{afterAccent}</View>
        ) : null}
        {labelEl}
        {titleEl}
        {subtitleEl}
        {children}
      </View>
    );
  }

  return (
    <View style={[presetWrap, containerStyle]}>
      {accentBlock}
      {textStack}
    </View>
  );
}

const styles = StyleSheet.create({
  accentBarBase: {
    width: ACCENT_WIDTH,
    height: ACCENT_HEIGHT,
    alignSelf: 'flex-start',
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  splitLeft: {
    flex: 1,
    paddingRight: widthPixel(16),
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelDefault: {
    fontSize: fontPixel(10),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
    marginBottom: heightPixel(8),
  },
  labelHero: {
    fontSize: fontPixel(11),
    fontFamily: 'SemiBold',
    letterSpacing: 2,
    marginBottom: heightPixel(8),
  },
  labelNoMargin: {
    marginBottom: 0,
  },
  titleDefault: {
    fontSize: fontPixel(24),
    fontFamily: 'Bold',
    letterSpacing: -0.5,
    lineHeight: fontPixel(28),
  },
  titleDetail: {
    fontSize: fontPixel(28),
    fontFamily: 'Bold',
    letterSpacing: -0.5,
    marginBottom: heightPixel(12),
  },
  titleHero: {
    fontSize: fontPixel(36),
    fontFamily: 'Bold',
    letterSpacing: -1,
    marginBottom: heightPixel(4),
  },
  titleSection: {
    fontSize: fontPixel(14),
    fontFamily: 'Bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: fontPixel(14),
    fontFamily: 'Regular',
  },
});
