import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { widthPixel, heightPixel, fontPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import Portfolio from '@/components/portfolio/Portfolio';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { ThemedView } from '@/components/ui/Themed/ThemedView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const portfolios = ['1', '2', '3', '4', '5'];

export default function TrendingWorks() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef<Animated.ScrollView>(null);
    const translateX = useSharedValue(0);

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
                borderRadius: 4,
                backgroundColor: colors.light.tint,
                marginHorizontal: 4,
            };
        });

        return animatedDotStyle;
    };

    const PortfolioAnimatedStyle = (index: number) => {
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
        <ThemedView style={styles.popularSection}>
            <View style={styles.sectionHeader}>
                <ThemedText type='subtitle' style={styles.sectionTitle}>Trending Works</ThemedText>
                <TouchableOpacity>
                <ThemedText style={styles.viewAllText}>View all</ThemedText>
                </TouchableOpacity>
            </View>
            <Animated.ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.carousel}
            >
                {portfolios.map((id, index) => (
                <Animated.View key={id} style={[styles.portfolioSlide, PortfolioAnimatedStyle(index)]}>
                    <Portfolio id={id} />
                </Animated.View>
                ))}
            </Animated.ScrollView>
            <View style={styles.pagination}>
                {portfolios.map((_, index) => (
                    <Animated.View key={index} style={DotStyle(index)} />
                ))}
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    popularSection: {
      paddingHorizontal: widthPixel(16),
      marginTop: heightPixel(24),
      marginBottom: heightPixel(40),
      paddingVertical: heightPixel(24),
      gap: heightPixel(16),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
      fontSize: fontPixel(18),
      fontWeight: '600',
    },
    viewAllText: {
      fontSize: fontPixel(14),
      color: colors.light.tint,
    },
    carousel: {
      width: SCREEN_WIDTH - 32, // Account for horizontal padding
    },
    portfolioSlide: {
      width: SCREEN_WIDTH - 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
});
