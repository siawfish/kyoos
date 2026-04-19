import OtpField from '@/components/auth/Otp'
import ResendOtp from '@/components/auth/ResendOtp'
import { ScreenFooter } from '@/components/layout/ScreenFooter'
import { ScreenLayout } from '@/components/layout/ScreenLayout'
import { AccentScreenHeader } from '@/components/ui/AccentScreenHeader'
import Button from '@/components/ui/Button'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { selectLoginFormIsLoading, selectLoginFormIsResending, selectLoginFormOtp, selectLoginFormPhoneNumber, selectOtpPrefix, selectReferenceId } from '@/redux/auth/selector'
import { actions } from '@/redux/auth/slice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import * as Device from 'expo-device'
import * as Linking from 'expo-linking'
import { Link, Redirect } from 'expo-router'
import React, { useCallback } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useAppTheme } from '@/hooks/use-app-theme'
import { useThemeColor } from '@/hooks/use-theme-color'

const HUBTEL_OTP_USSD = '*713*90#'

/** iOS is picky about USSD in tel: URLs; try common encodings. Simulator cannot open tel: at all (-10814). */
function hubtelOtpUssdTelUrls(): string[] {
    if (Platform.OS === 'android') {
        return [`tel:${encodeURIComponent(HUBTEL_OTP_USSD)}`]
    }
    if (Platform.OS === 'ios') {
        return [
            `tel:${HUBTEL_OTP_USSD.replace(/#/g, '%23')}`,
            `tel:${encodeURIComponent(HUBTEL_OTP_USSD)}`,
        ]
    }
    return [`tel:${encodeURIComponent(HUBTEL_OTP_USSD)}`]
}

const Otp = () => {
    const dispatch = useAppDispatch();
    const otp = useAppSelector(selectLoginFormOtp);
    const isLoading = useAppSelector(selectLoginFormIsLoading);
    const referenceId = useAppSelector(selectReferenceId);
    const otpPrefix = useAppSelector(selectOtpPrefix);
    const phoneNumber = useAppSelector(selectLoginFormPhoneNumber);
    const colorScheme = useAppTheme();
    const isDark = colorScheme === 'dark';
    const isResending = useAppSelector(selectLoginFormIsResending);
    const textColor = isDark ? colors.dark.text : colors.light.text;
    const subtitleColor = isDark ? colors.dark.secondary : colors.light.secondary;
    const eyebrowColor = useThemeColor(
        { light: colors.light.secondary, dark: colors.dark.secondary },
        'text'
    );

    const openHubtelOtpUssd = useCallback(async () => {
        const urls = hubtelOtpUssdTelUrls()
        for (const url of urls) {
            try {
                await Linking.openURL(url)
                return
            } catch {
                /* try next encoding */
            }
        }
        Alert.alert(
            'Could not open dialer',
            !Device.isDevice
                ? `The iOS Simulator cannot open phone links (error -10814). Use a physical iPhone, or open Phone and dial ${HUBTEL_OTP_USSD} manually.`
                : `Open the Phone app and dial ${HUBTEL_OTP_USSD} from this device. If the link still fails, dial it manually — iOS sometimes blocks USSD short codes.`,
        )
    }, [])

    if (!referenceId || !otpPrefix) {
        return <Redirect href="/(auth)/login" />
    }

    return (
        <ScreenLayout
            style={styles.container}
            preset="auth"
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[
                    styles.keyboardAvoid,
                ]}
                keyboardVerticalOffset={heightPixel(60)}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.mainStyle}>
                        <AccentScreenHeader
                            containerStyle={styles.headerContainer}
                            title={
                                <View>
                                    <Text style={[styles.otpEyebrow, { color: eyebrowColor }]}>VERIFICATION</Text>
                                    <Text style={[styles.otpHeroTitle, { color: textColor }]}>
                                        Enter the{'\n'}confirmation code
                                    </Text>
                                </View>
                            }
                            subtitle={`We sent a code to ${phoneNumber.value}.`}
                            subtitleStyle={{
                                fontSize: fontPixel(15),
                                lineHeight: fontPixel(22),
                                marginBottom: heightPixel(12),
                            }}
                        />
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text style={[styles.changeNumber, { color: textColor }]}>
                                    Change number →
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                    <View style={styles.prefixOtpRow}>
                        <View style={styles.prefixGroup}>
                            <Text style={[styles.prefixLabel, { color: subtitleColor }]}>Prefix</Text>
                            <Text style={[styles.prefixValue, { color: textColor }]}>{otpPrefix}</Text>
                        </View>
                        <View style={styles.otpFieldFill}>
                            <OtpField
                                compactMargins
                                error={otp.error}
                                onTextChange={(text: string) => {
                                    dispatch(actions.setLoginFormValue({key: 'otp', value: text}));
                                }}
                            />
                        </View>
                    </View>
                    <Text style={[styles.delayHint, { color: subtitleColor }]}>
                        SMS delayed?{' '}
                        <Text
                            onPress={openHubtelOtpUssd}
                            style={[styles.shortCodeLink, { color: textColor }]}
                            accessibilityRole="link"
                            accessibilityLabel="Dial short code for delayed SMS"
                        >
                            Dial {HUBTEL_OTP_USSD}
                        </Text>
                    </Text>
                    <ResendOtp
                        onResend={() => dispatch(actions.resendOtp())}
                        isLoading={isResending}
                    />
                    <View style={styles.scrollFooterSpacer} />
                </ScrollView>
                <ScreenFooter hideBorder style={styles.footer}>
                    <Button 
                        label='Verify'
                        style={styles.continueButton}
                        disabled={otp.value.length !== 4 || !!otp.error}
                        onPress={()=>{
                            dispatch(actions.initiateLogin())
                        }}
                        isLoading={isLoading}
                    />
                </ScreenFooter>
            </KeyboardAvoidingView>
        </ScreenLayout>
    )
}

export default Otp

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        width: '100%',
    },
    scrollFooterSpacer: {
        flexGrow: 1,
        minHeight: heightPixel(1),
    },
    headerContainer: {
        paddingHorizontal: widthPixel(0),
    },
    mainStyle: {
        paddingHorizontal: widthPixel(16),
        marginBottom: heightPixel(24),
    },
    otpEyebrow: {
        fontSize: fontPixel(11),
        fontFamily: 'SemiBold',
        letterSpacing: 2,
        marginBottom: heightPixel(8),
    },
    otpHeroTitle: {
        fontSize: fontPixel(36),
        fontFamily: 'Bold',
        letterSpacing: -1,
        marginBottom: heightPixel(16),
        lineHeight: fontPixel(42),
    },
    prefixOtpRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexWrap: 'nowrap',
        alignSelf: 'stretch',
        columnGap: widthPixel(14),
        paddingHorizontal: widthPixel(16),
        marginBottom: heightPixel(12),
    },
    prefixGroup: {
        // alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    otpFieldFill: {
        flex: 1,
        minWidth: 0,
    },
    prefixLabel: {
        fontSize: fontPixel(13),
        fontFamily: 'SemiBold',
        marginBottom: heightPixel(4),
    },
    prefixValue: {
        fontSize: fontPixel(22),
        fontFamily: 'Bold',
        letterSpacing: 4,
        lineHeight: fontPixel(28),
    },
    delayHint: {
        fontSize: fontPixel(13),
        fontFamily: 'Regular',
        lineHeight: fontPixel(18),
        textAlign: 'center',
        paddingHorizontal: widthPixel(24),
        marginBottom: heightPixel(8),
    },
    shortCodeLink: {
        textDecorationLine: 'underline',
        fontFamily: 'SemiBold',
    },
    changeNumber: {
        fontSize: fontPixel(13),
        fontFamily: 'SemiBold',
        letterSpacing: 0.5,
    },
    footer: {
        paddingHorizontal: widthPixel(16),
    },
    continueButton: {
        marginHorizontal: 0,
    },
})
