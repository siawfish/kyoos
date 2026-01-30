import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { colors } from '@/constants/theme/colors';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { Portal } from '@gorhom/portal';
import { Ionicons } from '@expo/vector-icons';

interface UpdateBannerProps {
  /** Called when user taps "Update Now" */
  onUpdate: () => void;
  /** Called when user dismisses the banner */
  onDismiss: () => void;
}

/**
 * A banner component shown when an app update is available.
 * Positioned at the top of the screen below the safe area.
 */
export default function UpdateBanner({ onUpdate, onDismiss }: UpdateBannerProps) {
  const theme = useAppTheme();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();

  const backgroundColor = isDark ? colors.dark.white : colors.light.black;
  const textColor = isDark ? colors.dark.black : colors.light.white;
  const secondaryTextColor = isDark ? colors.dark.secondary : colors.light.secondary;

  return (
    <Portal>
      <View 
        style={[
          styles.container, 
          { 
            top: insets.top,
            backgroundColor,
          }
        ]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="download-outline" 
              size={widthPixel(20)} 
              color={textColor} 
            />
          </View>
          <View style={styles.textContainer}>
            <ThemedText 
              style={[styles.title, { color: textColor }]}
              type="defaultSemiBold"
            >
              Update Available
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: secondaryTextColor }]}>
              A new version is ready to install
            </ThemedText>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={onDismiss} 
            style={styles.dismissButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ThemedText style={[styles.dismissText, { color: secondaryTextColor }]}>
              Later
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={onUpdate} 
            style={[styles.updateButton, { borderColor: textColor }]}
          >
            <ThemedText style={[styles.updateText, { color: textColor }]}>
              Update Now
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: widthPixel(16),
    right: widthPixel(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: heightPixel(12),
    paddingHorizontal: widthPixel(16),
    borderRadius: widthPixel(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 9999,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: widthPixel(12),
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontPixel(14),
  },
  subtitle: {
    fontSize: fontPixel(12),
    marginTop: heightPixel(2),
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(12),
  },
  dismissButton: {
    paddingVertical: heightPixel(6),
    paddingHorizontal: widthPixel(8),
  },
  dismissText: {
    fontSize: fontPixel(13),
    fontFamily: 'Medium',
  },
  updateButton: {
    paddingVertical: heightPixel(6),
    paddingHorizontal: widthPixel(12),
    borderWidth: 1,
    borderRadius: widthPixel(4),
  },
  updateText: {
    fontSize: fontPixel(13),
    fontFamily: 'Bold',
  },
});
