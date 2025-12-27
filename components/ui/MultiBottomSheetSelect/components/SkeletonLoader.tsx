import { ThemedView } from '@/components/ui/Themed/ThemedView'
import { heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useThemeColor } from '@/hooks/use-theme-color'
import React from 'react'
import { StyleSheet } from 'react-native'
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
    light: colors.light.grey,
    dark: colors.dark.grey
  }, 'background') as string;

  const borderColor = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary
  }, 'secondary') as string;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <ThemedView style={styles.container}>
      {[1, 2, 3, 4, 5].map((_, index) => (
        <ThemedView key={index} style={[styles.option, { borderBottomColor: borderColor }]}>
          <Animated.View 
            style={[
              styles.skeletonBox,
              styles.optionText,
              animatedStyle,
              { backgroundColor: colorScheme }
            ]} 
          />
        </ThemedView>
      ))}
    </ThemedView>
  );
};

export default SkeletonLoader;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: widthPixel(16),
    paddingBottom: heightPixel(40),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: heightPixel(16),
    paddingHorizontal: widthPixel(16),
    marginHorizontal: -widthPixel(16),
    borderBottomWidth: 0.3,
  },
  skeletonBox: {
    borderRadius: 0,
  },
  optionText: {
    width: '60%',
    height: heightPixel(20),
  },
});

