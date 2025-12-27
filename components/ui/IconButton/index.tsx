import { widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface IconButtonProps extends TouchableOpacityProps {
    children: React.ReactNode;
    lightColor?: string;
    darkColor?: string;
}

const IconButton = ({
    onPress,
    children,
    style,
    lightColor,
    darkColor,
    ...props
}: IconButtonProps) => {
    const backgroundColor = useThemeColor({
        light: lightColor ?? colors.light.background,
        dark: darkColor ?? colors.dark.background
    }, 'background');
    return (
        <TouchableOpacity 
            style={[styles.container, {backgroundColor}, style]}
            onPress={onPress}
            {...props}
        >
            {children}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: widthPixel(48),
        height: widthPixel(48),
        borderRadius: 0,
    }
})

export default IconButton
