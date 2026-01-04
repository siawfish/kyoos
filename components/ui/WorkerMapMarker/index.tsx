import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { calculateWorkerCost } from '@/constants/helpers';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { selectUser } from '@/redux/app/selector';
import { Worker } from '@/redux/search/types';
import { useAppSelector } from '@/store/hooks';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import numeral from 'numeral';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface WorkerMapMarkerProps {
    worker: Worker;
    pinColor?: string;
    estimatedDuration?: number;
    onPress?: (id: string) => void;
    displayCost?: boolean;
}

const formatPrice = (price: number) => {
    return numeral(price).format('0,0');
};

export default function WorkerMapMarker({ worker, pinColor, estimatedDuration, onPress, displayCost = true }: WorkerMapMarkerProps) {
    const user = useAppSelector(selectUser);
    const currency = user?.settings?.currency || 'GHS';
    const skills = worker.skills;
    
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

    const bgColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.white,
    }, 'white');

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
                    {
                        displayCost ? (
                            <>
                                <ThemedText style={[styles.currency, { color: textColor }]}>{currency}</ThemedText>
                                <ThemedText style={[styles.price, { color: textColor }]}>
                                    {formatPrice(workerCost)}
                                </ThemedText>
                            </>
                        ) : (
                            <>
                                {
                                    worker.skills?.[0]?.icon && (
                                        <View style={[styles.skillIconContainer, { backgroundColor: bgColor }]}>
                                            <Image source={worker.skills?.[0]?.icon} style={styles.skillIcon} />
                                        </View>
                                    )
                                }
                                <ThemedText style={[styles.price, { color: textColor }]}>{worker.skills?.[0]?.name ?? "Worker"}</ThemedText>
                            </>
                        )
                    }
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
        alignItems: 'center',
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
    skillIcon: {
        width: widthPixel(16),
        height: widthPixel(16),
    },
    skillIconContainer: {
        width: widthPixel(20),
        height: widthPixel(20),
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
}); 