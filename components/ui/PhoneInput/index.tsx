import Ghana from '@/assets/svgs/ic_ghana.svg';
import { widthPixel, fontPixel, heightPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { memo, useCallback, useRef, useEffect } from 'react';
import { Animated, Easing, StyleSheet, TextInput, TextInputProps, View, ViewStyle, Image } from 'react-native';
import { ThemedText } from '../Themed/ThemedText';
import { actions } from '@/redux/auth/slice';
import { useDispatch } from 'react-redux';

interface PhoneInputProps extends TextInputProps {
    containerStyle?: ViewStyle;
    error?: string;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const PhoneInput = memo(({
    style,
    placeholder = 'Enter your phone number',
    keyboardType = 'phone-pad',
    textContentType = 'telephoneNumber',
    maxLength = 10,
    containerStyle,
    clearButtonMode = 'while-editing',
    autoFocus,
    value,
    onChangeText,
    error,
    ...rest
}: PhoneInputProps) => {
    const dispatch = useDispatch();
    const backgroundColor = useThemeColor({
        light: colors.light.misc,
        dark: colors.dark.misc,
    }, 'misc');
    const color = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text,
    }, 'text');

    const borderColor = useThemeColor({
        light: error ? colors.light.danger : colors.light.tint,
        dark: error ? colors.dark.danger : colors.dark.tint
    }, 'tint');

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint
    }, 'tint');

    const errorColor = useThemeColor({
        light: colors.light.danger,
        dark: colors.dark.danger
    }, 'danger');

    // Animated borderWidth
    const borderWidthAnim = useRef(new Animated.Value(0.3)).current;

    const handleChangeText = useCallback((text: string) => {
        // Remove any non-numeric characters and limit to maxLength
        const numericText = text.replace(/[^0-9]/g, '').slice(0, maxLength);
        onChangeText?.(numericText);
    }, [maxLength, onChangeText]);

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

    // Preserve kyoos-specific logic
    useEffect(()=>{
        dispatch(actions.resetAuthState());
    },[])

    return (
        <View style={[styles.inputContainer, containerStyle]}>
            <View style={styles.prefixContainer}>
                <Ghana height={widthPixel(24)} width={widthPixel(32)} style={styles.ghanaFlag} />
                <ThemedText
                    type='default'
                    lightColor={colors.light.secondary}
                    darkColor={colors.dark.secondary}
                    style={styles.prefixText}
                >
                    +233
                </ThemedText>
            </View>
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
                    style,
                ]}
                cursorColor={error ? errorColor : tintColor}
                placeholder={placeholder}
                keyboardType={keyboardType}
                textContentType={textContentType}
                maxLength={maxLength}
                clearButtonMode={clearButtonMode}
                autoFocus={autoFocus}
                value={value}
                onChangeText={handleChangeText}
                onFocus={onFocus}
                onBlur={onBlur}
                {...rest}
            />
            {
                error && (
                    <ThemedText
                        type='default'
                        lightColor={colors.light.danger}
                        darkColor={colors.dark.danger}
                        style={styles.errorText}
                    >
                        {error}
                    </ThemedText>
                )
            }
        </View>
    );
});

const styles = StyleSheet.create({
    inputContainer: {
        position: 'relative',
    },
    input: {
        fontSize: widthPixel(18),
        fontFamily: 'Regular',
        paddingLeft: widthPixel(105),
        height: widthPixel(60),
        borderRadius: 0,
    },
    prefixContainer: {
        position: 'absolute',
        top: widthPixel(16),
        left: widthPixel(16),
        height: widthPixel(60),
        zIndex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ghanaFlag: {
        height: widthPixel(24),
        borderRadius: 0,
    },
    prefixText: {
        fontSize: widthPixel(18),
        fontFamily: 'Regular',
        marginLeft: widthPixel(8),
    },
    errorText: {
        fontSize: widthPixel(14),
        marginTop: widthPixel(5),
        marginLeft: widthPixel(16),
    },
});

export default PhoneInput;
