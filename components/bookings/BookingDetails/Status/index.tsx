import { StyleSheet, View } from 'react-native'
import React from 'react'
import { ThemedText } from '@/components/ui/Themed/ThemedText'
import { BookingStatuses } from '@/redux/app/types'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { getStatusColors } from '@/constants/helpers';

interface StatusProps {
    status?: BookingStatuses;
}

const Status = ({
    status = BookingStatuses.PENDING
}:StatusProps) => {
    return (
        <View style={[styles.container, {backgroundColor: getStatusColors(status)?.backgroundColor}]}>
            <View style={[styles.dot, { backgroundColor: getStatusColors(status)?.color }]} />
            <ThemedText style={[styles.text, { color:getStatusColors(status)?.color }]}>{status}</ThemedText>
        </View>
    )
};

export default Status;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
        paddingHorizontal: widthPixel(8),
        paddingVertical: heightPixel(5),
        borderRadius: 8,
    },
    text: {
        textTransform: 'capitalize',
        fontSize: fontPixel(14),
    },
    dot: {
        width: widthPixel(10),
        height: widthPixel(10),
        borderRadius: widthPixel(5),
    }
});