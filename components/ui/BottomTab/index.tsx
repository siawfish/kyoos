import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MenuItems = [
  {
    name: '(search)',
    title: 'Home',
    icon: 'home',
    iconOutline: 'home-outline'
  },
  {
    name: '(bookings)',
    title: 'Bookings',
    icon: 'calendar-check',
    iconOutline: 'calendar-outline'
  },
  {
    name: '(messaging)',
    title: 'Messages',
    icon: 'chat',
    iconOutline: 'chat-outline'
  },
  {
    name: 'notifications',
    title: 'Notifications',
    icon: 'bell',
    iconOutline: 'bell-outline'
  },
  {
    name: '(settings)',
    title: 'Settings',
    icon: 'cog',
    iconOutline: 'cog-outline'
  }
];

interface TabItemProps {
  focused: boolean;
  icon: string;
  iconOutline: string;
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
  iconOutline,
  label,
  onPress,
  onLongPress,
  onLayout,
  iconColor,
  activeIconColor,
}: TabItemProps) => {
  const scale = useSharedValue(1);

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, {
      mass: 0.3,
      damping: 10,
      stiffness: 200,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      mass: 0.3,
      damping: 10,
      stiffness: 200,
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
    >
      <Animated.View style={[styles.tabItemInner, animatedScaleStyle]}>
        <MaterialCommunityIcons
          name={focused ? (icon as any) : (iconOutline as any)}
          size={22}
          color={focused ? activeIconColor : iconColor}
        />
        {focused && (
          <Animated.Text
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(100)}
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
  mass: 0.5,
  damping: 12,
  stiffness: 100,
  overshootClamping: false,
};

export default function BottomTab({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  
  // Inverted island colors
  const islandBg = colorScheme === 'dark' ? colors.dark.background : colors.light.white;
  const iconColor = colorScheme === 'dark' ? colors.light.secondary : colors.dark.secondary;
  const activeIconColor = colorScheme === 'dark' ? colors.dark.background : colors.light.white;
  const activeBgColor = colorScheme === 'dark' ? colors.light.white : colors.dark.background;
  const borderColor = colorScheme === 'dark' ? colors.dark.grey : colors.light.grey;

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

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
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
              iconOutline={menuItem.iconOutline}
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