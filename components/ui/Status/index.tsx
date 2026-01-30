import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { useBookingStatus } from '@/hooks/useBookingStatus';
import { Booking } from '@/redux/booking/types';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';

type BadgeSize = 'small' | 'medium' | 'large';

interface StatusProps {
    booking: Booking;
    size?: BadgeSize;
}

const sizeStyles: Record<BadgeSize, { container: ViewStyle; text: TextStyle }> = {
    small: {
        container: {
            paddingHorizontal: widthPixel(6),
            paddingVertical: heightPixel(2),
        },
        text: {
            fontSize: fontPixel(9),
            letterSpacing: 1,
        },
    },
    medium: {
        container: {
            paddingHorizontal: widthPixel(8),
            paddingVertical: heightPixel(2),
        },
        text: {
            fontSize: fontPixel(10),
            letterSpacing: 1,
        },
    },
    large: {
        container: {
            paddingHorizontal: widthPixel(10),
            paddingVertical: heightPixel(4),
        },
        text: {
            fontSize: fontPixel(10),
            letterSpacing: 1.5,
        },
    },
};

const Status = ({
    booking,
    size = 'medium',
}: StatusProps) => {
    const { statusColor } = useBookingStatus(booking);
    const sizeStyle = sizeStyles[size];

    return (
        <View style={[styles.container, sizeStyle.container, { borderColor: statusColor }]}>
            <Text style={[styles.text, sizeStyle.text, { color: statusColor }]}>
                {booking.status}
            </Text>
        </View>
    );
};

export default Status;

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
    },
    text: {
        textTransform: 'uppercase',
        fontFamily: 'SemiBold',
    },
});
