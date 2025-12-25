import { BaseToast, ErrorToast, ToastProps } from 'react-native-toast-message';
import { colors } from '@/constants/theme/colors';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { Image } from 'react-native';
import successIcon from '@/assets/images/success.png';
import errorIcon from '@/assets/images/danger.png';
import infoIcon from '@/assets/images/caution.png';

export const createToastConfig = (colorscheme: 'light' | 'dark') => ({
  success: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: colors[colorscheme].green,
        backgroundColor: colorscheme === 'dark' ? colors.dark.black : colors.light.white,
        height: 'auto',
        paddingVertical: heightPixel(16),
        borderRadius: 0,
        marginHorizontal: 0,
        paddingHorizontal: 0,
        width: '100%',
        shadowColor: colors[colorscheme].black,
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
        color: colorscheme === 'dark' ? colors.dark.text : colors.light.text,
      }}
      text2Style={{
        fontSize: fontPixel(16),
        fontFamily: 'Regular',
        color: colorscheme === 'dark' ? colors.dark.text : colors.light.text,
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
        borderLeftColor: colors[colorscheme].danger,
        backgroundColor: colors[colorscheme].dangerBackground,
        height: 'auto',
        paddingVertical: heightPixel(16),
        borderRadius: 0,
        marginHorizontal: 0,
        paddingHorizontal: 0,
        width: '100%',
        shadowColor: colors[colorscheme].black,
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
        color: colorscheme === 'dark' ? colors.dark.text : colors.light.text,
      }}
      text2Style={{
        fontSize: fontPixel(16),
        fontFamily: 'Regular',
        color: colorscheme === 'dark' ? colors.dark.text : colors.light.text,
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
        borderLeftColor: colors[colorscheme].tint,
        backgroundColor: colorscheme === 'dark' ? colors.dark.black : colors.light.white,
        height: 'auto',
        paddingVertical: heightPixel(16),
        borderRadius: 0,
        marginHorizontal: 0,
        paddingHorizontal: 0,
        width: '100%',
        shadowColor: colors[colorscheme].black,
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
        color: colorscheme === 'dark' ? colors.dark.text : colors.light.text,
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