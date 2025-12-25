import React, { forwardRef } from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, TextStyle, Platform, ActivityIndicator, View } from 'react-native'
import { ThemedText } from '@/components/ui/Themed/ThemedText'
import { heightPixel, widthPixel } from '@/constants/normalize';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';

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
        light: lightBackgroundColor || colors.dark.background,
        dark: darkBackgroundColor || colors.dark.black
    }, 'background');
    const color = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.white
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

const styles = StyleSheet.create({
  button: {
    display: 'flex',
    justifyContent: 'center',
    height: heightPixel(56),
    alignItems: 'center',
    marginHorizontal: widthPixel(16),
    borderRadius: widthPixel(14),
    flexDirection: 'row',
    gap: widthPixel(10),
    ...Platform.select({
      ios: {
        shadowColor: colors.light.black,
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