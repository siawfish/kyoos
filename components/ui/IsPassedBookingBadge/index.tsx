import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';

type BadgeSize = 'small' | 'medium' | 'large';

interface IsPassedBookingBadgeProps {
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
    size = 'medium',
}: IsPassedBookingBadgeProps) => {
    const dangerColor = useThemeColor({ light: colors.light.danger, dark: colors.dark.danger }, 'danger');
    const sizeStyle = sizeStyles[size];

    return (
        <View style={[styles.container, sizeStyle.container, { borderColor: dangerColor }]}>
            <Text style={[styles.text, sizeStyle.text, { color: dangerColor }]}>
                IS PASSED
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
