import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SearchingProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
}

const loadingMessages = [
  "Analyzing your request",
  "Matching skills required",
  "Finding nearby professionals",
  "Calculating best options",
  "Almost there",
];

export default function Searching({ 
  title = "SEARCHING", 
  subtitle = "Finding the perfect match" ,
  visible = true
}: SearchingProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  
  // Animation refs
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.95)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseRing1 = useRef(new Animated.Value(0)).current;
  const pulseRing2 = useRef(new Animated.Value(0)).current;
  const pulseRing3 = useRef(new Animated.Value(0)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0.3)).current;
  const textFade = useRef(new Animated.Value(1)).current;
  const lineAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  
  const theme = useAppTheme();
  const isDark = theme === 'dark';
  const accentColor = isDark ? colors.dark.white : colors.light.black;

  const backgroundColor = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background,
  }, 'background');

  const textColor = useThemeColor({
    light: colors.light.text,
    dark: colors.dark.text,
  }, 'text');
  
  const secondaryColor = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary,
  }, 'secondary');

  const borderColor = useThemeColor({
    light: colors.light.grey,
    dark: colors.dark.grey,
  }, 'grey');

  const tintColor = useThemeColor({
    light: colors.light.tint,
    dark: colors.dark.tint,
  }, 'tint');

  const blurTint = useThemeColor({
    light: 'light',
    dark: 'dark',
  }, 'background');

  // Cycle through loading messages
  useEffect(() => {
    if (!visible) return;
    
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(textFade, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setMessageIndex(prev => (prev + 1) % loadingMessages.length);
        // Fade in
        Animated.timing(textFade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }, 2500);
    
    return () => clearInterval(interval);
  }, [visible]);

  // Main animations
  useEffect(() => {
    if (visible) {
      setMessageIndex(0);
      progressAnimation.setValue(0);
      
      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(scaleAnimation, {
          toValue: 1,
          useNativeDriver: true,
          damping: 20,
          mass: 1,
          stiffness: 200,
        }),
      ]).start();

      // Ripple effect - 3 expanding rings
      const createRipple = (anim: Animated.Value, delay: number) => 
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        );

      const ripple1 = createRipple(pulseRing1, 0);
      const ripple2 = createRipple(pulseRing2, 600);
      const ripple3 = createRipple(pulseRing3, 1200);

      // Icon bounce animation
      const bounceLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(iconBounce, {
            toValue: -8,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(iconBounce, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      );

      // Glow animation
      const glowLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 0.8,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(glowAnimation, {
            toValue: 0.3,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      );

      // Scanning lines animation
      const lineLoops = lineAnimations.map((anim, index) => 
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 300),
            Animated.timing(anim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.ease),
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.ease),
            }),
          ])
        )
      );

      // Progress bar animation
      const progressLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(progressAnimation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      );

      ripple1.start();
      ripple2.start();
      ripple3.start();
      bounceLoop.start();
      glowLoop.start();
      lineLoops.forEach(loop => loop.start());
      progressLoop.start();

      return () => {
        ripple1.stop();
        ripple2.stop();
        ripple3.stop();
        bounceLoop.stop();
        glowLoop.stop();
        lineLoops.forEach(loop => loop.stop());
        progressLoop.stop();
      };
    } else {
      Animated.parallel([
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (!visible) return null;

  return (
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
            backgroundColor,
            borderColor,
            transform: [{ scale: scaleAnimation }]
          }
        ]}
      >
        {/* Accent Line */}
        {/* <View style={[styles.accentLine, { backgroundColor: accentColor }]} /> */}
        
        {/* Header */}
        {/* <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText style={[styles.headerLabel, { color: secondaryColor }]}>
              AI SEARCH
            </ThemedText>
            <View style={[styles.aiBadge, { backgroundColor: tintColor + '15', borderColor: tintColor + '30' }]}>
              <Feather name="cpu" size={10} color={tintColor} />
              <ThemedText style={[styles.aiBadgeText, { color: tintColor }]}>
                PROCESSING
              </ThemedText>
            </View>
          </View>
        </View> */}

        {/* Main Visual Area */}
        <View style={styles.visualContainer}>
          {/* Ripple Rings */}
          {[pulseRing1, pulseRing2, pulseRing3].map((ring, index) => (
            <Animated.View
              key={index}
              style={[
                styles.rippleRing,
                {
                  borderColor: tintColor,
                  opacity: ring.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 0],
                  }),
                  transform: [
                    {
                      scale: ring.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2.5],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
          
          {/* Icon Container with Glow */}
          <Animated.View 
            style={[
              styles.iconGlow,
              { 
                backgroundColor: tintColor,
                opacity: glowAnimation,
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.iconContainer,
              { 
                backgroundColor,
                borderColor: tintColor,
                transform: [{ translateY: iconBounce }]
              }
            ]}
          >
            <Feather name="search" size={28} color={tintColor} />
          </Animated.View>
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <ThemedText style={[styles.title, { color: textColor }]}>
            {title}
          </ThemedText>
          
          <Animated.View style={{ opacity: textFade }}>
            <ThemedText style={[styles.dynamicMessage, { color: tintColor }]}>
              {loadingMessages[messageIndex]}
            </ThemedText>
          </Animated.View>
          
          <ThemedText style={[styles.subtitle, { color: secondaryColor }]}>
            {subtitle}
          </ThemedText>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressContainer, { backgroundColor: borderColor + '50' }]}>
          <Animated.View 
            style={[
              styles.progressBar,
              { 
                backgroundColor: tintColor,
                width: progressWidth,
              }
            ]} 
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // paddingHorizontal: widthPixel(24),
  },
  container: {
    width: '100%',
  },
  // accentLine: {
  //   height: heightPixel(3),
  //   width: '100%',
  // },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(20),
    paddingBottom: heightPixel(16),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(10),
  },
  headerLabel: {
    fontSize: fontPixel(10),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(5),
    paddingHorizontal: widthPixel(8),
    paddingVertical: heightPixel(4),
    borderWidth: 1,
  },
  aiBadgeText: {
    fontSize: fontPixel(9),
    fontFamily: 'Bold',
    letterSpacing: 0.8,
  },
  visualContainer: {
    height: heightPixel(200),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: heightPixel(40),
    overflow: 'hidden',
  },
  rippleRing: {
    position: 'absolute',
    width: widthPixel(70),
    height: widthPixel(70),
    borderRadius: widthPixel(35),
    borderWidth: 2,
  },
  iconGlow: {
    position: 'absolute',
    width: widthPixel(80),
    height: widthPixel(80),
    borderRadius: widthPixel(40),
  },
  iconContainer: {
    width: widthPixel(70),
    height: widthPixel(70),
    borderRadius: widthPixel(35),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    zIndex: 10,
  },
  scanLinesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    width: 2,
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: widthPixel(20),
    marginBottom: heightPixel(20),
  },
  title: {
    fontSize: fontPixel(22),
    fontFamily: 'Bold',
    letterSpacing: 3,
    marginBottom: heightPixel(8),
  },
  dynamicMessage: {
    fontSize: fontPixel(14),
    fontFamily: 'Medium',
    marginBottom: heightPixel(6),
  },
  subtitle: {
    fontSize: fontPixel(12),
    fontFamily: 'Regular',
    textAlign: 'center',
  },
  progressContainer: {
    height: heightPixel(3),
    marginHorizontal: widthPixel(20),
    marginBottom: heightPixel(20),
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: heightPixel(16),
    paddingHorizontal: widthPixel(20),
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(6),
  },
  statDivider: {
    width: 1,
    height: heightPixel(16),
    marginHorizontal: widthPixel(16),
  },
  statText: {
    fontSize: fontPixel(11),
    fontFamily: 'Medium',
  },
});
