import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';

interface SearchInputTriggerProps {
    onPress: () => void;
    placeholder?: string;
}

const SearchInputTrigger = ({ 
    onPress, 
    placeholder = "What do you need help with?" 
}: SearchInputTriggerProps) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const blurTint = useThemeColor({
        light: 'light',
        dark: 'dark',
    }, 'background');

    const backgroundColor = useThemeColor({
        light: colors.light.background + '95',
        dark: colors.dark.background + '95',
    }, 'background');

    const textColor = useThemeColor({
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

    // Subtle pulse animation for AI indicator
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.5,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [pulseAnim]);

    return (
        <BlurView intensity={80} tint={blurTint as 'light' | 'dark'} style={[styles.container, { backgroundColor }]}>
            <TouchableOpacity 
                onPress={onPress} 
                style={[styles.inputContainer, { borderColor }]}
                activeOpacity={0.8}
            >
                <View style={[styles.leftAccent, { backgroundColor: tintColor }]} />
                <View style={styles.contentWrapper}>
                    <View style={styles.mainContent}>
                        <View style={styles.searchIconContainer}>
                            <Feather name="search" size={18} color={tintColor} />
                        </View>
                        <View style={styles.textContainer}>
                            <ThemedText style={[styles.label, { color: textColor }]}>
                                SMART SEARCH
                            </ThemedText>
                            <ThemedText style={[styles.placeholder, { color: textColor }]} numberOfLines={1}>
                                {placeholder}
                            </ThemedText>
                        </View>
                    </View>
                    <View style={[styles.aiTag, { borderColor: tintColor }]}>
                        <Animated.View style={{ opacity: pulseAnim }}>
                            <Feather name="zap" size={12} color={tintColor} />
                        </Animated.View>
                        <ThemedText style={[styles.aiText, { color: tintColor }]}>AI</ThemedText>
                    </View>
                </View>
            </TouchableOpacity>
        </BlurView>
    );
};

export default SearchInputTrigger;

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    inputContainer: {
        flexDirection: 'row',
        borderWidth: 0.5,
        borderLeftWidth: 0,
    },
    leftAccent: {
        width: widthPixel(4),
    },
    contentWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: heightPixel(14),
        paddingHorizontal: widthPixel(14),
        gap: widthPixel(12),
    },
    mainContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(12),
    },
    searchIconContainer: {
        width: widthPixel(36),
        height: widthPixel(36),
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
    },
    label: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.2,
        marginBottom: heightPixel(2),
        opacity: 0.7,
    },
    placeholder: {
        fontSize: fontPixel(14),
        fontFamily: 'Medium',
    },
    aiTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(4),
        paddingHorizontal: widthPixel(10),
        paddingVertical: heightPixel(6),
        borderWidth: 1,
    },
    aiText: {
        fontSize: fontPixel(11),
        fontFamily: 'Bold',
        letterSpacing: 1,
    },
});

