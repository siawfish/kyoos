import { ThemedText } from '@/components/ui/Themed/ThemedText';
import Switch from '@/components/ui/Switch';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface SettingsToggleProps {
    title: string;
    icon: string;
    color?: string;
    onToggle: (value: boolean) => void;
    value: boolean;
    disabled?: boolean;
}

const SettingsToggle = ({ title, icon, color, onToggle, value, disabled }: SettingsToggleProps) => {
    const theme = useAppTheme();
    const isDark = theme === 'dark';

    // Use consistent colors: black icon on light gray (light mode), white icon on dark gray (dark mode)
    const iconColor = isDark ? colors.dark.white : colors.light.black;
    const iconBackgroundColor = isDark ? colors.dark.grey : colors.light.grey;

    // Switch colors: use theme-aware colors
    // Active: white in dark mode, black in light mode (or use the accent color)
    const switchActiveColor = isDark ? colors.dark.white : colors.light.black;
    // Inactive: lighter grey in dark mode for visibility (#3A3A3A), light grey in light mode
    const switchInactiveColor = isDark ? '#3A3A3A' : colors.light.grey;
    // Thumb: black in dark mode, white in light mode
    const switchThumbColor = isDark ? colors.dark.black : colors.light.white;

    return (
        <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsItemContent}>
                <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
                <Ionicons name={icon as any} size={22} color={iconColor} />
                </View>
                <ThemedText style={styles.titleText}>{title}</ThemedText>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                style={styles.switch}
                activeColor={switchActiveColor}
                inactiveColor={switchInactiveColor}
                thumbColor={switchThumbColor}
                disabled={disabled}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: heightPixel(16),
        paddingHorizontal: widthPixel(20),
    },
    settingsItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(12),
    },
    iconContainer: {
        width: widthPixel(40),
        height: widthPixel(40),
        borderRadius: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: fontPixel(14),
        fontFamily: 'Medium',
    },
    switch: {
        transform: [{ scaleX: 1 }, { scaleY: 1 }],
    },
});

export default SettingsToggle;
