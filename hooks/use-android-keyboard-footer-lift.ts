import { heightPixel } from '@/constants/normalize';
import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/** Extra bottom padding so primary actions clear the software keyboard on Android (KAV is unreliable). */
const ANDROID_FOOTER_LIFT = heightPixel(60);

/**
 * Returns extra padding (in px) to add below keyboard-avoiding content on Android while the keyboard is open.
 * iOS always returns 0 — rely on KeyboardAvoidingView / safe area there.
 */
export function useAndroidKeyboardFooterLift(): number {
  const [lift, setLift] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }
    const show = Keyboard.addListener('keyboardDidShow', () => {
      setLift(ANDROID_FOOTER_LIFT);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setLift(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return Platform.OS === 'android' ? lift : 0;
}
