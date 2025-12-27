import infoIcon from '@/assets/images/caution.png';
import errorIcon from '@/assets/images/danger.png';
import successIcon from '@/assets/images/success.png';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { Image } from 'react-native';
import { BaseToast, ErrorToast, ToastProps } from 'react-native-toast-message';

export const createToastConfig = (colorScheme: 'light' | 'dark') => ({
  success: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: colors[colorScheme].green,
        backgroundColor: colorScheme === 'dark' ? colors.dark.black : colors.light.white,
        height: 'auto',
        paddingVertical: heightPixel(16),
        borderRadius: 0,
        marginHorizontal: 0,
        paddingHorizontal: 0,
        width: '100%',
        shadowColor: colors[colorScheme].black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      contentContainerStyle={{
        paddingHorizontal: widthPixel(16),
      }}
      text1Style={{
        fontSize: fontPixel(14),
        fontFamily: 'Bold',
        color: colorScheme === 'dark' ? colors.dark.text : colors.light.text,
      }}
      text2Style={{
        fontSize: fontPixel(16),
        fontFamily: 'Regular',
        color: colorScheme === 'dark' ? colors.dark.text : colors.light.text,
      }}
      renderTrailingIcon={()=>{
        return (
          <Image
            source={successIcon}
            style={{
              width: widthPixel(24),
              height: heightPixel(24),
              marginRight: widthPixel(16),
            }}
          />
        )
      }}
    />
  ),
  error: (props: ToastProps) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: colors[colorScheme].danger,
        backgroundColor: colors[colorScheme].dangerBackground,
        height: 'auto',
        paddingVertical: heightPixel(16),
        borderRadius: 0,
        marginHorizontal: 0,
        paddingHorizontal: 0,
        width: '100%',
        shadowColor: colors[colorScheme].black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      contentContainerStyle={{
        paddingHorizontal: widthPixel(16),
      }}
      text1Style={{
        fontSize: fontPixel(14),
        fontFamily: 'Bold',
        color: colorScheme === 'dark' ? colors.dark.text : colors.light.text,
      }}
      text2Style={{
        fontSize: fontPixel(16),
        fontFamily: 'Regular',
        color: colorScheme === 'dark' ? colors.dark.text : colors.light.text,
      }}
      renderTrailingIcon={()=>{
        return (
          <Image
            source={errorIcon}
            style={{
              width: widthPixel(24),
              height: heightPixel(24),
              marginRight: widthPixel(16),
            }}
          />
        )
      }}
    />
  ),
  info: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: colors[colorScheme].tint,
        backgroundColor: colorScheme === 'dark' ? colors.dark.black : colors.light.white,
        height: 'auto',
        paddingVertical: heightPixel(16),
        borderRadius: 0,
        marginHorizontal: 0,
        paddingHorizontal: 0,
        width: '100%',
        shadowColor: colors[colorScheme].black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }}
      contentContainerStyle={{
        paddingHorizontal: widthPixel(16),
      }}
      text1Style={{
        fontSize: fontPixel(14),
        fontFamily: 'Bold',
        color: colors.dark.tint,
      }}
      text2Style={{
        fontSize: fontPixel(16),
        fontFamily: 'Regular',
        color: colorScheme === 'dark' ? colors.dark.text : colors.light.text,
      }}
      renderTrailingIcon={()=>{
        return (
          <Image
            source={infoIcon}
            style={{
              width: widthPixel(24),
              height: heightPixel(24),
              marginRight: widthPixel(16),
            }}
          />
        )
      }}
    />
  ),
});

