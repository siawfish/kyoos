import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React from 'react'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import Button from '@/components/ui/Button'
import OtpField from '@/components/auth/Otp'
import BackButton from '@/components/ui/BackButton'
import { Link, Redirect, router } from 'expo-router'
import { colors } from '@/constants/theme/colors'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { actions } from '@/redux/auth/slice'
import { selectLoginFormIsLoading, selectLoginFormOtp, selectLoginFormPhoneNumber, selectReferenceId } from '@/redux/auth/selector'
import { ThemedText } from '@/components/ui/Themed/ThemedText'
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView'

const Otp = () => {
    const dispatch = useAppDispatch();
    const otp = useAppSelector(selectLoginFormOtp);
    const isLoading = useAppSelector(selectLoginFormIsLoading);
    const referenceId = useAppSelector(selectReferenceId);
    const phoneNumber = useAppSelector(selectLoginFormPhoneNumber);

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
                    <BackButton 
                        containerStyle={styles.backButton}
                        onPress={()=>router.back()}
                        iconName="arrow-left"
                    />
                    <View style={styles.mainStyle}>
                        <ThemedText 
                            type='title'
                        >
                            Enter the confirmation code
                        </ThemedText>
                        <ThemedText 
                            style={styles.subtitle} 
                            type='subtitle'
                            lightColor={colors.light.secondary}
                            darkColor={colors.dark.secondary}
                        >
                            To confirm your phone number, please enter the 6 digit code sent to your phone {phoneNumber.value}
                        </ThemedText>
                        <Link href="/(auth)" asChild>
                            <ThemedText
                                style={styles.subtitle}
                                type='subtitle'
                                lightColor={colors.light.tint}
                                darkColor={colors.dark.tint}
                            >
                                Change phone number
                            </ThemedText>
                        </Link>
                    </View>
                    <OtpField
                        error={otp.error}
                        onTextChange={(text: string) => {
                            dispatch(actions.setLoginFormValue({key: 'otp', value: text}));
                        }}
                    />
                    <Button 
                        label='Continue'
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
    backButton: {
        margin: widthPixel(16),
    },
    mainStyle: {
        paddingHorizontal: widthPixel(16),
        marginBottom: "6%",
    },
    subtitle: {
        width: "90%",
        fontSize: fontPixel(16),
        marginTop: heightPixel(10)
    },
    continueButton: {
        marginTop: 'auto',
        marginBottom: heightPixel(20),
    },
})