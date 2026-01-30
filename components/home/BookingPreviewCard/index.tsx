import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { Booking } from '@/redux/booking/types';
import Status from '@/components/bookings/BookingDetails/Status';
import { useBookingStatus } from '@/hooks/useBookingStatus';

interface BookingPreviewCardProps {
    booking: Booking | null;
}

const BookingPreviewCard = ({ booking }: BookingPreviewCardProps) => {
    const blurTint = useThemeColor({
        light: 'light',
        dark: 'dark',
    }, 'background');

    const backgroundColor = useThemeColor({
        light: colors.light.background + 'F0',
        dark: colors.dark.background + 'F0',
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
    const { statusColor } = useBookingStatus(booking!);


    if (!booking) {
        return (
            <BlurView intensity={40} tint={blurTint as 'light' | 'dark'} style={[styles.container, { backgroundColor }]}>
                <View style={[styles.emptyContent, { borderColor }]}>
                    <Feather name="calendar" size={20} color={secondaryColor} />
                    <ThemedText style={[styles.emptyText, { color: secondaryColor }]}>
                        No upcoming bookings
                    </ThemedText>
                </View>
            </BlurView>
        );
    }

    const startTime = booking.startTime;

    const handlePress = () => {
        router.push(`/(tabs)/(bookings)/${booking.id}`);
    };

    if(!booking) return null;

    return (
        <BlurView intensity={40} tint={blurTint as 'light' | 'dark'} style={[styles.container, { backgroundColor }]}>
            <TouchableOpacity 
                onPress={handlePress}
                style={[styles.card, { borderColor }]}
                activeOpacity={0.8}
            >
                <View style={[styles.leftAccent, { backgroundColor: statusColor }]} />
                <View style={styles.content}>
                    <View style={styles.topRow}>
                        <Status booking={booking!} />
                        <ThemedText style={[styles.time, { color: textColor }]}>
                            {startTime}
                        </ThemedText>
                    </View>
                    
                    <ThemedText style={[styles.title, { color: textColor }]} numberOfLines={1}>
                        {booking.description}
                    </ThemedText>
                    
                    <View style={styles.detailsRow}>
                        <View style={styles.detailItem}>
                            <ThemedText style={[styles.detailLabel, { color: secondaryColor }]}>
                                WORKER
                            </ThemedText>
                            <ThemedText style={[styles.detailValue, { color: textColor }]} numberOfLines={1}>
                                {booking.worker?.name}
                            </ThemedText>
                        </View>
                        <View style={[styles.divider, { backgroundColor: secondaryColor }]} />
                        <View style={styles.detailItem}>
                            <ThemedText style={[styles.detailLabel, { color: secondaryColor }]}>
                                DURATION
                            </ThemedText>
                            <ThemedText style={[styles.detailValue, { color: textColor }]}>
                                {booking.estimatedDuration}
                            </ThemedText>
                        </View>
                    </View>
                </View>
                <View style={styles.arrowContainer}>
                    <Feather name="chevron-right" size={20} color={secondaryColor} />
                </View>
            </TouchableOpacity>
        </BlurView>
    );
};

export default BookingPreviewCard;

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    card: {
        flexDirection: 'row',
        borderWidth: 0.5,
        borderLeftWidth: 0,
    },
    leftAccent: {
        width: widthPixel(4),
    },
    content: {
        flex: 1,
        padding: widthPixel(16),
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: heightPixel(8),
    },
    time: {
        fontSize: fontPixel(12),
        fontFamily: 'SemiBold',
    },
    title: {
        fontSize: fontPixel(16),
        fontFamily: 'Bold',
        letterSpacing: -0.5,
        marginBottom: heightPixel(12),
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.2,
        marginBottom: heightPixel(2),
    },
    detailValue: {
        fontSize: fontPixel(12),
        fontFamily: 'Medium',
    },
    divider: {
        width: 1,
        height: heightPixel(24),
        marginHorizontal: widthPixel(12),
        opacity: 0.3,
    },
    arrowContainer: {
        justifyContent: 'center',
        paddingRight: widthPixel(12),
    },
    emptyContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: widthPixel(8),
        padding: widthPixel(16),
        borderWidth: 0.5,
    },
    emptyText: {
        fontSize: fontPixel(14),
        fontFamily: 'Medium',
    },
});

