import BackButton from '@/components/ui/BackButton';
import EmptyList from '@/components/ui/EmptyList';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { AccentScreenHeader } from '@/components/ui/AccentScreenHeader';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { ThemedView } from '@/components/ui/Themed/ThemedView';
import NotificationItemSkeleton from '@/components/notifications/NotificationItemSkeleton';
import { TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP } from '@/constants/navigation/tabRootScrollPadding';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { actions } from '@/redux/notifications/slice';
import type { AppNotification } from '@/redux/notifications/types';
import {
  selectNotifications,
  selectNotificationsIsLoading,
  selectNotificationsIsRefreshing,
  selectNotificationsIsUpdating,
  selectNotificationsUnreadCount,
} from '@/redux/notifications/selector';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { FlashList } from '@shopify/flash-list';
import { formatDistanceToNow } from 'date-fns';
import { useFocusEffect, router, type Href } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

function formatNotificationTime(value: string) {
  try {
    const date = new Date(value);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return value;
  }
}

function getNotificationRoute(item: AppNotification): Href | null {
  if (!item.data) {
    return null;
  }

  const payload = item.data as unknown as Record<string, unknown>;

  if (item.type === 'booking' && typeof payload.bookingId === 'string') {
    return {
      pathname: '/(tabs)/(bookings)/[id]',
      params: { id: payload.bookingId },
    };
  }

  if (item.type === 'message' && typeof payload.conversationId === 'string') {
    return {
      pathname: '/(tabs)/(messaging)/[id]',
      params: { id: payload.conversationId },
    };
  }

  return null;
}

export default function NotificationsScreen() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectNotificationsUnreadCount);
  const isLoading = useAppSelector(selectNotificationsIsLoading);
  const isRefreshing = useAppSelector(selectNotificationsIsRefreshing);
  const isUpdating = useAppSelector(selectNotificationsIsUpdating);

  const theme = useAppTheme();
  const isDark = theme === 'dark';

  const backgroundColor = useThemeColor(
    { light: colors.light.background, dark: colors.dark.background },
    'background',
  );
  const tintColor = useThemeColor(
    { light: colors.light.tint, dark: colors.dark.tint },
    'background',
  );
  const tintTextColor = useThemeColor(
    { light: colors.light.white, dark: colors.dark.black },
    'white',
  );
  const cardBg = useThemeColor(
    { light: colors.light.background, dark: colors.dark.background },
    'background',
  );
  const accentColor = isDark ? colors.dark.white : colors.light.black;
  const borderColor = accentColor;
  const textColor = useThemeColor(
    { light: colors.light.text, dark: colors.dark.text },
    'text',
  );
  const secondaryText = useThemeColor(
    { light: colors.light.secondary, dark: colors.dark.secondary },
    'text',
  );

  useFocusEffect(
    useCallback(() => {
      dispatch(actions.fetchNotifications());
    }, [dispatch]),
  );

  return (
    <ScreenLayout style={[styles.container, { backgroundColor }]}>
      <AccentScreenHeader
        renderRight={() => <BackButton iconName="x" onPress={() => router.back()} />}
        title="NOTIFICATIONS"
        titleStyle={{
          fontSize: fontPixel(10),
          fontFamily: 'SemiBold',
          letterSpacing: 1.5,
        }}
      />
      <View style={styles.actionsRow}>
        <ThemedText style={styles.unreadText} lightColor={secondaryText} darkColor={secondaryText}>
          {unreadCount} unread
        </ThemedText>
        <Pressable
          disabled={unreadCount === 0 || isUpdating}
          onPress={() => {
            dispatch(actions.markAllNotificationsAsRead());
          }}
        >
          <ThemedText
            style={[styles.markAllText, (unreadCount === 0 || isUpdating) && styles.disabledText]}
            lightColor={colors.light.tint}
            darkColor={colors.dark.tint}
          >
            Mark all read
          </ThemedText>
        </Pressable>
      </View>
      {isLoading && notifications.length === 0 ? (
        <View style={styles.skeletonList}>
          <NotificationItemSkeleton />
          <NotificationItemSkeleton />
          <NotificationItemSkeleton />
          <NotificationItemSkeleton />
        </View>
      ) : (
        <FlashList
          data={notifications}
          keyExtractor={(item) => item.id}
          onRefresh={() => {
            dispatch(actions.refreshNotifications());
          }}
          refreshing={isRefreshing}
          ListEmptyComponent={
            <EmptyList
              containerStyle={styles.emptyList}
              message="No notifications yet. New activity will appear here."
            />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isUnread = !item.isRead;
            return (
              <Pressable
                onPress={() => {
                  if (isUnread) {
                    dispatch(actions.markNotificationAsRead(item.id));
                  }

                  const route = getNotificationRoute(item);
                  if (route) {
                    router.push(route, { withAnchor: true });
                  }
                }}
                style={({ pressed }) => [
                  styles.itemContainer,
                  { backgroundColor: cardBg, borderColor },
                  pressed && styles.itemPressed,
                ]}
              >
                <View
                  style={[
                    styles.leftAccent,
                    { backgroundColor: accentColor },
                    !isUnread && styles.leftAccentRead,
                  ]}
                />
                <View style={styles.content}>
                  <View style={styles.headerRow}>
                    <ThemedText
                      style={[styles.title, { color: textColor }]}
                      numberOfLines={2}
                    >
                      {item.title}
                    </ThemedText>
                    {isUnread && (
                      <ThemedView style={[styles.unreadBadge, { backgroundColor: tintColor }]}>
                        <ThemedText style={[styles.unreadBadgeText, { color: tintTextColor }]}>
                          NEW
                        </ThemedText>
                      </ThemedView>
                    )}
                  </View>
                  <ThemedText
                    style={[
                      styles.body,
                      { color: secondaryText },
                      isUnread && styles.bodyUnread,
                      isUnread && { color: textColor },
                    ]}
                  >
                    {item.body}
                  </ThemedText>
                  <ThemedText style={[styles.timestamp, { color: secondaryText }]}>
                    {formatNotificationTime(item.createdAt)}
                  </ThemedText>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionsRow: {
    paddingHorizontal: widthPixel(16),
    marginBottom: heightPixel(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unreadText: {
    fontSize: fontPixel(12),
    fontFamily: 'Medium',
  },
  markAllText: {
    fontSize: fontPixel(12),
    fontFamily: 'SemiBold',
    letterSpacing: 0.4,
  },
  disabledText: {
    opacity: 0.45,
  },
  skeletonList: {
    paddingHorizontal: widthPixel(16),
    paddingBottom: TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP,
  },
  listContent: {
    paddingHorizontal: widthPixel(16),
    paddingBottom: TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP,
  },
  itemContainer: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: heightPixel(11),
    borderWidth: 0.5,
    borderLeftWidth: 0,
    overflow: 'hidden',
  },
  itemPressed: {
    opacity: 0.7,
  },
  leftAccent: {
    width: widthPixel(4),
  },
  leftAccentRead: {
    opacity: 0.28,
  },
  content: {
    flex: 1,
    paddingVertical: heightPixel(10),
    paddingHorizontal: widthPixel(12),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: heightPixel(5),
    gap: widthPixel(8),
  },
  title: {
    flex: 1,
    fontSize: fontPixel(14),
    fontFamily: 'Bold',
    letterSpacing: 0.5,
    lineHeight: fontPixel(19),
  },
  unreadBadge: {
    borderRadius: 0,
    minWidth: widthPixel(18),
    height: heightPixel(18),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: widthPixel(6),
  },
  unreadBadgeText: {
    fontSize: fontPixel(9),
    fontFamily: 'Bold',
    letterSpacing: 0.8,
  },
  body: {
    fontSize: fontPixel(13),
    fontFamily: 'Regular',
    lineHeight: fontPixel(18),
    marginBottom: heightPixel(7),
  },
  bodyUnread: {
    fontFamily: 'SemiBold',
  },
  timestamp: {
    fontSize: fontPixel(11),
    fontFamily: 'Regular',
  },
  emptyList: {
    minHeight: heightPixel(300),
  },
});
