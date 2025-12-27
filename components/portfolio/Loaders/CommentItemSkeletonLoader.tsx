import ThemedView from "@/components/ui/Themed/ThemedView";
import { heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useThemeColor } from '@/hooks/use-theme-color';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const CommentItemSkeletonLoader = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => startAnimation());
    };

    startAnimation();
  }, []);
  
  const colorScheme = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background') as string;

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <ThemedView
      lightColor={colors.light.white}
      darkColor={colors.dark.black}
      style={styles.commentContainer}
    >
      <View style={styles.commentHeader}>
        <Animated.View style={[styles.avatar, { backgroundColor: colorScheme, opacity }]} />
        <View style={styles.textContainer}>
          <Animated.View style={[styles.nameSkeleton, { backgroundColor: colorScheme, opacity }]} />
          <Animated.View style={[styles.timestampSkeleton, { backgroundColor: colorScheme, opacity }]} />
        </View>
      </View>
      <View style={styles.commentBody}>
        <Animated.View style={[styles.commentLineSkeleton, { backgroundColor: colorScheme, opacity }]} />
        <Animated.View style={[styles.commentLineSkeleton, { backgroundColor: colorScheme, width: '70%', opacity }]} />
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    marginBottom: heightPixel(16),
    padding: widthPixel(12),
    borderRadius: widthPixel(8),
    elevation: 1,
    shadowColor: colors.light.text,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: heightPixel(8),
    gap: widthPixel(8),
  },
  avatar: {
    width: widthPixel(32),
    height: widthPixel(32),
    borderRadius: widthPixel(16),
  },
  textContainer: {
    gap: heightPixel(4),
  },
  nameSkeleton: {
    width: widthPixel(120),
    height: heightPixel(16),
    borderRadius: widthPixel(4),
  },
  timestampSkeleton: {
    width: widthPixel(80),
    height: heightPixel(12),
    borderRadius: widthPixel(4),
  },
  commentBody: {
    gap: heightPixel(4),
  },
  commentLineSkeleton: {
    width: '100%',
    height: heightPixel(14),
    borderRadius: widthPixel(4),
  },
});

export default CommentItemSkeletonLoader; 

