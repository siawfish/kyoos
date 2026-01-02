import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface SettingsItemProps {
    title: string;
    icon: string;
    color?: string;
    borderColor?: string;
    href?: string;
    onPress?: () => void;
}

const SettingsItem = ({ title, icon, color, borderColor, href, onPress }: SettingsItemProps) => {
  const router = useRouter();
  const theme = useAppTheme();
  const isDark = theme === 'dark';
  const caretColor = useThemeColor({ light: colors.light.secondary, dark: colors.dark.secondary }, 'text');

  // Check if this is Delete Account (keep original color behavior)
  const isDeleteAccount = title === 'Delete Account';

  // For Delete Account, use the original color; otherwise use consistent colors
  const iconColor = isDeleteAccount 
    ? color 
    : (isDark ? colors.dark.white : colors.light.black);
  
  const iconBackgroundColor = isDeleteAccount
    ? `${color}20`
    : (isDark ? colors.dark.grey : colors.light.grey);

  return (
    <TouchableOpacity onPress={onPress ? onPress : () => router.push(href as any)} style={[styles.settingsItem, { borderColor: borderColor, borderBottomWidth: borderColor ? 1 : 0 }]}>
      <View style={styles.settingsItemContent}>
        <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
          <Ionicons name={icon as any} size={22} color={iconColor} />
        </View>
        <ThemedText style={styles.titleText}>{title}</ThemedText>
      </View>
      {
        href && (
          <Ionicons name="chevron-forward" size={20} color={caretColor} />
        )
      }
    </TouchableOpacity>
);
}

const styles = StyleSheet.create({
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: heightPixel(16),
        paddingHorizontal: widthPixel(20),
    },
    settingsItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(12),
    },
    iconContainer: {
        width: widthPixel(40),
        height: widthPixel(40),
        borderRadius: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: fontPixel(14),
        fontFamily: 'Medium',
    },
});

export default SettingsItem;
