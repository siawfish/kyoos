import BackButton from '@/components/ui/BackButton';
import EmptyList from '@/components/ui/EmptyList';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { AccentScreenHeader } from '@/components/ui/AccentScreenHeader';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import NotificationItemSkeleton from '@/components/notifications/NotificationItemSkeleton';
import { TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP } from '@/constants/navigation/tabRootScrollPadding';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { actions } from '@/redux/notifications/slice';
import {
  selectNotifications,
  selectNotificationsIsLoading,
  selectNotificationsIsRefreshing,
  selectNotificationsIsUpdating,
  selectNotificationsUnreadCount,
} from '@/redux/notifications/selector';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect, router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

function formatNotificationTime(value: string) {
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return value;
  }
}

export default function NotificationsScreen() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectNotificationsUnreadCount);
  const isLoading = useAppSelector(selectNotificationsIsLoading);
  const isRefreshing = useAppSelector(selectNotificationsIsRefreshing);
  const isUpdating = useAppSelector(selectNotificationsIsUpdating);

  const backgroundColor = useThemeColor(
    { light: colors.light.background, dark: colors.dark.background },
    'background',
  );
  const borderColor = useThemeColor(
    { light: colors.light.black, dark: colors.dark.white },
    'text',
  );
  const mutedTextColor = useThemeColor(
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
        <ThemedText style={styles.unreadText} lightColor={mutedTextColor} darkColor={mutedTextColor}>
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
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                if (!item.isRead) {
                  dispatch(actions.markNotificationAsRead(item.id));
                }
              }}
              style={[
                styles.itemContainer,
                { borderColor },
                !item.isRead && styles.unreadItemContainer,
              ]}
            >
              <View style={styles.itemHeader}>
                <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                {!item.isRead && <View style={styles.unreadDot} />}
              </View>
              <ThemedText
                style={styles.itemBody}
                lightColor={mutedTextColor}
                darkColor={mutedTextColor}
              >
                {item.body}
              </ThemedText>
              <ThemedText
                style={styles.itemDate}
                lightColor={mutedTextColor}
                darkColor={mutedTextColor}
              >
                {formatNotificationTime(item.createdAt)}
              </ThemedText>
            </Pressable>
          )}
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
    gap: heightPixel(12),
  },
  listContent: {
    paddingHorizontal: widthPixel(16),
    paddingBottom: TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP,
    gap: heightPixel(12),
  },
  itemContainer: {
    borderWidth: 0.5,
    paddingHorizontal: widthPixel(14),
    paddingVertical: heightPixel(12),
  },
  unreadItemContainer: {
    borderColor: colors.light.tint,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: heightPixel(8),
    gap: widthPixel(10),
  },
  itemTitle: {
    flex: 1,
    fontFamily: 'SemiBold',
    fontSize: fontPixel(14),
  },
  unreadDot: {
    width: widthPixel(8),
    height: widthPixel(8),
    borderRadius: widthPixel(8),
    backgroundColor: colors.light.tint,
  },
  itemBody: {
    fontFamily: 'Regular',
    fontSize: fontPixel(13),
    lineHeight: fontPixel(19),
    marginBottom: heightPixel(8),
  },
  itemDate: {
    fontFamily: 'Regular',
    fontSize: fontPixel(11),
  },
  emptyList: {
    minHeight: heightPixel(300),
  },
});
