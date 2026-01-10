import OtpField from '@/components/auth/Otp'
import Button from '@/components/ui/Button'
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { selectLoginFormIsLoading, selectLoginFormOtp, selectLoginFormPhoneNumber, selectReferenceId } from '@/redux/auth/selector'
import { actions } from '@/redux/auth/slice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Link, Redirect } from 'expo-router'
import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useAppTheme } from '@/hooks/use-app-theme'

const Otp = () => {
    const dispatch = useAppDispatch();
    const otp = useAppSelector(selectLoginFormOtp);
    const isLoading = useAppSelector(selectLoginFormIsLoading);
    const referenceId = useAppSelector(selectReferenceId);
    const phoneNumber = useAppSelector(selectLoginFormPhoneNumber);
    const colorScheme = useAppTheme();
    const isDark = colorScheme === 'dark';

    const textColor = isDark ? colors.dark.text : colors.light.text;
    const subtitleColor = isDark ? colors.dark.secondary : colors.light.secondary;
    const accentColor = isDark ? colors.dark.white : colors.light.black;

    if (!referenceId) {
        return <Redirect href="/(auth)/login" />
    }

    return (
        <ThemedSafeAreaView
            style={styles.container}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.mainStyle}>
                        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                        <Text style={[styles.label, { color: subtitleColor }]}>
                            VERIFICATION
                        </Text>
                        <Text style={[styles.title, { color: textColor }]}>
                            Enter the{'\n'}confirmation code
                        </Text>
                        <Text style={[styles.subtitle, { color: subtitleColor }]}>
                            Please enter the 6 digit code sent to {phoneNumber.value}
                        </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text style={[styles.changeNumber, { color: textColor }]}>
                                    Change number →
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                    <OtpField
                        error={otp.error}
                        onTextChange={(text: string) => {
                            dispatch(actions.setLoginFormValue({key: 'otp', value: text}));
                        }}
                    />
                    <Button 
                        label='Verify'
                        style={styles.continueButton}
                        disabled={otp.value.length !== 6 || !!otp.error}
                        onPress={()=>{
                            dispatch(actions.initiateLogin())
                        }}
                        isLoading={isLoading}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedSafeAreaView>
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
    },
    mainStyle: {
        marginTop: "15%",
        paddingHorizontal: widthPixel(20),
        marginBottom: heightPixel(32),
    },
    accentBar: {
        width: widthPixel(40),
        height: heightPixel(4),
        marginBottom: heightPixel(24),
    },
    label: {
        fontSize: fontPixel(11),
        fontFamily: 'SemiBold',
        letterSpacing: 2,
        marginBottom: heightPixel(8),
    },
    title: {
        fontSize: fontPixel(36),
        fontFamily: 'Bold',
        lineHeight: fontPixel(42),
        letterSpacing: -1,
        marginBottom: heightPixel(16),
    },
    subtitle: {
        fontSize: fontPixel(15),
        fontFamily: 'Regular',
        lineHeight: fontPixel(22),
        marginBottom: heightPixel(16),
    },
    changeNumber: {
        fontSize: fontPixel(13),
        fontFamily: 'SemiBold',
        letterSpacing: 0.5,
    },
    continueButton: {
        marginTop: 'auto',
        marginBottom: heightPixel(20),
        marginHorizontal: widthPixel(20),
    },
})
