import { AccentScreenHeader } from '@/components/ui/AccentScreenHeader'
import Button from '@/components/ui/Button'
import PhoneInput from '@/components/ui/PhoneInput'
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView'
import { validateGhanaianPhoneNumber } from '@/constants/helpers/validations'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useThemeColor } from '@/hooks/use-theme-color'
import { selectLoginFormIsLoading, selectLoginFormPhoneNumber } from '@/redux/auth/selector'
import { actions } from '@/redux/auth/slice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import React, { useEffect } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'

export default function Login() {
  const dispatch = useAppDispatch();
  const phoneNumber = useAppSelector(selectLoginFormPhoneNumber);
  const isLoading = useAppSelector(selectLoginFormIsLoading);
  const inputBackgroundColor = useThemeColor({
      light: colors.light.white,
      dark: colors.dark.black
  }, 'white');

  useEffect(() => {
    if (phoneNumber.value.length === 10) {
      const error = validateGhanaianPhoneNumber(phoneNumber.value);
      if (error) {
        dispatch(actions.setLoginFormErrors({key: 'phoneNumber', value: error}));
        return;
      }
      dispatch(actions.setLoginFormErrors({key: 'phoneNumber', value: ''}));
    }
  }, [phoneNumber.value, dispatch]);

  const handleContinue = () => {
    dispatch(actions.verifyPhoneNumber());
  }

  return (
    <ThemedSafeAreaView 
      style={styles.containerStyle}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.mainStyle}>
          <AccentScreenHeader
            paddingPreset="none"
            containerStyle={styles.titleContainer}
            accentSpacing="loose"
            labelVariant="hero"
            label="SIGN IN"
            title={'Enter your\nphone number'}
            titlePreset="hero"
            titleStyle={{ marginBottom: heightPixel(16), lineHeight: fontPixel(42) }}
            subtitle="You will receive a 4-digit code to verify your account"
            subtitleStyle={{ fontSize: fontPixel(15), lineHeight: fontPixel(22) }}
          />
          <PhoneInput 
            style={{marginTop: widthPixel(16), backgroundColor: inputBackgroundColor}}
            containerStyle={{marginBottom: '8%'}}
            value={phoneNumber.value}
            onChangeText={(text) => {
              dispatch(actions.setLoginFormValue({key: 'phoneNumber', value: text}));
            }}
            error={phoneNumber.error}
          />
        </View>
        <Button 
          isLoading={isLoading}
          onPress={handleContinue}
          label='Continue'
          style={styles.buttonStyle}
          disabled={phoneNumber.error !== '' || phoneNumber.value.length !== 10}
        />
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
  )
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  mainStyle: {
    flex: 1,
    marginTop: "15%",
    marginBottom: "6%",
  },
  titleContainer: {
    paddingHorizontal: widthPixel(20),
  },
  buttonStyle: {
    marginHorizontal: widthPixel(20),
    marginBottom: heightPixel(20)
  }
})
