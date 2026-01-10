import { heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

const PortfolioSkeleton = () => {
    const opacity = useSharedValue(0.3);
    const colorScheme = useAppTheme();
    const isDark = colorScheme === 'dark';
  
    useEffect(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1,
        true
      );
    }, []);
  
    const skeletonColor = useThemeColor({
      light: colors.light.grey,
      dark: colors.dark.grey
    }, 'background') as string;
  
    const backgroundColor = useThemeColor({
      light: colors.light.white,
      dark: colors.dark.black
    }, 'background') as string;

    const borderColor = isDark ? colors.dark.white : colors.light.black;
  
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));
    return (
        <View style={[styles.container, { backgroundColor, borderColor }]}>
          <View style={{ backgroundColor: borderColor }} />
          <View style={styles.content}>
            <View style={styles.topContent}>
              <View style={styles.userSection}>
                <Animated.View style={[styles.skeletonBox, styles.avatar, animatedStyle, { backgroundColor: skeletonColor }]} />
                <View style={styles.userInfo}>
                  <Animated.View style={[styles.skeletonBox, styles.nameSkeleton, animatedStyle, { backgroundColor: skeletonColor }]} />
                  <Animated.View style={[styles.skeletonBox, styles.timestampSkeleton, animatedStyle, { backgroundColor: skeletonColor }]} />
                </View>
              </View>
              <Animated.View style={[styles.skeletonBox, styles.optionsSkeleton, animatedStyle, { backgroundColor: skeletonColor }]} />
            </View>
            <Animated.View style={[styles.skeletonBox, styles.portfolioImage, animatedStyle, { backgroundColor: skeletonColor }]} />
            <Animated.View style={[styles.skeletonBox, styles.descriptionSkeleton, animatedStyle, { backgroundColor: skeletonColor }]} />
            <View style={styles.skillsContainer}>
              {[1, 2, 3].map((_, skillIndex) => (
                <Animated.View 
                  key={skillIndex} 
                  style={[styles.skeletonBox, styles.skillPill, animatedStyle, { backgroundColor: skeletonColor }]} 
                />
              ))}
            </View>
          </View>
        </View>
    )
}

export default PortfolioSkeleton;

const styles = StyleSheet.create({
  skeletonBox: {
    borderRadius: 0,
  },
  container: {
    width: '100%',
    height: "auto",
    flexDirection: 'row',
    marginHorizontal: 0,
    marginBottom: heightPixel(16),
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: widthPixel(16),
    gap: heightPixel(12),
  },
  topContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(12),
    flex: 1,
  },
  avatar: {
    width: widthPixel(40),
    height: widthPixel(40),
    borderRadius: 0,
  },
  userInfo: {
    gap: heightPixel(2),
    flex: 1,
  },
  nameSkeleton: {
    width: '60%',
    height: heightPixel(16),
  },
  timestampSkeleton: {
    width: '40%',
    height: heightPixel(12),
  },
  optionsSkeleton: {
    width: widthPixel(24),
    height: widthPixel(24),
    borderRadius: 0,
  },
  portfolioImage: {
    width: '100%',
    height: heightPixel(200),
    borderRadius: 0,
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
    borderRadius: 0,
  },
});