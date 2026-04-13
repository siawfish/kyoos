import { heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

type ScreenFooterProps = ViewProps & {
  children: React.ReactNode;
  /** When true, no top border (e.g. auth step toolbars). */
  hideBorder?: boolean;
};

export function ScreenFooter({
  style,
  children,
  hideBorder = false,
  ...rest
}: ScreenFooterProps) {
  const borderColor = useThemeColor(
    { light: colors.light.black, dark: colors.dark.white },
    'text'
  );

  return (
    <View
      style={[
        styles.footer,
        !hideBorder && { borderTopColor: borderColor },
        hideBorder && styles.footerNoBorder,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: heightPixel(16),
    paddingBottom: heightPixel(16),
    paddingHorizontal: widthPixel(0),
  },
  footerNoBorder: {
    borderTopWidth: 0,
    paddingTop: heightPixel(0),
  },
});
