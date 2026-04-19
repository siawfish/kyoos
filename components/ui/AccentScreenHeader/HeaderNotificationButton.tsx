import IconButton from '@/components/ui/IconButton';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { selectNotificationsUnreadCount } from '@/redux/notifications/selector';
import { useAppSelector } from '@/store/hooks';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface HeaderNotificationButtonProps {
  readonly containerStyle?: StyleProp<ViewStyle>;
  readonly iconSize?: number;
  readonly iconColor?: string;
}

export default function HeaderNotificationButton({
  containerStyle,
  iconSize = 24,
  iconColor,
}: HeaderNotificationButtonProps) {
  const unreadCount = useAppSelector(selectNotificationsUnreadCount);
  const iconColorValue = useThemeColor(
    { light: iconColor ?? colors.light.white, dark: iconColor ?? colors.dark.white },
    'text'
  );
  const backgroundColor = useThemeColor(
    { light: colors.light.black, dark: colors.dark.black },
    'background'
  );
  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <IconButton
      lightColor={backgroundColor}
      darkColor={colors.dark.black}
      onPress={() => router.push('/notifications')}
      accessibilityLabel="Notifications"
      style={containerStyle}
    >
      <View style={styles.iconWrapper}>
        <Feather name="bell" size={iconSize} color={iconColorValue} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
        )}
      </View>
    </IconButton>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.light.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.light.white,
    fontSize: 10,
    fontFamily: 'SemiBold',
    lineHeight: 12,
  },
});
