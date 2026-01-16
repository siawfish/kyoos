import { heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useAppTheme } from '@/hooks/use-app-theme'
import { useThemeColor } from '@/hooks/use-theme-color'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated'

const BookingCardSkeleton = () => {
  const theme = useAppTheme();
  const isDark = theme === 'dark';
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const cardBg = isDark ? 'transparent' : colors.light.background;
  const borderColor = isDark ? colors.dark.secondary : colors.light.black;
  const skeletonColor = useThemeColor({
    light: colors.light.misc,
    dark: colors.dark.misc
  }, 'text');
  const accentColor = isDark ? colors.dark.white : colors.light.black;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <Animated.View 
        style={[styles.leftAccent, animatedStyle, { backgroundColor: accentColor }]} 
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          {/* Status badge skeleton */}
          <Animated.View 
            style={[styles.statusBadgeSkeleton, animatedStyle, { backgroundColor: skeletonColor, borderColor: skeletonColor }]} 
          />
          {/* Time skeleton */}
          <Animated.View 
            style={[styles.timeSkeleton, animatedStyle, { backgroundColor: skeletonColor }]} 
          />
        </View>
        
        {/* Title skeleton */}
        <Animated.View 
          style={[styles.titleSkeleton, animatedStyle, { backgroundColor: skeletonColor }]} 
        />
        
        <View style={styles.detailsRow}>
          {/* WORKER section */}
          <View style={styles.detailItem}>
            <Animated.View 
              style={[styles.detailLabelSkeleton, animatedStyle, { backgroundColor: skeletonColor }]} 
            />
            <Animated.View 
              style={[styles.detailValueSkeleton, animatedStyle, { backgroundColor: skeletonColor }]} 
            />
          </View>
          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: skeletonColor }]} />
          {/* DURATION section */}
          <View style={styles.detailItem}>
            <Animated.View 
              style={[styles.detailLabelSkeleton, animatedStyle, { backgroundColor: skeletonColor }]} 
            />
            <Animated.View 
              style={[styles.detailValueSkeleton, animatedStyle, { backgroundColor: skeletonColor }]} 
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default BookingCardSkeleton;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderLeftWidth: 0,
    overflow: 'hidden',
  },
  leftAccent: {
    width: widthPixel(4),
  },
  content: {
    flex: 1,
    padding: widthPixel(16),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: heightPixel(12),
  },
  statusBadgeSkeleton: {
    borderWidth: 1,
    paddingHorizontal: widthPixel(8),
    paddingVertical: heightPixel(3),
    width: widthPixel(60),
    height: heightPixel(18),
    borderRadius: widthPixel(4),
  },
  timeSkeleton: {
    width: widthPixel(120),
    height: heightPixel(13),
    borderRadius: widthPixel(4),
  },
  titleSkeleton: {
    width: '85%',
    height: heightPixel(18),
    borderRadius: widthPixel(4),
    marginBottom: heightPixel(16),
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flex: 1,
    gap: heightPixel(2),
  },
  detailLabelSkeleton: {
    width: widthPixel(50),
    height: heightPixel(9),
    borderRadius: widthPixel(4),
    marginBottom: heightPixel(2),
  },
  detailValueSkeleton: {
    width: '80%',
    height: heightPixel(13),
    borderRadius: widthPixel(4),
  },
  divider: {
    width: 1,
    height: heightPixel(28),
    marginHorizontal: widthPixel(12),
    opacity: 0.3,
  },
});
