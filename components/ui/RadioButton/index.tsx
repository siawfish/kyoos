import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface RadioButtonProps {
    style?: ViewStyle;
    checked?: boolean;
}

const RadioButton = ({
    style,
    checked
}:RadioButtonProps) => {
    const borderColor = useThemeColor({
        light: colors.light.grey,
        dark: colors.dark.grey
    }, 'text');
    const checkedBorderColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint
    }, 'text');
  return (
    <View style={[styles.container, checked && styles.checked, style, {borderColor : checked ? checkedBorderColor : borderColor}]} />
  )
}

const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    borderRadius: 0,
    borderWidth: 2,
  },
  checked: {
    borderWidth: 5,
  }
})

export default RadioButton
