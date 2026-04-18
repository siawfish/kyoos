import { colors } from '@/constants/theme/colors';
import { useTabBarShown } from '@/hooks/use-tab-bar-shown';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import React, { useContext, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  SafeAreaView,
  type Edge,
  type SafeAreaViewProps,
} from 'react-native-safe-area-context';

export type ScreenLayoutPreset = 'tabRoot' | 'stack' | 'auth' | 'auto';

type ScreenLayoutProps = Omit<SafeAreaViewProps, 'edges'> & {
  /** tabRoot: main tab screens (floating tab bar). stack/auth: full bottom safe area. auto: from useTabBarShown. */
  preset?: ScreenLayoutPreset;
  lightColor?: string;
  darkColor?: string;
  footer?: React.ReactNode;
};

function resolvePreset(
  preset: ScreenLayoutPreset,
  tabBarShown: boolean
): 'tabRoot' | 'stack' {
  if (preset === 'auto') {
    return tabBarShown ? 'tabRoot' : 'stack';
  }
  if (preset === 'tabRoot') {
    return 'tabRoot';
  }
  return 'stack';
}

export function ScreenLayout({
  style,
  preset = 'auto',
  lightColor = colors.light.background,
  darkColor = colors.dark.background,
  footer,
  children,
  ...rest
}: ScreenLayoutProps) {
  const tabBarShown = useTabBarShown();
  const resolved = resolvePreset(preset, tabBarShown);
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;

  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background'
  );

  const edges: Edge[] = useMemo(() => {
    if (resolved === 'tabRoot') {
      return ['top', 'left', 'right'];
    }
    return ['top', 'left', 'right', 'bottom'];
  }, [resolved]);

  const bottomInsetForTabBar =
    resolved === 'tabRoot' ? tabBarHeight : 0;

  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor }, style]}
      {...rest}
    >
      <View style={[styles.inner, { paddingBottom: bottomInsetForTabBar }]}>
        {footer ? (
          <>
            <View style={styles.main}>{children}</View>
            {footer}
          </>
        ) : (
          children
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
  },
  main: {
    flex: 1,
  },
});
