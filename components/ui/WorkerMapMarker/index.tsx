import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { widthPixel, heightPixel, fontPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Skill, Worker } from '@/redux/search/types';
import { calculateWorkerCost } from '@/constants/helpers';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/redux/app/selector';
import numeral from 'numeral';

interface WorkerMapMarkerProps {
    worker: Worker;
    skills: Skill[];
    pinColor?: string;
    estimatedDuration?: number;
    onPress?: (id: string) => void;
}

const formatPrice = (price: number) => {
    return numeral(price).format('0,0');
};

export default function WorkerMapMarker({ worker, skills, pinColor, estimatedDuration, onPress }: WorkerMapMarkerProps) {
    const user = useAppSelector(selectUser);
    const currency = user?.settings?.currency || 'GHS';
    
    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    const backgroundColor = useThemeColor({
        light: colors.light.background + 'F0',
        dark: colors.dark.background + 'F0',
    }, 'background');

    const blurTint = useThemeColor({
        light: 'light',
        dark: 'dark',
    }, 'background');

    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text,
    }, 'text');

    const borderColor = useThemeColor({
        light: colors.light.grey,
        dark: colors.dark.grey,
    }, 'grey');

    // Use provided pinColor or default to tint color
    const finalPinColor = pinColor || tintColor;

    // Calculate worker's individual cost
    const workerCost = useMemo(() => {
        return calculateWorkerCost(worker, skills, estimatedDuration || 0)
    }, [worker, skills, estimatedDuration]);

    return (
        <TouchableOpacity onPress={() => onPress?.(worker.id)} style={styles.container} activeOpacity={0.8}>
            {/* Pin Indicator */}
            <View style={[styles.pinIndicator, { backgroundColor: finalPinColor }]} />
            
            {/* Marker Card */}
            <BlurView 
                intensity={40} 
                tint={blurTint as 'light' | 'dark'} 
                style={[styles.markerCard, { backgroundColor, borderColor }]}
            >
                <View style={[styles.priceAccent, { backgroundColor: finalPinColor }]} />
                <View style={styles.priceContent}>
                    <ThemedText style={[styles.currency, { color: textColor }]}>{currency}</ThemedText>
                    <ThemedText style={[styles.price, { color: textColor }]}>
                        {formatPrice(workerCost)}
                    </ThemedText>
                </View>
            </BlurView>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    pinIndicator: {
        width: widthPixel(12),
        height: widthPixel(12),
        marginBottom: heightPixel(-2),
        zIndex: 2,
    },
    markerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0.5,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
    },
    priceAccent: {
        width: widthPixel(4),
        height: '100%',
    },
    priceContent: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: widthPixel(4),
        paddingHorizontal: widthPixel(10),
        paddingVertical: heightPixel(8),
    },
    currency: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 0.5,
    },
    price: {
        fontSize: fontPixel(14),
        fontFamily: 'Bold',
        letterSpacing: -0.3,
    },
}); 