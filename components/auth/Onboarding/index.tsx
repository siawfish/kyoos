import Button from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { actions } from '@/redux/app/slice';
import { useAppDispatch } from '@/store/hooks';
import React, { useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Preserve kyoos-specific onboarding content
const slides = [
  {
    image: require('@/assets/images/onboarding-1.png'),
    title: 'What do you want to fix?',
    description: 'You no longer need to stress about getting the right person to fix your broken items or get a job done. We have a wide range of skilled professionals who can help you with your needs.'
  },
  {
    image: require('@/assets/images/onboarding-2.png'),
    title: 'Simple and easy to use',
    description: 'Simply tell us what the problem is by text, speak or upload a photo/video and we will find the best professional for you.'
  },
  {
    image: require('@/assets/images/onboarding-3.png'),
    title: 'Pricing is transparent',
    description: 'We will show you a price estimate before you make a booking. You can choose to book or not based on the price.'
  }
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const backgroundColor = useThemeColor({}, 'background');
  const dispatch = useAppDispatch();
  const translateX = useSharedValue(0);

  const handleNext = () => {
    if (currentIndex === slides.length - 1) {
      dispatch(actions.setHasSeenOnboarding(true));
    } else {
      scrollViewRef.current?.scrollTo({
        x: SCREEN_WIDTH * (currentIndex + 1),
        animated: true
      });
    }
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    translateX.value = offsetX;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const DotStyle = (index: number) => {
    const animatedDotStyle = useAnimatedStyle(() => {
      const width = interpolate(
        translateX.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ],
        [8, 24, 8],
        Extrapolate.CLAMP
      );

      const opacity = interpolate(
        translateX.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ],
        [0.5, 1, 0.5],
        Extrapolate.CLAMP
      );

      return {
        width: withSpring(width),
        opacity: withTiming(opacity),
        height: 8,
        borderRadius: 0,
        backgroundColor: colors.light.tint,
        marginHorizontal: 4,
      };
    });

    return animatedDotStyle;
  };

  const SlideAnimatedStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ];

      const opacity = interpolate(
        translateX.value,
        inputRange,
        [0, 1, 0],
        Extrapolate.CLAMP
      );

      const scale = interpolate(
        translateX.value,
        inputRange,
        [0.8, 1, 0.8],
        Extrapolate.CLAMP
      );

      return {
        opacity: withTiming(opacity),
        transform: [{ scale: withSpring(scale) }],
      };
    });
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.slidesContainer}
      >
        {slides.map((slide, index) => (
          <Animated.View key={index} style={[styles.slide, SlideAnimatedStyle(index)]}>
            <Image 
              source={slide.image} 
              style={styles.image}
              resizeMode="contain"
            />
            <View style={styles.textContainer}>
              <ThemedText type="title" style={styles.title}>
                {slide.title}
              </ThemedText>
              <ThemedText 
                type="subtitle" 
                style={styles.description}
                lightColor={colors.light.secondary}
                darkColor={colors.dark.secondary}
              >
                {slide.description}
              </ThemedText>
            </View>
          </Animated.View>
        ))}
      </Animated.ScrollView>

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <Animated.View key={index} style={DotStyle(index)} />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          label={currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          onPress={handleNext}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slidesContainer: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: widthPixel(32),
    marginTop: heightPixel(32),
  },
  title: {
    fontSize: fontPixel(24),
    textAlign: 'center',
    marginBottom: heightPixel(16),
  },
  description: {
    fontSize: fontPixel(16),
    textAlign: 'center',
    lineHeight: fontPixel(24),
  },
  footer: {
    padding: widthPixel(16),
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: heightPixel(32),
  },
  button: {
    marginBottom: heightPixel(16),
  },
});

