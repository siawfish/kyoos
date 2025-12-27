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
import { KeyboardAvoidingView, Platform, StyleSheet, Text, useColorScheme, View } from 'react-native'

export default function Login() {
  const dispatch = useAppDispatch();
  const phoneNumber = useAppSelector(selectLoginFormPhoneNumber);
  const isLoading = useAppSelector(selectLoginFormIsLoading);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const inputBackgroundColor = useThemeColor({
      light: colors.light.white,
      dark: colors.dark.black
  }, 'white');

  const textColor = isDark ? colors.dark.text : colors.light.text;
  const subtitleColor = isDark ? colors.dark.secondary : colors.light.secondary;
  const accentColor = isDark ? colors.dark.white : colors.light.black;

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
          <View style={styles.titleContainer}>
            <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
            <Text style={[styles.label, { color: subtitleColor }]}>
              SIGN IN
            </Text>
            <Text style={[styles.title, { color: textColor }]}>
              Enter your{'\n'}phone number
            </Text>
            <Text style={[styles.subtitle, { color: subtitleColor }]}>
              You will receive a 6 digit code to verify your account
            </Text>
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
  },
  buttonStyle: {
    marginHorizontal: widthPixel(20),
    marginBottom: heightPixel(20)
  }
})
