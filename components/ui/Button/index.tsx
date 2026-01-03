import { heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { forwardRef } from 'react';
import { ActivityIndicator, Platform, StyleSheet, TextStyle, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { ThemedText } from '../Themed/ThemedText';

interface ButtonProps extends TouchableOpacityProps {
  labelStyle?: TextStyle | TextStyle[];
  label?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  lightBackgroundColor?: string;
  darkBackgroundColor?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

const Button = forwardRef<View, ButtonProps>(({
    style,
    labelStyle,
    label='Button',
    onPress,
    icon,
    children,
    lightBackgroundColor,
    darkBackgroundColor,
    disabled,
    isLoading
}, ref) => {
    const backgroundColor = useThemeColor({
        light: lightBackgroundColor || colors.light.black,
        dark: darkBackgroundColor || colors.dark.white
    }, 'background');
    const color = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black
    }, 'text');
  return (
    <TouchableOpacity 
        ref={ref}
        onPress={onPress}
        style={[
            styles.button, 
            {
                backgroundColor
            },
            (disabled || isLoading) && styles.disabled,
            style
        ]}
        disabled={disabled || isLoading}
    >
        {isLoading && <ActivityIndicator color={color} style={styles.loader} />}
        {icon}
        {children ? 
            children :
            <ThemedText 
                type='defaultSemiBold'
                style={[
                    {
                      color
                    },
                    labelStyle
                ]}
            >
                {label}
            </ThemedText>
        }
    </TouchableOpacity>
  )
})

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    display: 'flex',
    justifyContent: 'center',
    height: heightPixel(56),
    alignItems: 'center',
    marginHorizontal: widthPixel(16),
    borderRadius: 0,
    flexDirection: 'row',
    gap: widthPixel(10),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  disabled: {
    opacity: 0.5,
  },
  loader: {
    marginRight: widthPixel(8)
  }
})

export default Button
