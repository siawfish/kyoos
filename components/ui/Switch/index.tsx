import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, View, ViewStyle } from 'react-native';

interface SwitchProps extends Omit<TouchableOpacityProps, 'onPress'> {
  value: boolean;
  onValueChange: (value: boolean) => void;
  style?: ViewStyle;
  activeColor?: string;
  inactiveColor?: string;
  thumbColor?: string;
}

const Switch = ({
  value,
  onValueChange,
  style,
  activeColor,
  inactiveColor,
  thumbColor,
  ...touchableProps
}: SwitchProps) => {
  const switchActiveColor = useThemeColor({
    light: activeColor || colors.light.tint,
    dark: activeColor || colors.dark.tint,
  }, 'background');

  const switchInactiveColor = useThemeColor({
    light: inactiveColor || colors.light.grey,
    dark: inactiveColor || colors.dark.secondary,
  }, 'background');

  const switchThumbColor = useThemeColor({
    light: thumbColor || colors.light.white,
    dark: thumbColor || colors.dark.black,
  }, 'background');

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
      style={[
        styles.boxySwitch,
        {
          backgroundColor: value ? switchActiveColor : switchInactiveColor
        },
        style
      ]}
      {...touchableProps}
    >
      <View style={[
        styles.boxySwitchThumb,
        {
          backgroundColor: switchThumbColor
        },
        value && styles.boxySwitchThumbActive
      ]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  boxySwitch: {
    width: widthPixel(50),
    height: heightPixel(30),
    borderRadius: widthPixel(4),
    padding: widthPixel(2),
    justifyContent: 'center',
  },
  boxySwitchThumb: {
    width: widthPixel(24),
    height: heightPixel(24),
    borderRadius: widthPixel(3),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  boxySwitchThumbActive: {
    transform: [{ translateX: widthPixel(20) }],
  }
});

export default Switch;

