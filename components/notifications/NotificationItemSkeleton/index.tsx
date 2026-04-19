import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const NotificationItemSkeleton = () => {
  const opacity = useSharedValue(0.3);
  const theme = useAppTheme();
  const isDark = theme === 'dark';

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 900 }),
        withTiming(0.3, { duration: 900 }),
      ),
      -1,
      true,
    );
  }, [opacity]);

  const accentColor = isDark ? colors.dark.white : colors.light.black;
  const borderColor = accentColor;
  const skeletonColor = useThemeColor(
    { light: colors.light.misc, dark: colors.dark.misc },
    'text',
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.itemContainer, { borderColor }]}>
      <View style={[styles.leftAccent, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Animated.View
            style={[styles.titleSkeleton, animatedStyle, { backgroundColor: skeletonColor }]}
          />
          <Animated.View
            style={[styles.badgeSkeleton, animatedStyle, { backgroundColor: skeletonColor }]}
          />
        </View>
        <Animated.View
          style={[styles.bodyLineLong, animatedStyle, { backgroundColor: skeletonColor }]}
        />
        <Animated.View
          style={[styles.bodyLineShort, animatedStyle, { backgroundColor: skeletonColor }]}
        />
        <Animated.View
          style={[styles.timestampSkeleton, animatedStyle, { backgroundColor: skeletonColor }]}
        />
      </View>
    </View>
  );
};

export default NotificationItemSkeleton;

const styles = StyleSheet.create({
  itemContainer: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: heightPixel(11),
    borderWidth: 0.5,
    borderLeftWidth: 0,
    overflow: 'hidden',
  },
  leftAccent: {
    width: widthPixel(4),
  },
  content: {
    flex: 1,
    paddingVertical: heightPixel(10),
    paddingHorizontal: widthPixel(12),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: heightPixel(8),
    gap: widthPixel(8),
  },
  titleSkeleton: {
    width: widthPixel(150),
    height: fontPixel(14),
  },
  badgeSkeleton: {
    width: widthPixel(30),
    height: heightPixel(18),
  },
  bodyLineLong: {
    width: '100%',
    height: fontPixel(13),
    marginBottom: heightPixel(5),
  },
  bodyLineShort: {
    width: '70%',
    height: fontPixel(13),
    marginBottom: heightPixel(10),
  },
  timestampSkeleton: {
    width: widthPixel(95),
    height: fontPixel(11),
  },
});
