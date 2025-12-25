import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Platform, TouchableWithoutFeedback, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface AISearchBarProps {
  onPress?: () => void;
}

export default function AISearchBar({ onPress }: AISearchBarProps) {
  const sparkleScale = useRef(new Animated.Value(1)).current;
  const sparkleOpacity = useRef(new Animated.Value(0.7)).current;
  const colorAnimation = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  // Interpolate colors based on animation value
  const animatedColor1 = colorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#667eea', '#f093fb']
  });
  
  const animatedColor2 = colorAnimation.interpolate({
    inputRange: [0, 1], 
    outputRange: ['#764ba2', '#f5576c']
  });

  // Sparkle animation - gentle pulsing
  useEffect(() => {
    const sparkleAnimation = Animated.loop(
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
            toValue: 0.7,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    sparkleAnimation.start();

    return () => sparkleAnimation.stop();
  }, []);

  // Color alternating animation - cycles through gradient colors
  useEffect(() => {
    const colorAnimationLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false, // Color animations require native driver to be false
        }),
        Animated.timing(colorAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]),
    );
    
    colorAnimationLoop.start();
    return () => colorAnimationLoop.stop();
  }, []);

  // Pulse animation - subtle breathing effect
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.02,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    // Trigger sparkle animation on press
    Animated.sequence([
      Animated.parallel([
        Animated.timing(sparkleScale, {
          toValue: 1.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(sparkleScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleOpacity, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    onPress?.();
  };

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
      <Ionicons name="sparkles" size={18} color="#ffffff" />
    </Animated.View>
  );

  return (
    <Animated.View 
      style={[
        styles.aiButtonContainer,
        { transform: [{ scale: pulseScale }] }
      ]}
    >
      <Animated.View 
        style={[
          styles.buttonWrapper,
          { transform: [{ scale: buttonScale }] }
        ]}
      >
        <AnimatedLinearGradient
          colors={[animatedColor1, animatedColor2]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.aiButtonGradient}
        >
          <TouchableWithoutFeedback
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
          >
            <View style={styles.buttonContent}>
              <Button 
                label='Ask AI to find your perfect service' 
                style={styles.aiSearchBar}
                lightBackgroundColor="transparent"
                darkBackgroundColor="transparent"
                labelStyle={[styles.aiSearchText]}
                icon={<AnimatedSparkles />}
                onPress={handlePress}
              />
            </View>
          </TouchableWithoutFeedback>
        </AnimatedLinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  aiButtonContainer: {
    marginHorizontal: widthPixel(16),
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#667eea',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonWrapper: {
    borderRadius: 16,
  },
  aiButtonGradient: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },

  buttonContent: {
    position: 'relative',
    zIndex: 2,
  },
  aiSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    padding: widthPixel(16),
    borderRadius: 16,
    gap: widthPixel(10),
    height: heightPixel(56),
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  aiSearchText: {
    fontSize: fontPixel(16),
    fontFamily: 'CabinetGrotesk-Medium',
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  sparklesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 