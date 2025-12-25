import React, { useRef, useCallback, memo, useEffect } from 'react';
import { StyleSheet, View, ViewStyle, Animated, Easing, TextInputProps, TextInput, Image } from 'react-native';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import Ghana from '@/assets/svgs/ic_ghana.svg';
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

    const handleChangeText = useCallback((text: string) => {
        // Remove any non-numeric characters and limit to maxLength
        const numericText = text.replace(/[^0-9]/g, '').slice(0, maxLength);
        onChangeText?.(numericText);
    }, [maxLength, onChangeText]);

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
                        borderColor: error ? colors.light.danger : colors.light.tint,
                    },
                    style,
                ]}
                cursorColor={error ? colors.light.danger : colors.light.tint}
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
                        lightColor={colors.light.error}
                        darkColor={colors.dark.error}
                        style={styles.error}
                    >
                        <Image source={require('@/assets/images/warning.png')} style={styles.errorIcon} />
                        {" "}
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
        paddingVertical: widthPixel(16),
        paddingLeft: widthPixel(105),
        borderColor: colors.light.tint,
    },
    prefixContainer: {
        position: 'absolute',
        top: widthPixel(32),
        left: widthPixel(16),
        zIndex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    ghanaFlag: {
        height: widthPixel(24),
        borderRadius: widthPixel(2),
    },
    prefixText: {
        fontSize: widthPixel(18),
        fontFamily: 'Regular',
        marginLeft: widthPixel(8),
    },
    errorIcon: {
        width: widthPixel(10),
        height: widthPixel(10),
        marginRight: widthPixel(4)
    },
    error: {
        fontSize: fontPixel(12),
        marginTop: heightPixel(-4)
    }
});

export default PhoneInput;