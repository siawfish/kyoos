import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { AppNotification, NotificationsPayload, NotificationsState } from './types';

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isRefreshing: false,
  isUpdating: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    fetchNotifications: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    refreshNotifications: (state) => {
      state.isRefreshing = true;
      state.error = null;
    },
    fetchNotificationsSuccess: (state, action: PayloadAction<NotificationsPayload>) => {
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.pagination.unreadCount;
      state.isLoading = false;
      state.isRefreshing = false;
      state.error = null;
    },
    fetchNotificationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isRefreshing = false;
      state.error = action.payload;
    },
    markNotificationAsRead: (state, _action: PayloadAction<string>) => {
      state.isUpdating = true;
      state.error = null;
    },
    markNotificationAsReadSuccess: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.map((item) =>
        item.id === action.payload ? { ...item, isRead: true } : item,
      );
      state.unreadCount = Math.max(state.unreadCount - 1, 0);
      state.isUpdating = false;
    },
    markNotificationAsReadFailure: (state, action: PayloadAction<string>) => {
      state.isUpdating = false;
      state.error = action.payload;
    },
    markAllNotificationsAsRead: (state) => {
      state.isUpdating = true;
      state.error = null;
    },
    markAllNotificationsAsReadSuccess: (state) => {
      state.notifications = state.notifications.map((item) => ({ ...item, isRead: true }));
      state.unreadCount = 0;
      state.isUpdating = false;
    },
    markAllNotificationsAsReadFailure: (state, action: PayloadAction<string>) => {
      state.isUpdating = false;
      state.error = action.payload;
    },
    hydrateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    addNotificationFromPush: (state, action: PayloadAction<AppNotification>) => {
      state.notifications = [action.payload, ...state.notifications];
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    clearNotificationsError: (state) => {
      state.error = null;
    },
  },
});

export const { actions, reducer, name: notificationsSliceKey } = notificationsSlice;
