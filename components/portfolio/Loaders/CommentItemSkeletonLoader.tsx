import { heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const CommentItemSkeletonLoader = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const colorScheme = useAppTheme();
  const isDark = colorScheme === 'dark';

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
  
  const skeletonColor = useThemeColor({
    light: colors.light.grey,
    dark: colors.dark.grey
  }, 'background') as string;

  const cardBg = useThemeColor({
    light: colors.light.white,
    dark: colors.dark.black
  }, 'background') as string;

  const borderColor = isDark ? colors.dark.white : colors.light.black;

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.commentContainer, { backgroundColor: cardBg, borderColor }]}>
      <View style={[styles.topAccent, { backgroundColor: borderColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.commentHeader}>
            <Animated.View style={[styles.avatar, { backgroundColor: skeletonColor, opacity }]} />
            <View style={styles.textContainer}>
              <Animated.View style={[styles.nameSkeleton, { backgroundColor: skeletonColor, opacity }]} />
              <Animated.View style={[styles.timestampSkeleton, { backgroundColor: skeletonColor, opacity }]} />
            </View>
          </View>
        </View>
        <View style={styles.commentBody}>
          <Animated.View style={[styles.commentLineSkeleton, { backgroundColor: skeletonColor, opacity }]} />
          <Animated.View style={[styles.commentLineSkeleton, { backgroundColor: skeletonColor, width: '70%', opacity }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    marginVertical: heightPixel(12),
    borderWidth: 0.5,
    borderTopWidth: 0,
    overflow: 'hidden',
  },
  topAccent: {
    height: heightPixel(3),
    width: '100%',
  },
  content: {
    padding: widthPixel(16),
    gap: heightPixel(12),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(12),
    flex: 1,
  },
  avatar: {
    width: widthPixel(36),
    height: widthPixel(36),
    borderRadius: 0,
  },
  textContainer: {
    gap: heightPixel(2),
  },
  nameSkeleton: {
    width: widthPixel(120),
    height: heightPixel(16),
    borderRadius: 0,
  },
  timestampSkeleton: {
    width: widthPixel(80),
    height: heightPixel(12),
    borderRadius: 0,
  },
  commentBody: {
    gap: heightPixel(4),
  },
  commentLineSkeleton: {
    width: '100%',
    height: heightPixel(14),
    borderRadius: 0,
  },
});

export default CommentItemSkeletonLoader; 