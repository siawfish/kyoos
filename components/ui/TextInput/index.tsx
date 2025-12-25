import React, { memo, useCallback, useRef } from 'react';
import { StyleSheet, TextInput, TextInputProps, View, ViewStyle, Animated, Easing, TextStyle, Image, ActivityIndicator } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { ThemedText } from '@/components/ui/Themed/ThemedText';

interface PhoneInputProps extends TextInputProps {
    containerStyle?: ViewStyle;
    label?: string;
    labelStyle?: TextStyle;
    value?: string;
    onChangeText?: (text: string) => void;
    error?: string;
    isLoading?: boolean;
    errorStyle?: TextStyle;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const InputField = memo(({
    style,
    placeholder,
    keyboardType,
    textContentType,
    maxLength,
    containerStyle,
    clearButtonMode = 'while-editing',
    label,
    labelStyle,
    multiline = false,
    value,
    onChangeText,
    error,
    isLoading = false,
    errorStyle,
    ...rest
}: PhoneInputProps) => {
    const backgroundColor = useThemeColor({
        light: colors.light.misc,
        dark: colors.dark.misc,
    }, 'misc');
    const color = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text,
    }, 'text');    

    // Animated borderWidth
    const borderWidthAnim = useRef(new Animated.Value(0.3)).current;

    const onFocus = useCallback(() => {
        Animated.timing(borderWidthAnim, {
            toValue: 2,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease),
        }).start();
    }, [borderWidthAnim]);

    const onBlur = useCallback(() => {
        Animated.timing(borderWidthAnim, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease),
        }).start();
    }, [borderWidthAnim]);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <ThemedText
                    type='default'
                    lightColor={colors.light.secondary}
                    darkColor={colors.dark.secondary}
                    style={[styles.label, labelStyle]}
                >
                    {label}
                </ThemedText>
            )}
            <AnimatedTextInput
                style={[
                    styles.input,
                    {
                        backgroundColor,
                        color,
                        borderTopWidth: borderWidthAnim, // Apply animated borderWidth
                        borderBottomWidth: borderWidthAnim, // Apply animated borderWidth
                        borderColor: error ? colors.light.error : colors.light.tint
                    },
                    style
                ]}
                selectionColor={colors.light.tint}
                cursorColor={colors.light.tint}
                placeholder={placeholder}
                keyboardType={keyboardType}
                textContentType={textContentType}
                maxLength={maxLength}
                clearButtonMode={isLoading ? 'never' : clearButtonMode}
                multiline={multiline}
                onFocus={onFocus}
                onBlur={onBlur}
                value={value}
                onChangeText={onChangeText}
                {...rest}
            />
            {
                isLoading && (
                    <ActivityIndicator size="small" color={error ? colors.light.error : colors.light.tint} style={styles.loading} />
                )
            }
            {
                error && (
                    <ThemedText
                        type='default'
                        lightColor={colors.light.error}
                        darkColor={colors.dark.error}
                        style={[styles.error, errorStyle]}
                    >
                        <Image source={require('@/assets/images/warning.png')} style={styles.errorIcon} />
                        {error}
                    </ThemedText>
                )
            }
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: widthPixel(8),
        position: 'relative'
    },
    input: {
        fontSize: widthPixel(18),
        fontFamily: 'Light',
        padding: widthPixel(16),
    },
    label: {
        fontSize: fontPixel(14),
        fontFamily: 'SemiBold',
        marginLeft: widthPixel(16)
    },
    errorIcon: {
        width: widthPixel(10),
        height: widthPixel(10),
        marginRight: widthPixel(4)
    },
    error: {
        position: 'absolute',
        bottom: heightPixel(-18),
        fontSize: fontPixel(12),
        marginLeft: widthPixel(16),
        marginTop: heightPixel(-4)
    },
    loading: {
        position: 'absolute',
        right: widthPixel(16),
        bottom: widthPixel(16),
        zIndex: 1000
    }
});

export default InputField;