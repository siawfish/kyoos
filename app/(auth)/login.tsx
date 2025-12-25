import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useEffect } from 'react'
import Button from '@/components/ui/Button'
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView'
import { ThemedText } from '@/components/ui/Themed/ThemedText'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import PhoneInput from '@/components/ui/PhoneInput'
import { colors } from '@/constants/theme/colors'
import { useThemeColor } from '@/hooks/use-theme-color'
import { selectLoginFormIsLoading, selectLoginFormPhoneNumber } from '@/redux/auth/selector'
import { actions } from '@/redux/auth/slice'
import { validateGhanaianPhoneNumber } from '@/constants/helpers/validations'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

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
  }, [phoneNumber.value]);

  const handleContinue = () => {
    const error = validateGhanaianPhoneNumber(phoneNumber.value);
    if (error) {
      dispatch(actions.setLoginFormErrors({key: 'phoneNumber', value: error}));
      return;
    }
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
          <View style={styles.titleContainer}>
            <ThemedText 
              type='title'
            >
              Enter your phone
            </ThemedText>
            <ThemedText 
              style={styles.subtitle} 
              type='subtitle'
              lightColor={colors.light.secondary}
              darkColor={colors.dark.secondary}
            >
              You will receive a 4 digit code to verify your account
            </ThemedText>
          </View>
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
          onPress={handleContinue}
          label='Continue'
          style={styles.buttonStyle}
          isLoading={isLoading}
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
    marginTop: "20%",
    marginBottom: "6%",
  },
  titleContainer: {
    paddingHorizontal: widthPixel(16),
  },
  subtitle: {
    width: "90%",
    fontSize: fontPixel(16),
    marginTop: heightPixel(10)
  },
  buttonStyle: {
    marginHorizontal: widthPixel(16),
    marginBottom: heightPixel(16)
  }
})