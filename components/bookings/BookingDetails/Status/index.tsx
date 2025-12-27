import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { BookingStatuses } from '@/redux/app/types';
import React from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

interface StatusProps {
    status?: BookingStatuses;
}

const getStatusStyle = (status: BookingStatuses, isDark: boolean) => {
    switch (status) {
        case BookingStatuses.ONGOING:
            return {
                color: isDark ? colors.dark.white : colors.light.black,
                borderColor: isDark ? colors.dark.white : colors.light.black,
            };
        case BookingStatuses.COMPLETED:
            return {
                color: colors.light.green,
                borderColor: colors.light.green,
            };
        case BookingStatuses.CANCELLED:
        case BookingStatuses.DECLINED:
            return {
                color: colors.light.danger,
                borderColor: colors.light.danger,
            };
        case BookingStatuses.PENDING:
        case BookingStatuses.ACCEPTED:
        case BookingStatuses.PAUSED:
        default:
            return {
                color: isDark ? colors.dark.secondary : colors.light.secondary,
                borderColor: isDark ? colors.dark.secondary : colors.light.secondary,
            };
    }
};

const Status = ({
    status = BookingStatuses.PENDING
}:StatusProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const statusStyle = getStatusStyle(status, isDark);

    return (
        <View style={[styles.container, { borderColor: statusStyle.borderColor }]}>
            <Text style={[styles.text, { color: statusStyle.color }]}>
                {status}
            </Text>
        </View>
    )
};

export default Status;

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        paddingHorizontal: widthPixel(10),
        paddingVertical: heightPixel(4),
    },
    text: {
        textTransform: 'uppercase',
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
    },
});
