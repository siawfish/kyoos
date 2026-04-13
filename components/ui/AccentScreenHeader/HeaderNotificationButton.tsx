import IconButton from '@/components/ui/IconButton';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';

export default function HeaderNotificationButton() {
  const iconColor = useThemeColor(
    { light: colors.light.black, dark: colors.dark.black },
    'background'
  );

  return (
    <IconButton
      lightColor={colors.light.black}
      darkColor={colors.dark.black}
      onPress={() => router.push('/(tabs)/(settings)/notifications')}
      accessibilityLabel="Notifications"
    >
      <Feather name="bell" size={24} color={iconColor} />
    </IconButton>
  );
}
