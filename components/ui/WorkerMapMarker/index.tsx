import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { widthPixel, heightPixel, fontPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Skill, Worker } from '@/redux/search/types';
import { calculateWorkerCost } from '@/constants/helpers';
import PriceTag from '@/components/search/PriceTag';

interface WorkerMapMarkerProps {
    worker: Worker;
    skills: Skill[];
    pinColor?: string;
    estimatedDuration?: number; // Add estimated duration prop
    onPress?: (id: string) => void;
}

export default function WorkerMapMarker({ worker, skills, pinColor, estimatedDuration, onPress }: WorkerMapMarkerProps) {
    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    // Use provided pinColor or default to tint color
    const finalPinColor = pinColor || tintColor;

    // Calculate worker's individual cost
    const workerCost = useMemo(() => {
        return calculateWorkerCost(worker, skills, estimatedDuration || 0)
    }, [worker, skills, estimatedDuration]);
    return (
        <>
            <TouchableOpacity onPress={() => onPress?.(worker.id)} style={styles.container}>
                {/* Pin with Skill Icon */}
                <View style={[styles.pin, { backgroundColor: finalPinColor }]}>
                    <PriceTag price={workerCost} />
                </View>
                
            </TouchableOpacity>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    pin: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(4),
        height: widthPixel(32),
        borderRadius: widthPixel(16),
        marginBottom: heightPixel(2),
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        paddingHorizontal: widthPixel(8),
        paddingVertical: heightPixel(8),
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    icon: {
        width: widthPixel(24),
        height: widthPixel(24),
    },
    duration: {
        fontSize: fontPixel(14),
        fontFamily: 'Bold',
    },
}); 