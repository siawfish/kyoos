import { fontPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import React from 'react';
import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { ThemedText } from '../Themed/ThemedText';

interface SectionTitleProps {
    readonly title?: string;
    readonly subtitle?: string;
    readonly icon?: React.ReactNode;
    children?: React.ReactNode;
    containerStyle?: ViewStyle;
    titleStyle?: TextStyle;
    subtitleStyle?: TextStyle;
}

const SectionTitle = ({
    title="Upcoming Bookings",
    subtitle="Your bookings today",
    icon,
    children,
    containerStyle={},
    titleStyle={},
    subtitleStyle={},
} : SectionTitleProps) => {
    return (
        <View style={[styles.titleContainer, containerStyle]}>
            <View style={styles.left}>
                {icon}
                <View style={styles.titleContent}>
                    <ThemedText lightColor={colors.light.text} darkColor={colors.dark.text} style={[styles.title, titleStyle]} type="title">{title}</ThemedText>
                    {
                        !!subtitle && 
                        <ThemedText lightColor={colors.light.secondary} darkColor={colors.dark.secondary} style={[styles.subtitle, subtitleStyle]} type="subtitle">{subtitle}</ThemedText>
                    }
                </View>
            </View>
            {children}
        </View>
    )
}

export default SectionTitle;

const styles = StyleSheet.create({
    icon: {
        width: widthPixel(30),
        height: widthPixel(30),
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
        justifyContent: 'space-between',
    },
    titleContent: {
        flexDirection: 'column',
    },
    title: {
        fontSize: fontPixel(16),
        lineHeight: 16,
        marginBottom: 0,
        paddingBottom: 0,
        textTransform: 'capitalize',
    },
    subtitle: {
        fontSize: fontPixel(12),
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
    }
})
