import { heightPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useThemeColor } from '@/hooks/use-theme-color'
import React from 'react'
import { StyleSheet, ViewStyle } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ThemedText } from '../Themed/ThemedText'

interface IconTextButtonProps {
    icon: React.ReactNode
    text: string
    containerStyle?: ViewStyle | ViewStyle[]
    textColor?: string
    onPress?: () => void
}

const IconTextButton = ({
    icon,
    text,
    containerStyle,
    textColor,
    onPress
}:IconTextButtonProps) => {
    const color = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.tint
    }, 'background');
    return (
        <TouchableOpacity onPress={onPress} style={[styles.container, containerStyle]}>
            {icon}
            <ThemedText style={[styles.text, {color: textColor ?? color}]}>{text}</ThemedText>
        </TouchableOpacity>
    )
}

export default IconTextButton

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: heightPixel(8),
        marginTop: heightPixel(16),
        paddingHorizontal: heightPixel(16),
        borderRadius: 0,
    },
    text: {
        fontSize: heightPixel(16),
    }
})

