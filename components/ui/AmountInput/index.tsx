import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AntDesign } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, Easing, TextInput as RNTextInput, StyleSheet, TouchableOpacity, View } from 'react-native';
import Button from '../Button';
import { ThemedText } from '../Themed/ThemedText';

interface AmountInputProps {
    initialValue?: number;
    min?: number;
    max?: number;
    step?: number;
    onChange?: (value: number) => void;
    label?: string;
    placeholder?: string;
    prefix?: string;
}

export default function AmountInput({
    initialValue = 0,
    min = 0,
    max = 999999,
    step = 1,
    onChange,
    label,
    placeholder,
    prefix
}: AmountInputProps) {
    const [value, setValue] = useState(initialValue.toString());
    const borderWidthAnim = useRef(new Animated.Value(0.3)).current;
    
    const backgroundColor = useThemeColor({
        light: colors.light.misc,
        dark: colors.dark.black,
    }, 'background');

    const color = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text
    }, 'text');

    const borderColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint
    }, 'tint');

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint
    }, 'tint');

    const buttonBackgroundColor = useThemeColor({
        light: colors.light.black,
        dark: colors.dark.white
    }, 'tint');

    const iconColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black
    }, 'text');

    const handleIncrease = () => {
        const newValue = Math.min(Number(value || 0) + step, max);
        setValue(newValue.toString());
        onChange?.(newValue);
    };

    const handleDecrease = () => {
        const newValue = Math.max(Number(value || 0) - step, min);
        setValue(newValue.toString());
        onChange?.(newValue);
    };

    const handleChangeText = (text: string) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        const numberValue = Number(numericValue);
        
        if (numericValue === '' || (numberValue >= min && numberValue <= max)) {
            setValue(numericValue);
            onChange?.(numberValue);
        }
    };

    const onFocus = () => {
        Animated.timing(borderWidthAnim, {
            toValue: 2,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease)
        }).start();
    };

    const onBlur = () => {
        Animated.timing(borderWidthAnim, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease)
        }).start();
    };

    const AnimatedTextInput = Animated.createAnimatedComponent(RNTextInput);

    return (
        <View style={styles.container}>
            {label && (
                <ThemedText
                    type='default'
                    lightColor={colors.light.secondary}
                    darkColor={colors.dark.secondary}
                    style={styles.label}
                >
                    {label}
                </ThemedText>
            )}
            <View style={styles.inputContainer}>
                {prefix && (
                    <View style={styles.prefixContainer}>
                        <ThemedText
                            type='defaultSemiBold'
                            lightColor={colors.light.secondary}
                            darkColor={colors.dark.secondary}
                            style={styles.prefix}
                        >
                            {prefix}
                        </ThemedText>
                    </View>
                )}
                <AnimatedTextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor,
                            color,
                            borderTopWidth: borderWidthAnim,
                            borderBottomWidth: borderWidthAnim,
                            borderColor,
                        },
                        prefix && styles.inputWithPrefix
                    ]}
                    value={value}
                    onChangeText={handleChangeText}
                    keyboardType="numeric"
                    selectionColor={tintColor}
                    cursorColor={tintColor}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder={placeholder}
                />
                <View style={styles.buttonsContainer}>
                    <Button
                        style={[styles.button, { backgroundColor: buttonBackgroundColor }]}
                        onPress={handleDecrease}
                    >
                        <AntDesign 
                            name="minus" 
                            size={16} 
                            color={iconColor}
                        />
                    </Button>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: buttonBackgroundColor }]} 
                        onPress={handleIncrease}
                    >
                        <AntDesign 
                            name="plus" 
                            size={16} 
                            color={iconColor}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: widthPixel(8)
    },
    label: {
        fontSize: fontPixel(14),
        fontFamily: 'Bold',
        marginLeft: widthPixel(16)
    },
    inputContainer: {
        position: 'relative',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        height: widthPixel(56),
    },
    input: {
        height: '100%',
        fontSize: widthPixel(18),
        fontFamily: 'Light',
        padding: widthPixel(16),
        paddingRight: widthPixel(48), // Make room for buttons
        flex: 1,
        borderWidth: 0.3,
        borderRadius: 0,
        borderRightWidth: 0,
        borderLeftWidth: 0,
    },
    inputWithPrefix: {
        paddingLeft: widthPixel(60),
    },
    prefixContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
    prefix: {
        fontSize: widthPixel(18),
        paddingLeft: widthPixel(16),
    },
    buttonsContainer: {
        position: 'absolute',
        right: widthPixel(16),
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 0,
        paddingVertical: widthPixel(4),
        zIndex: 2
    },
    button: {
        height: widthPixel(24),
        width: widthPixel(24),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 0
    },
    divider: {
        width: "100%",
        height: heightPixel(1),
        marginVertical: widthPixel(2),
    }
});

