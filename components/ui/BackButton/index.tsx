import { ViewStyle } from 'react-native'
import React from 'react'
import IconButton from '@/components/ui/IconButton'
import { Feather } from '@expo/vector-icons'
import { useThemeColor } from '@/hooks/use-theme-color'
import { colors } from '@/constants/theme/colors'

interface BackButtonProps {
    readonly containerStyle?: ViewStyle
    readonly onPress?: () => void
    readonly iconName?: "x" | "arrow-left" | "menu"
}

export default function BackButton({
    containerStyle,
    onPress,
    iconName = "x"
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
            <Feather name={iconName} size={24} color={color} />
        </IconButton>
    )
}