import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { AuxStatus } from '@/redux/bookings/types';
import { useThemeColor } from '@/hooks/use-theme-color';

type BadgeSize = 'small' | 'medium' | 'large';
interface AuxStatusesProps {
    size?: BadgeSize;
    type?: AuxStatus;
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

const AuxStatuses = ({
    size = 'medium',
    type = AuxStatus.PASSED,
}: AuxStatusesProps) => {
    const dangerColor = useThemeColor({ light: colors.light.danger, dark: colors.dark.danger }, 'danger');
    const dueColor = useThemeColor({ light: colors.light.orange, dark: colors.dark.orange }, 'orange');
    const sizeStyle = sizeStyles[size];

    return (
        <View style={[styles.container, sizeStyle.container, { borderColor: type === AuxStatus.PASSED ? dangerColor : dueColor }]}>
            <Text style={[styles.text, sizeStyle.text, { color: type === AuxStatus.PASSED ? dangerColor : dueColor }]}>
                {type}
            </Text>
        </View>
    );
};

export default AuxStatuses;

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
    },
    text: {
        textTransform: 'uppercase',
        fontFamily: 'SemiBold',
    },
});
