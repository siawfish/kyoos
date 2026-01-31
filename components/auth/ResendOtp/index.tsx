import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, View } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { fontPixel, heightPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useThemeColor } from '@/hooks/use-theme-color'

interface ResendOtpProps {
    onResend: () => void;
    isLoading?: boolean;
    timeout?: number;
}

const ResendOtp = ({
    onResend,
    isLoading = false,
    timeout = 60,
}: ResendOtpProps) => {
    const [countdown, setCountdown] = useState(timeout);
    const [canResend, setCanResend] = useState(false);

    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text
    }, 'text') as string;

    const secondaryColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary
    }, 'secondary') as string;

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint
    }, 'tint') as string;

    useEffect(() => {
        if (countdown <= 0) {
            setCanResend(true);
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    const handleResend = useCallback(() => {
        if (!canResend || isLoading) return;
        
        onResend();
        setCountdown(timeout);
        setCanResend(false);
    }, [canResend, isLoading, onResend, timeout]);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="small" color={tintColor} />
                <Text style={[styles.text, { color: secondaryColor }]}>
                    Sending code...
                </Text>
            </View>
        );
    }

    if (canResend) {
        return (
            <TouchableOpacity 
                style={styles.container} 
                onPress={handleResend}
                activeOpacity={0.7}
            >
                <Text style={[styles.resendText, { color: textColor }]}>
                    Resend code
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.text, { color: secondaryColor }]}>
                Resend code in {countdown} second{countdown !== 1 ? 's' : ''}
            </Text>
        </View>
    );
}

export default ResendOtp

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: heightPixel(24),
        marginBottom: heightPixel(16),
    },
    text: {
        fontSize: fontPixel(14),
        fontFamily: 'Regular',
    },
    resendText: {
        fontSize: fontPixel(14),
        fontFamily: 'SemiBold',
    },
})
