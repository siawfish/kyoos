import { heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

const ConversationItemSkeleton = () => {
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

  const cardBg = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background');
  const accentColor = isDark ? colors.dark.white : colors.light.black;
  const borderColor = accentColor;
  const skeletonColor = useThemeColor({
    light: colors.light.misc,
    dark: colors.dark.misc
  }, 'text');

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.conversationItem, { backgroundColor: cardBg, borderColor }]}>
      <Animated.View 
        style={[styles.leftAccent, animatedStyle, { backgroundColor: accentColor }]} 
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          {/* Avatar skeleton */}
          <Animated.View 
            style={[styles.avatarSkeleton, animatedStyle, { backgroundColor: skeletonColor }]} 
          />
          <View style={styles.messageContent}>
            {/* Message header skeleton */}
            <View style={styles.messageHeader}>
              <Animated.View 
                style={[styles.senderNameSkeleton, animatedStyle, { backgroundColor: skeletonColor }]} 
              />
            </View>
            {/* Message preview skeleton */}
            <View style={styles.messagePreview}>
              <Animated.View 
                style={[styles.lastMessageSkeleton, animatedStyle, { backgroundColor: skeletonColor }]} 
              />
              <Animated.View 
                style={[styles.timestampSkeleton, animatedStyle, { backgroundColor: skeletonColor }]} 
              />
            </View>
            {/* Booking context skeleton */}
            <View style={[styles.bookingContext, { borderTopColor: skeletonColor }]}>
              <Animated.View 
                style={[styles.bookingDescriptionSkeleton, animatedStyle, { backgroundColor: skeletonColor }]} 
              />
              <View style={styles.bookingMeta}>
                <Animated.View 
                  style={[styles.bookingDateTimeSkeleton, animatedStyle, { backgroundColor: skeletonColor }]} 
                />
                <Animated.View 
                  style={[styles.statusBadgeSkeleton, animatedStyle, { backgroundColor: skeletonColor }]} 
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ConversationItemSkeleton;

const styles = StyleSheet.create({
  conversationItem: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: heightPixel(16),
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
    gap: widthPixel(12),
  },
  avatarSkeleton: {
    width: widthPixel(50),
    height: heightPixel(50),
    borderRadius: 0,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: heightPixel(8),
  },
  senderNameSkeleton: {
    width: widthPixel(120),
    height: heightPixel(15),
    borderRadius: 0,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(8),
  },
  lastMessageSkeleton: {
    flex: 1,
    height: heightPixel(15),
    borderRadius: 0,
  },
  timestampSkeleton: {
    width: widthPixel(60),
    height: heightPixel(12),
    borderRadius: 0,
  },
  bookingContext: {
    marginTop: heightPixel(10),
    paddingTop: heightPixel(10),
    borderTopWidth: 0.5,
  },
  bookingDescriptionSkeleton: {
    width: '70%',
    height: heightPixel(13),
    borderRadius: 0,
    marginBottom: heightPixel(6),
  },
  bookingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: widthPixel(8),
  },
  bookingDateTimeSkeleton: {
    width: widthPixel(100),
    height: heightPixel(12),
    borderRadius: 0,
  },
  statusBadgeSkeleton: {
    width: widthPixel(60),
    height: heightPixel(18),
    borderRadius: 0,
  },
});
