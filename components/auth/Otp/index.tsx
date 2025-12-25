import { StyleSheet, View } from 'react-native'
import React, { useCallback } from 'react'
import { OtpInput } from 'react-native-otp-entry'
import { widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useThemeColor } from '@/hooks/use-theme-color'

const OtpField = ({
    onTextChange,
    error,
}: {
    onTextChange: (text: string) => void;
    error?: string;
}) => {
    const backgroundColor = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background
    }, 'background') as string;
    const color = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text
    }, 'text') as string;

    const handleTextChange = useCallback((text: string) => {
        // Remove any non-numeric characters
        const numericText = text.replace(/[^0-9]/g, '');
        // Limit to 4 digits
        const limitedText = numericText.slice(0, 6);
        onTextChange(limitedText);
    }, [onTextChange]);

    return (
        <View style={styles.wrapper}>
            <OtpInput 
                theme={{
                    containerStyle: {
                        ...styles.containerStyle,
                        backgroundColor,
                    },
                    pinCodeContainerStyle: {
                        ...styles.pinCodeContainerStyle,
                        borderColor: error ? colors.light.danger : colors.light.tint,
                    },
                    pinCodeTextStyle: {
                        ...styles.pinCodeTextStyle,
                        color,
                    },
                }}
                focusColor={error ? colors.light.danger : colors.light.tint}   
                numberOfDigits={6}
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
    containerStyle: {
        marginHorizontal: widthPixel(16),
        gap: widthPixel(16),
        paddingHorizontal: widthPixel(16),
    },
    pinCodeContainerStyle: {
        flex:1,
        height: widthPixel(60),
        maxWidth: widthPixel(60),
    },
    pinCodeTextStyle: {
        fontFamily: 'Bold',
    },
})
