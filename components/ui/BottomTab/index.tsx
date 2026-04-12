import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Feather icons — uniform stroke, flat geometric shapes (no filled MD blobs). */
const MenuItems = [
  {
    name: '(search)',
    title: 'Home',
    icon: 'home' as const,
  },
  {
    name: '(bookings)',
    title: 'Bookings',
    icon: 'calendar' as const,
  },
  {
    name: '(messaging)',
    title: 'Messages',
    icon: 'message-square' as const,
  },
  {
    name: 'notifications',
    title: 'Notifications',
    icon: 'bell' as const,
  },
  {
    name: '(settings)',
    title: 'Settings',
    icon: 'settings' as const,
  },
];

/** Stack root screen per tab — used to pop nested stacks when re-tapping the active tab. */
const TAB_STACK_ROOT: Partial<Record<string, string>> = {
  '(search)': 'index',
  '(bookings)': 'bookings',
  '(messaging)': 'messaging',
  '(settings)': 'settings',
};

type TabIconName = (typeof MenuItems)[number]['icon'];

interface TabItemProps {
  focused: boolean;
  icon: TabIconName;
  label: string;
  onPress: () => void;
  onLongPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
  iconColor: string;
  activeIconColor: string;
}

const TabItem = ({
  focused,
  icon,
  label,
  onPress,
  onLongPress,
  onLayout,
  iconColor,
  activeIconColor,
}: TabItemProps) => {
  const scale = useSharedValue(1);
  const iconEmphasis = useSharedValue(focused ? 1 : 0.55);
  const iconPop = useSharedValue(1);

  useEffect(() => {
    iconEmphasis.value = withTiming(focused ? 1 : 0.55, { duration: 220 });
    if (focused) {
      iconPop.value = withSequence(
        withTiming(1.07, { duration: 100 }),
        withSpring(1, { mass: 0.35, damping: 14, stiffness: 220 })
      );
    } else {
      iconPop.value = withTiming(1, { duration: 160 });
    }
  }, [focused, iconEmphasis, iconPop]);

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: iconEmphasis.value,
    transform: [{ scale: iconPop.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.94, {
      mass: 0.35,
      damping: 14,
      stiffness: 220,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      mass: 0.35,
      damping: 14,
      stiffness: 220,
    });
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLayout={onLayout}
      style={[styles.tabItem, focused ? styles.tabItemFocused : styles.tabItemUnfocused]}
      android_ripple={
        Platform.OS === 'android'
          ? { color: `${iconColor}33`, borderless: true }
          : undefined
      }
    >
      <Animated.View style={[styles.tabItemInner, animatedScaleStyle]}>
        <Animated.View style={iconAnimatedStyle}>
          <Feather
            name={icon}
            size={22}
            color={focused ? activeIconColor : iconColor}
          />
        </Animated.View>
        {focused && (
          <Animated.Text
            entering={FadeIn.delay(32).duration(180)}
            exiting={FadeOut.duration(120)}
            numberOfLines={1}
            style={[
              styles.tabLabel,
              { color: activeIconColor },
            ]}
          >
            {label}
          </Animated.Text>
        )}
      </Animated.View>
    </Pressable>
  );
};

interface TabItemLayout {
  x: number;
  width: number;
  contentX: number;
  contentWidth: number;
}

const SPRING_CONFIG = {
  mass: 0.45,
  damping: 18,
  stiffness: 160,
  overshootClamping: false,
};

export default function BottomTab({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  
  const isDark = theme === 'dark';
  
  // Tab bar colors - properly themed for dark mode
  const islandBg = isDark ? colors.dark.background : colors.light.white;
  const iconColor = isDark ? colors.dark.secondary : colors.light.secondary;
  const activeIconColor = isDark ? colors.dark.background : colors.light.white;
  const activeBgColor = isDark ? colors.dark.tint : colors.light.tint;
  const borderColor = isDark ? colors.dark.tint : colors.light.grey;

  // Track tab layouts
  const tabLayouts = useRef<TabItemLayout[]>([]);
  const [layoutsReady, setLayoutsReady] = useState(false);
  
  // Animated values for sliding background
  const bgX = useSharedValue(0);
  const bgWidth = useSharedValue(0);

  // Update background position when tab changes
  useEffect(() => {
    if (layoutsReady && tabLayouts.current[state.index]) {
      const layout = tabLayouts.current[state.index];
      // Position background at the center of the tab, accounting for content padding
      const contentPadding = widthPixel(10);
      const bgPadding = widthPixel(0); // Additional padding for background container
      bgX.value = withSpring(layout.x + contentPadding + bgPadding, SPRING_CONFIG);
      bgWidth.value = withSpring(layout.width - (contentPadding * 2) - (bgPadding * 2), SPRING_CONFIG);
    }
  }, [state.index, layoutsReady, bgX, bgWidth]);

  const handleTabLayout = useCallback((index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    tabLayouts.current[index] = { 
      x, 
      width,
      contentX: x + widthPixel(16),
      contentWidth: width - (widthPixel(16) * 2),
    };
    
    // Check if all layouts are ready
    if (tabLayouts.current.filter(Boolean).length === state.routes.length) {
      setLayoutsReady(true);
      // Initialize background position
      const currentLayout = tabLayouts.current[state.index];
      if (currentLayout) {
        const contentPadding = widthPixel(10);
        const bgPadding = widthPixel(0); // Additional padding for background container
        bgX.value = currentLayout.x + contentPadding + bgPadding;
        bgWidth.value = currentLayout.width - (contentPadding * 2) - (bgPadding * 2);
      }
    }
  }, [state.routes.length, state.index, bgX, bgWidth]);

  const animatedBgStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bgX.value }],
    width: bgWidth.value,
  }));

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: islandBg,
          borderTopColor: borderColor,
          paddingBottom: insets.bottom > 0 ? insets.bottom : heightPixel(12),
        },
      ]}
    >
      {/* Sliding background */}
      {layoutsReady && (
        <Animated.View
          style={[
            styles.slidingBg,
            { backgroundColor: activeBgColor },
            animatedBgStyle,
          ]}
        />
      )}
      
      {/* Tab items */}
      <View style={styles.tabItemsContainer}>
        {state.routes.map((route, index) => {
          const menuItem = MenuItems.find(
            (item) => item.name === route.name
          ) || MenuItems[0];
          
          const label = menuItem.title;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              return;
            }

            if (!isFocused) {
              if (Platform.OS === 'ios') {
                Haptics.selectionAsync();
              } else {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              navigation.navigate(route.name, route.params);
              return;
            }

            const rootScreen = TAB_STACK_ROOT[route.name];
            if (rootScreen) {
              navigation.navigate(route.name, {
                screen: rootScreen,
                params: {},
              });
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              focused={isFocused}
              icon={menuItem.icon}
              label={label}
              onPress={onPress}
              onLongPress={onLongPress}
              onLayout={(e) => handleTabLayout(index, e)}
              iconColor={iconColor}
              activeIconColor={activeIconColor}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: heightPixel(12),
    paddingHorizontal: widthPixel(16),
    borderTopWidth: 1,
  },
  tabItemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: heightPixel(8),
  },
  tabItemFocused: {
    flex: 2,
  },
  tabItemUnfocused: {
    flex: 1,
  },
  tabItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: heightPixel(8),
    paddingVertical: heightPixel(10),
    paddingHorizontal: widthPixel(16),
  },
  tabLabel: {
    fontFamily: 'Medium',
    fontSize: fontPixel(12),
    flexShrink: 0,
  },
  slidingBg: {
    position: 'absolute',
    top: heightPixel(12) + heightPixel(8),
    height: heightPixel(10) * 2 + 22, // paddingVertical * 2 + icon size
    left: widthPixel(16),
    borderRadius: 0,
  },
});