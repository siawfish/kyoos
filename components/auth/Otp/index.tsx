import { StyleSheet, View } from 'react-native'
import React, { useCallback } from 'react'
import { OtpInput } from 'react-native-otp-entry'
import { widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useThemeColor } from '@/hooks/use-theme-color'

/** Library default: width 100% + space-between (overflows when row is full screen). Use flex-start + gap; cells flex to fill parent. */
const INLINE_OTP_GAP = widthPixel(10)

const OtpField = ({
    onTextChange,
    error,
    compactMargins,
}: {
    onTextChange: (text: string) => void;
    error?: string;
    /** Use beside prefix label in a horizontal row (tighter horizontal spacing). */
    compactMargins?: boolean;
}) => {
    const backgroundColor = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background
    }, 'background') as string;
    const color = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text
    }, 'text') as string;
    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint
    }, 'tint') as string;
    const dangerColor = useThemeColor({
        light: colors.light.danger,
        dark: colors.dark.danger
    }, 'danger') as string;

    const handleTextChange = useCallback((text: string) => {
        // Remove any non-numeric characters
        const numericText = text.replace(/[^0-9]/g, '');
        const limitedText = numericText.slice(0, 4);
        onTextChange(limitedText);
    }, [onTextChange]);

    const pinBox = compactMargins ? styles.pinCodeCompact : styles.pinCodeContainerStyle

    return (
        <View style={[styles.wrapper, compactMargins && styles.wrapperInline]}>
            <OtpInput 
                theme={{
                    containerStyle: {
                        ...styles.containerStyle,
                        ...(compactMargins ? styles.containerCompact : {}),
                        backgroundColor,
                    },
                    pinCodeContainerStyle: {
                        ...pinBox,
                        borderColor: error ? dangerColor : tintColor,
                    },
                    pinCodeTextStyle: {
                        ...styles.pinCodeTextStyle,
                        color,
                    },
                }}
                focusColor={error ? dangerColor : tintColor}   
                numberOfDigits={4}
                onTextChange={handleTextChange}
            />
        </View>
    )
}

export default OtpField

const styles = StyleSheet.create({
    wrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    wrapperInline: {
        flex: 1,
        minWidth: 0,
        alignSelf: 'stretch',
    },
    containerStyle: {
        marginHorizontal: widthPixel(16),
        gap: widthPixel(16),
        paddingHorizontal: widthPixel(16),
    },
    containerCompact: {
        marginHorizontal: 0,
        paddingHorizontal: 0,
        width: '100%',
        flex: 1,
        justifyContent: 'flex-start',
        gap: INLINE_OTP_GAP,
        alignSelf: 'stretch',
    },
    pinCodeContainerStyle: {
        flex: 1,
        height: widthPixel(60),
        maxWidth: widthPixel(60),
        borderRadius: 0,
    },
    pinCodeCompact: {
        flex: 1,
        minWidth: widthPixel(44),
        height: widthPixel(58),
        borderRadius: 0,
    },
    pinCodeTextStyle: {
        fontFamily: 'Bold',
    },
})
