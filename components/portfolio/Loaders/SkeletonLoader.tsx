import { ThemedView } from '@/components/ui/Themed/ThemedView'
import { heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useThemeColor } from '@/hooks/use-theme-color'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated'

const SkeletonLoader = () => {
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

  const colorScheme = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background') as string;

  const backgroundColor = useThemeColor({
    light: colors.light.white,
    dark: colors.dark.black
  }, 'background') as string;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <ThemedView style={styles.container}>
      {/* Profile Card Skeleton */}
      <ThemedView style={[styles.profileCard, { backgroundColor }]}>
        <View style={styles.profileHeader}>
          <Animated.View style={[styles.skeletonBox, styles.avatar, animatedStyle, { backgroundColor: colorScheme }]} />
          <View style={styles.profileInfo}>
            <Animated.View style={[styles.skeletonBox, styles.nameSkeleton, animatedStyle, { backgroundColor: colorScheme }]} />
            <Animated.View style={[styles.skeletonBox, styles.emailSkeleton, animatedStyle, { backgroundColor: colorScheme }]} />
          </View>
        </View>
      </ThemedView>

      {/* Section Title Skeleton */}
      <ThemedView style={[styles.sectionTitle, { backgroundColor }]}>
        <View style={styles.titleContainer}>
          <Animated.View style={[styles.skeletonBox, styles.titleSkeleton, animatedStyle, { backgroundColor: colorScheme }]} />
          <Animated.View style={[styles.skeletonBox, styles.subtitleSkeleton, animatedStyle, { backgroundColor: colorScheme }]} />
        </View>
      </ThemedView>

      {/* Portfolio Items Skeleton */}
      {[1, 2].map((_, index) => (
        <ThemedView key={index} style={[styles.portfolioItem, { backgroundColor }]}>
          <Animated.View style={[styles.skeletonBox, styles.portfolioImage, animatedStyle, { backgroundColor: colorScheme }]} />
          <View style={styles.portfolioContent}>
            <Animated.View style={[styles.skeletonBox, styles.descriptionSkeleton, animatedStyle, { backgroundColor: colorScheme }]} />
            <View style={styles.skillsContainer}>
              {[1, 2, 3].map((_, skillIndex) => (
                <Animated.View 
                  key={skillIndex} 
                  style={[styles.skeletonBox, styles.skillPill, animatedStyle, { backgroundColor: colorScheme }]} 
                />
              ))}
            </View>
          </View>
        </ThemedView>
      ))}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: widthPixel(16),
    gap: heightPixel(20),
  },
  profileCard: {
    padding: widthPixel(16),
    borderRadius: widthPixel(10),
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(16),
  },
  profileInfo: {
    flex: 1,
    gap: heightPixel(8),
  },
  skeletonBox: {
    borderRadius: widthPixel(8),
  },
  avatar: {
    width: widthPixel(60),
    height: widthPixel(60),
    borderRadius: widthPixel(30),
  },
  nameSkeleton: {
    width: '80%',
    height: heightPixel(20),
  },
  emailSkeleton: {
    width: '60%',
    height: heightPixel(16),
  },
  sectionTitle: {
    padding: widthPixel(16),
    borderRadius: widthPixel(10),
  },
  titleContainer: {
    gap: heightPixel(8),
  },
  titleSkeleton: {
    width: '40%',
    height: heightPixel(24),
  },
  subtitleSkeleton: {
    width: '70%',
    height: heightPixel(16),
  },
  portfolioItem: {
    padding: widthPixel(16),
    borderRadius: widthPixel(10),
    gap: heightPixel(16),
  },
  portfolioImage: {
    width: '100%',
    height: heightPixel(200),
    borderRadius: widthPixel(10),
  },
  portfolioContent: {
    gap: heightPixel(16),
  },
  descriptionSkeleton: {
    width: '100%',
    height: heightPixel(60),
  },
  skillsContainer: {
    flexDirection: 'row',
    gap: widthPixel(8),
  },
  skillPill: {
    width: widthPixel(80),
    height: heightPixel(32),
    borderRadius: widthPixel(16),
  },
});

export default SkeletonLoader; 

