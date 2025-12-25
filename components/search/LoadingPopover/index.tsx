import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Modal, 
  Animated, 
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { BlurView } from 'expo-blur';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface LoadingPopoverProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
}

export default function LoadingPopover({ 
  visible, 
  title = "Searching...", 
  subtitle = "Finding the perfect service provider for you" 
}: LoadingPopoverProps) {
  // Animation refs
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.8)).current;
  const gradientAnimation = useRef(new Animated.Value(0)).current;
  const sparkleScale = useRef(new Animated.Value(1)).current;
  const sparkleOpacity = useRef(new Animated.Value(0.8)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const dotAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;
  
  const textColor = useThemeColor({
    light: colors.light.text,
    dark: colors.dark.white,
  }, 'text');
  
  const secondaryTextColor = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary,
  }, 'secondary');

  // Color interpolations for gradient animation
  const animatedColor1 = gradientAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#667eea', '#f093fb']
  });
  
  const animatedColor2 = gradientAnimation.interpolate({
    inputRange: [0, 1], 
    outputRange: ['#764ba2', '#f5576c']
  });

  const blurBackgroundColor = useThemeColor({
      light: colors.light.background + '90',
      dark: colors.dark.background + '90',
  }, 'background');

  const blurTint = useThemeColor({
      light: 'light',
      dark: 'dark',
  }, 'background');

  // Start animations when visible
  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.parallel([
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnimation, {
          toValue: 1,
          useNativeDriver: true,
          damping: 15,
          mass: 1,
        }),
      ]).start();

      // Gradient color animation
      const gradientLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(gradientAnimation, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
          }),
          Animated.timing(gradientAnimation, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: false,
          }),
        ]),
      );

      // Sparkle animation
      const sparkleLoop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(sparkleScale, {
              toValue: 1.3,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(sparkleOpacity, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(sparkleScale, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(sparkleOpacity, {
              toValue: 0.8,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );

      // Pulse animation
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      );

      // Rotation animation
      const rotateLoop = Animated.loop(
        Animated.timing(rotateAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      );

      // Staggered dots animation
      const dotsLoop = Animated.loop(
        Animated.stagger(200, [
          Animated.sequence([
            Animated.timing(dotAnimations[0], {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(dotAnimations[0], {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dotAnimations[1], {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(dotAnimations[1], {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dotAnimations[2], {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(dotAnimations[2], {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );

      gradientLoop.start();
      sparkleLoop.start();
      pulseLoop.start();
      rotateLoop.start();
      dotsLoop.start();

      return () => {
        gradientLoop.stop();
        sparkleLoop.stop();
        pulseLoop.stop();
        rotateLoop.stop();
        dotsLoop.stop();
      };
    } else {
      // Fade out animation
      Animated.parallel([
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const spin = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const AnimatedSparkles = () => (
    <Animated.View 
      style={[
        styles.sparklesContainer,
        {
          transform: [{ scale: sparkleScale }],
          opacity: sparkleOpacity,
        }
      ]}
    >
      <Ionicons name="sparkles" size={24} color="#ffffff" />
    </Animated.View>
  );

  const LoadingDots = () => (
    <View style={styles.dotsContainer}>
      {[0, 1, 2].map((index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: colors.light.tint,
              transform: [
                {
                  scale: dotAnimations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                },
              ],
              opacity: dotAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            },
          ]}
        />
      ))}
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
    >
    <BlurView intensity={60} tint={blurTint as any} style={[styles.section, { backgroundColor: blurBackgroundColor }]} />
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnimation }
        ]}
      >
        <Animated.View 
          style={[
            styles.container,
            { 
              transform: [
                { scale: scaleAnimation },
                { scale: pulseAnimation }
              ]
            }
          ]}
        >
          {/* Animated Gradient Icon */}
          <AnimatedLinearGradient
            colors={[animatedColor1, animatedColor2]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.iconContainer}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="search" size={32} color="#ffffff" />
            </Animated.View>
            <AnimatedSparkles />
          </AnimatedLinearGradient>

          {/* Title */}
          <ThemedText style={[styles.title, { color: textColor }]}>
            {title}
          </ThemedText>

          {/* Subtitle */}
          <ThemedText style={[styles.subtitle, { color: secondaryTextColor }]}>
            {subtitle}
          </ThemedText>

          {/* Loading Dots */}
          <LoadingDots />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: widthPixel(32),
  },
  container: {
    width: widthPixel(280),
    padding: widthPixel(32),
    borderRadius: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  iconContainer: {
    width: widthPixel(80),
    height: widthPixel(80),
    borderRadius: widthPixel(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: heightPixel(24),
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  sparklesContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontPixel(20),
    fontFamily: 'CabinetGrotesk-Bold',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: heightPixel(8),
  },
  subtitle: {
    fontSize: fontPixel(16),
    fontFamily: 'CabinetGrotesk-Regular',
    textAlign: 'center',
    lineHeight: fontPixel(22),
    marginBottom: heightPixel(24),
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: widthPixel(8),
  },
  dot: {
    width: widthPixel(8),
    height: widthPixel(8),
    borderRadius: widthPixel(4),
  },

  section : {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    marginBottom: heightPixel(16),
    borderRadius: widthPixel(12),
    padding: widthPixel(16),
    overflow: 'hidden',
    flex: 1,
},
}); 