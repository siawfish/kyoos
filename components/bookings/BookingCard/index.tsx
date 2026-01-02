import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useAppTheme } from '@/hooks/use-app-theme'
import { Booking } from '@/redux/bookings/types'
import { BookingStatuses } from '@/redux/app/types'
import { router } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { AgendaEntry } from 'react-native-calendars'

interface BookingAgendaEntry extends AgendaEntry {
    booking?: Booking;
}

interface BookingCardProps {
    readonly reservation: BookingAgendaEntry;
    readonly isFirst?: boolean;
}

const getStatusColor = (status: BookingStatuses, isDark: boolean) => {
    switch (status) {
        case BookingStatuses.ONGOING:
            return isDark ? colors.dark.white : colors.light.black;
        case BookingStatuses.COMPLETED:
            return colors.light.green;
        case BookingStatuses.CANCELLED:
        case BookingStatuses.DECLINED:
            return colors.light.danger;
        case BookingStatuses.PENDING:
        case BookingStatuses.ACCEPTED:
        default:
            return isDark ? colors.dark.secondary : colors.light.secondary;
    }
}

const BookingCard = ({
    reservation, 
}: BookingCardProps) => {
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const booking = reservation.booking;

    if (!booking) return null;

    const cardBg = isDark ? 'transparent' : colors.light.background;
    const borderColor = isDark ? colors.dark.secondary : colors.light.black;
    const textColor = isDark ? colors.dark.text : colors.light.text;
    const labelColor = isDark ? colors.dark.secondary : colors.light.secondary;
    const statusColor = getStatusColor(booking.status, isDark);

    const startTime = booking.service.appointmentDateTime.time.value;

    return (
        <TouchableOpacity
            onPress={() => router.push(`/(tabs)/(bookings)/${booking.id}`)}
            style={[styles.card, { backgroundColor: cardBg, borderColor }]}
            activeOpacity={0.7}
        >
            <View style={[styles.leftAccent, { backgroundColor: statusColor }]} />
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <View style={[styles.statusBadge, { borderColor: statusColor }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {booking.status}
                        </Text>
                    </View>
                    <Text style={[styles.time, { color: textColor }]}>
                        {startTime}
                    </Text>
                </View>
                
                <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                    {booking.service.description}
                </Text>
                
                <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <Text style={[styles.detailLabel, { color: labelColor }]}>
                            CLIENT
                        </Text>
                        <Text style={[styles.detailValue, { color: textColor }]} numberOfLines={1}>
                            {booking.client.name}
                        </Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: labelColor }]} />
                    <View style={styles.detailItem}>
                        <Text style={[styles.detailLabel, { color: labelColor }]}>
                            DURATION
                        </Text>
                        <Text style={[styles.detailValue, { color: textColor }]}>
                            {booking.service.summary.estimatedDuration}
                        </Text>
                    </View>
                </View>
            </View>            
        </TouchableOpacity>
    )
}

export default BookingCard

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        borderWidth: 0.5,
        borderLeftWidth: 0,
        overflow: 'hidden',
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
        marginBottom: heightPixel(12),
    },
    statusBadge: {
        borderWidth: 1,
        paddingHorizontal: widthPixel(8),
        paddingVertical: heightPixel(3),
    },
    statusText: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1,
    },
    time: {
        fontSize: fontPixel(13),
        fontFamily: 'SemiBold',
    },
    title: {
        fontSize: fontPixel(18),
        fontFamily: 'Bold',
        letterSpacing: -0.5,
        marginBottom: heightPixel(16),
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
        fontSize: fontPixel(13),
        fontFamily: 'Medium',
    },
    divider: {
        width: 1,
        height: heightPixel(28),
        marginHorizontal: widthPixel(12),
        opacity: 0.3,
    },
})
