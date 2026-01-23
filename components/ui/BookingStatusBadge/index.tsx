import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { BookingStatuses } from '@/redux/app/types';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';

export const getStatusColor = (status: BookingStatuses, isDark: boolean): string => {
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
        case BookingStatuses.PAUSED:
        default:
            return isDark ? colors.dark.secondary : colors.light.secondary;
    }
};

type BadgeSize = 'small' | 'medium' | 'large';

interface BookingStatusBadgeProps {
    status: BookingStatuses;
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

const BookingStatusBadge = ({
    status,
    size = 'medium',
}: BookingStatusBadgeProps) => {
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const statusColor = getStatusColor(status, isDark);
    const sizeStyle = sizeStyles[size];

    return (
        <View style={[styles.container, sizeStyle.container, { borderColor: statusColor }]}>
            <Text style={[styles.text, sizeStyle.text, { color: statusColor }]}>
                {status}
            </Text>
        </View>
    );
};

export default BookingStatusBadge;

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
    },
    text: {
        textTransform: 'uppercase',
        fontFamily: 'SemiBold',
    },
});
