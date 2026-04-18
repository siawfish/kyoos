import { heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
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

  const borderColor = useThemeColor(
    { light: colors.light.black, dark: colors.dark.white },
    'text',
  );
  const skeletonColor = useThemeColor(
    { light: colors.light.misc, dark: colors.dark.misc },
    'text',
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.itemContainer, { borderColor }]}>
      <View style={styles.itemHeader}>
        <Animated.View
          style={[styles.titleSkeleton, animatedStyle, { backgroundColor: skeletonColor }]}
        />
        <Animated.View
          style={[styles.dotSkeleton, animatedStyle, { backgroundColor: skeletonColor }]}
        />
      </View>
      <Animated.View
        style={[styles.bodyLineLong, animatedStyle, { backgroundColor: skeletonColor }]}
      />
      <Animated.View
        style={[styles.bodyLineShort, animatedStyle, { backgroundColor: skeletonColor }]}
      />
      <Animated.View
        style={[styles.timeSkeleton, animatedStyle, { backgroundColor: skeletonColor }]}
      />
    </View>
  );
};

export default NotificationItemSkeleton;

const styles = StyleSheet.create({
  itemContainer: {
    borderWidth: 0.5,
    paddingHorizontal: widthPixel(14),
    paddingVertical: heightPixel(12),
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: heightPixel(10),
    gap: widthPixel(10),
  },
  titleSkeleton: {
    width: widthPixel(145),
    height: heightPixel(14),
    borderRadius: 0,
  },
  dotSkeleton: {
    width: widthPixel(8),
    height: widthPixel(8),
    borderRadius: widthPixel(8),
  },
  bodyLineLong: {
    width: '100%',
    height: heightPixel(13),
    borderRadius: 0,
    marginBottom: heightPixel(6),
  },
  bodyLineShort: {
    width: '75%',
    height: heightPixel(13),
    borderRadius: 0,
    marginBottom: heightPixel(10),
  },
  timeSkeleton: {
    width: widthPixel(95),
    height: heightPixel(11),
    borderRadius: 0,
  },
});
