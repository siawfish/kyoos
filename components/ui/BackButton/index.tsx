import { colors } from '@/constants/theme/colors'
import { useThemeColor } from '@/hooks/use-theme-color'
import { Feather } from '@expo/vector-icons'
import React from 'react'
import { ViewStyle } from 'react-native'
import IconButton from '../IconButton'

interface BackButtonProps {
    readonly containerStyle?: ViewStyle | ViewStyle[]
    readonly onPress?: () => void
    readonly iconName?: "x" | "arrow-left" | "menu"
    readonly iconColor?: string
}

export default function BackButton({
    containerStyle,
    onPress,
    iconName = "x",
    iconColor
}: BackButtonProps) {
    const color = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.white
    }, 'background');
    return (
        <IconButton 
            lightColor={colors.light.black}
            darkColor={colors.dark.black}
            onPress={onPress} 
            style={containerStyle}
        >
            <Feather name={iconName} size={24} color={iconColor || color} />
        </IconButton>
    )
}
