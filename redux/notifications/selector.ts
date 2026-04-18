import { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';
import { NotificationsState } from './types';

const selectNotificationsDomain = (state: RootState) =>
  state.notifications as NotificationsState;

export const selectNotifications = createSelector(
  [selectNotificationsDomain],
  (notificationsState) => notificationsState.notifications,
);

export const selectNotificationsUnreadCount = createSelector(
  [selectNotificationsDomain],
  (notificationsState) => notificationsState.unreadCount,
);

export const selectNotificationsIsLoading = createSelector(
  [selectNotificationsDomain],
  (notificationsState) => notificationsState.isLoading,
);

export const selectNotificationsIsRefreshing = createSelector(
  [selectNotificationsDomain],
  (notificationsState) => notificationsState.isRefreshing,
);

export const selectNotificationsIsUpdating = createSelector(
  [selectNotificationsDomain],
  (notificationsState) => notificationsState.isUpdating,
);

export const selectNotificationsError = createSelector(
  [selectNotificationsDomain],
  (notificationsState) => notificationsState.error,
);
