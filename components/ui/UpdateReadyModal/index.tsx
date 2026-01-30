import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Modal, Dimensions, Animated } from 'react-native';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import Button from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-app-theme';

interface UpdateReadyModalProps {
  /** Called when user taps "Restart Now" */
  onRestart: () => void;
}

/**
 * Modal shown when an update has been downloaded and is ready to apply.
 * Prompts the user to restart the app.
 */
export default function UpdateReadyModal({ onRestart }: UpdateReadyModalProps) {
  const theme = useAppTheme();
  const isDark = theme === 'dark';

  const backgroundColor = useThemeColor(
    {
      light: colors.light.background,
      dark: colors.dark.background,
    },
    'background'
  );

  const iconColor = isDark ? colors.dark.white : colors.light.black;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      // Scale animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          damping: 10,
          mass: 1,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 7,
        }),
      ]),
      // Rotation animation
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: -0.15,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0.15,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(rotateAnim, {
          toValue: 0,
          damping: 5,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [scaleAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-30deg', '30deg'],
  });

  return (
    <Modal animationType="slide" transparent style={styles.modal} visible>
      <ThemedSafeAreaView style={styles.container}>
        <View style={[styles.contentContainer, { backgroundColor }]}>
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }, { rotate: spin }],
            }}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.dark.misc : colors.light.grey }]}>
              <Ionicons
                name="checkmark-circle"
                size={widthPixel(48)}
                color={iconColor}
              />
            </View>
          </Animated.View>

          <ThemedText style={styles.title} type="defaultSemiBold">
            Update Ready
          </ThemedText>

          <ThemedText
            style={styles.text}
            lightColor={colors.light.secondary}
            darkColor={colors.dark.secondary}
          >
            The latest version has been downloaded. Restart the app to apply the update and enjoy new features and improvements.
          </ThemedText>

          <Button
            label="Restart Now"
            style={styles.btn}
            onPress={onRestart}
            icon={
              <Ionicons
                name="refresh"
                size={widthPixel(18)}
                color={isDark ? colors.dark.black : colors.light.white}
              />
            }
          />
        </View>
      </ThemedSafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    height: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: widthPixel(16),
  },
  contentContainer: {
    height: Dimensions.get('window').height / 2,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: widthPixel(24),
    gap: widthPixel(16),
    borderRadius: widthPixel(16),
  },
  iconContainer: {
    width: widthPixel(80),
    height: widthPixel(80),
    borderRadius: widthPixel(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fontPixel(24),
    textAlign: 'center',
  },
  text: {
    fontSize: fontPixel(16),
    textAlign: 'center',
    lineHeight: fontPixel(24),
  },
  btn: {
    marginTop: 'auto',
    position: 'absolute',
    bottom: heightPixel(24),
    left: widthPixel(24),
    right: widthPixel(24),
  },
});
