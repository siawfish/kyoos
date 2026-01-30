import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Portal } from '@gorhom/portal';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import ProgressBar from '@/components/ui/ProgressBar';
import { useAppTheme } from '@/hooks/use-app-theme';
import { colors } from '@/constants/theme/colors';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';

interface UpdateOverlayProps {
  /** Download progress percentage (0-100) */
  progress: number;
}

/**
 * Full-screen overlay shown during update download.
 * Displays a blur background with progress indicator.
 */
export default function UpdateOverlay({ progress }: UpdateOverlayProps) {
  const theme = useAppTheme();
  const isDark = theme === 'dark';

  const cardBackgroundColor = isDark ? colors.dark.misc : colors.light.background;
  const spinnerColor = isDark ? colors.dark.white : colors.light.black;

  return (
    <Portal>
      <BlurView
        intensity={30}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.container}>
        <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
          <ActivityIndicator 
            size="large" 
            color={spinnerColor}
            style={styles.spinner}
          />
          
          <ThemedText style={styles.title} type="defaultSemiBold">
            Downloading Update
          </ThemedText>
          
          <ThemedText 
            style={styles.subtitle}
            lightColor={colors.light.secondary}
            darkColor={colors.dark.secondary}
          >
            Please wait while we download the latest version
          </ThemedText>

          <View style={styles.progressContainer}>
            <ProgressBar progress={progress} />
            <ThemedText 
              style={styles.progressText}
              lightColor={colors.light.secondary}
              darkColor={colors.dark.secondary}
            >
              {Math.round(progress)}%
            </ThemedText>
          </View>
        </View>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: widthPixel(32),
  },
  card: {
    width: '100%',
    padding: widthPixel(24),
    borderRadius: widthPixel(12),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  spinner: {
    marginBottom: heightPixel(16),
  },
  title: {
    fontSize: fontPixel(18),
    textAlign: 'center',
    marginBottom: heightPixel(8),
  },
  subtitle: {
    fontSize: fontPixel(14),
    textAlign: 'center',
    marginBottom: heightPixel(24),
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressText: {
    fontSize: fontPixel(12),
    marginTop: heightPixel(8),
  },
});
