import { heightPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/hooks/use-app-theme';

interface ProgressBarProps {
    readonly progress: number;
}

export default function ProgressBar({
    progress = 0
}: ProgressBarProps) {
    const colorScheme = useAppTheme();
    const isDark = colorScheme === 'dark';
    
    const trackColor = isDark ? colors.dark.grey : colors.light.grey;
    const progressColor = isDark ? colors.dark.white : colors.light.black;

    // Initialize an Animated.Value with 0
    const widthAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animate width change
        Animated.timing(widthAnim, {
            toValue: progress,
            duration: 400,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const animatedWidth = widthAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={[styles.container, { backgroundColor: trackColor }]}>
            <Animated.View style={[styles.progressBar, { width: animatedWidth, backgroundColor: progressColor }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: heightPixel(3),
    },
    progressBar: {
        height: heightPixel(3),
    }
});

