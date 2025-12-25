import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native'
import React, { forwardRef } from 'react'
import { widthPixel } from '@/constants/normalize';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';

interface IconButtonProps extends TouchableOpacityProps {
    children: React.ReactNode;
    lightColor?: string;
    darkColor?: string;
}

const IconButton = forwardRef<any, IconButtonProps>(({
    onPress,
    children,
    style,
    lightColor,
    darkColor,
    ...props
}, ref) => {
    const backgroundColor = useThemeColor({
        light: lightColor ?? colors.light.background,
        dark: darkColor ?? colors.dark.background
    }, 'background');
    return (
        <TouchableOpacity 
            ref={ref}
            style={[styles.container, {backgroundColor}, style]}
            onPress={onPress}
            {...props}
        >
            {children}
        </TouchableOpacity>
    )
});

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: widthPixel(48),
        height: widthPixel(48),
        borderRadius: widthPixel(24),
    }
})

export default IconButton
