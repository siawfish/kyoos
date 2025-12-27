import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface SkillPillProps {
    skill: string;
    rate?: string;
    icon?: string;
    onRemove: () => void;
}

const SkillPill = ({ skill, rate, icon, onRemove }: SkillPillProps) => {
    const borderColor = useThemeColor({
        light: colors.light.black,
        dark: colors.dark.white
    }, 'text');
    const backgroundColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black
    }, 'background');
    const secondaryTextColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary
    }, 'secondary');
    const iconColor = useThemeColor({
        light: colors.light.black,
        dark: colors.dark.white
    }, 'text');
    const removeIconColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary
    }, 'secondary');

    // Icon container background - use white background
    const iconContainerBg = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.white
    }, 'white');

    // Check if icon is a URL or a MaterialIcons name
    const hasIcon = icon && icon.trim().length > 0;
    const isIconUrl = hasIcon && (icon.startsWith('http') || icon.startsWith('https') || icon.startsWith('data:'));
    const iconName = hasIcon && !isIconUrl ? icon : 'work';

    return (
        <View style={[styles.container, { borderColor, backgroundColor }]}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: iconContainerBg }]}>
                    {hasIcon && isIconUrl ? (
                        <Image 
                            source={{ uri: icon }} 
                            style={styles.iconImage}
                            resizeMode="contain"
                        />
                    ) : (
                        <MaterialIcons name={iconName as any} size={18} color={borderColor} />
                    )}
                </View>
                <View style={styles.textContainer}>
                    <ThemedText
                        style={styles.skillText}
                        type='defaultSemiBold'
                        lightColor={colors.light.text}
                        darkColor={colors.dark.text}
                    >
                        {skill}
                    </ThemedText>
                    {rate && (
                        <View style={styles.rateContainer}>
                            <ThemedText
                                style={styles.rateText}
                                type='default'
                                lightColor={colors.light.secondary}
                                darkColor={colors.dark.secondary}
                            >
                                {rate}
                            </ThemedText>
                        </View>
                    )}
                </View>
            </View>
            <TouchableOpacity 
                onPress={onRemove} 
                style={styles.removeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <MaterialIcons name="close" size={20} color={removeIconColor} />
            </TouchableOpacity>
        </View>
    )
}

export default SkillPill;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: heightPixel(14),
        paddingHorizontal: widthPixel(16),
        borderRadius: 0,
        borderWidth: 1,
        minHeight: heightPixel(56),
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: widthPixel(12),
    },
    iconContainer: {
        width: widthPixel(32),
        height: widthPixel(32),
        borderRadius: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
        gap: heightPixel(4),
    },
    skillText: {
        fontSize: fontPixel(16),
    },
    rateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rateText: {
        fontSize: fontPixel(14),
    },
    removeButton: {
        padding: widthPixel(4),
        marginLeft: widthPixel(8),
    },
    iconImage: {
        width: widthPixel(18),
        height: widthPixel(18),
    }
})

