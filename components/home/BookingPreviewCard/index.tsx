import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { formatDistanceStrict } from 'date-fns';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { Booking } from '@/redux/booking/types';
import { BookingStatuses } from '@/redux/app/types';
import Status from '@/components/bookings/BookingDetails/Status';
import { useBookingStatus } from '@/hooks/useBookingStatus';
import { convertFromMillisecondsToHours, formatDate, formatTime } from '@/constants/helpers';

/** Combine service date with clock time — matches `useBookingStatus` / home screen */
function getBookingStartDate(booking: Pick<Booking, 'date' | 'startTime'>): Date | null {
    if (!booking.date || !booking.startTime) return null;
    const ms = new Date(booking.date).setTime(new Date(booking.startTime).getTime());
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
}

function formatElapsedSince(start: Date, now: Date): string {
    const totalSec = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}`;
}

function capitalizeFirst(s: string): string {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
}

interface BookingPreviewCardProps {
    booking: Booking;
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
    const accentGreen = useThemeColor({}, 'green');
    const miscSurface = useThemeColor({}, 'misc');
    const { statusColor, withinTheTimeRange } = useBookingStatus(booking);
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const start = getBookingStartDate(booking);
        const needsLiveTick =
            (withinTheTimeRange &&
                (booking.status === BookingStatuses.ACCEPTED ||
                    booking.status === BookingStatuses.ONGOING)) ||
            (start &&
                start > new Date() &&
                (booking.status === BookingStatuses.PENDING ||
                    booking.status === BookingStatuses.ACCEPTED));
        if (!needsLiveTick) return;
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, [booking, withinTheTimeRange]);

    const handlePress = () => {
        router.push(`/(tabs)/(bookings)/${booking.id}`);
    };

    const start = getBookingStartDate(booking);
    const isOngoing =
        withinTheTimeRange &&
        (booking.status === BookingStatuses.ACCEPTED || booking.status === BookingStatuses.ONGOING);
    const isUpcoming =
        start &&
        start > now &&
        (booking.status === BookingStatuses.PENDING || booking.status === BookingStatuses.ACCEPTED);

    let displayTime: string;
    if (!start) {
        displayTime = booking.startTime;
    } else if (isOngoing) {
        displayTime = formatElapsedSince(start, now);
    } else if (isUpcoming) {
        displayTime = capitalizeFirst(formatDistanceStrict(start, now, { addSuffix: true }));
    } else {
        displayTime = `${formatDate(start)} · ${formatTime(booking.startTime)}`;
    }

    const durationHours =
        booking.estimatedDuration != null && booking.estimatedDuration > 0
            ? convertFromMillisecondsToHours(booking.estimatedDuration)
            : null;

    const timeRelevance: 'live' | 'soon' | 'default' = isOngoing ? 'live' : isUpcoming ? 'soon' : 'default';

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
                        <Status booking={booking} />
                        {timeRelevance === 'live' ? (
                            <View
                                style={[
                                    styles.timeBadge,
                                    { backgroundColor: `${accentGreen}1F`, borderColor: `${accentGreen}55` },
                                ]}
                            >
                                <Feather name="activity" size={fontPixel(13)} color={accentGreen} />
                                <ThemedText
                                    style={[styles.time, styles.timeLive, { color: accentGreen }]}
                                    numberOfLines={1}
                                >
                                    {displayTime}
                                </ThemedText>
                            </View>
                        ) : timeRelevance === 'soon' ? (
                            <View
                                style={[
                                    styles.timeBadge,
                                    styles.timeBadgeSoon,
                                    { backgroundColor: miscSurface, borderColor: borderColor },
                                ]}
                            >
                                <Feather name="clock" size={fontPixel(12)} color={secondaryColor} />
                                <ThemedText
                                    style={[styles.time, styles.timeSoon, { color: textColor }]}
                                    numberOfLines={1}
                                >
                                    {displayTime}
                                </ThemedText>
                            </View>
                        ) : (
                            <ThemedText
                                style={[styles.time, styles.timeStatic, { color: secondaryColor }]}
                                numberOfLines={1}
                            >
                                {displayTime}
                            </ThemedText>
                        )}
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
                                {durationHours != null ? `${durationHours} hours` : '—'}
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
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(6),
        paddingVertical: heightPixel(4),
        paddingHorizontal: widthPixel(8),
        borderWidth: StyleSheet.hairlineWidth,
        maxWidth: '58%',
    },
    timeBadgeSoon: {
        opacity: 0.95,
    },
    timeLive: {
        fontFamily: 'Bold',
        fontSize: fontPixel(13),
        letterSpacing: 0.3,
        fontVariant: ['tabular-nums'],
    },
    timeSoon: {
        fontFamily: 'SemiBold',
        letterSpacing: -0.2,
    },
    timeStatic: {
        fontFamily: 'Medium',
        letterSpacing: -0.15,
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
});

