import { request } from '@/services/api';
import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import Toast from 'react-native-toast-message';
import { actions } from './slice';
import { AppNotification, NotificationsPayload } from './types';

interface MarkAllAsReadResponse {
  updatedCount: number;
}

function* fetchNotificationsSaga() {
  try {
    const response: { data?: NotificationsPayload; error?: string; message?: string } = yield call(
      request<NotificationsPayload>,
      {
        url: '/api/users/notifications',
        method: 'GET',
      },
    );

    if (response.error || !response.data) {
      throw new Error(response.error || response.message || 'Failed to fetch notifications');
    }

    yield put(actions.fetchNotificationsSuccess(response.data));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications';
    yield put(actions.fetchNotificationsFailure(errorMessage));
    Toast.show({
      type: 'error',
      text1: 'Failed to load notifications',
      text2: errorMessage,
    });
  }
}

function* markNotificationAsReadSaga(action: PayloadAction<string>) {
  try {
    const notificationId = action.payload;
    const response: { data?: AppNotification; error?: string; message?: string } = yield call(
      request<AppNotification>,
      {
        url: `/api/users/notifications/${notificationId}/read`,
        method: 'PATCH',
      },
    );

    if (response.error) {
      throw new Error(response.error || response.message || 'Failed to mark notification as read');
    }

    yield put(actions.markNotificationAsReadSuccess(notificationId));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to mark notification as read';
    yield put(actions.markNotificationAsReadFailure(errorMessage));
    Toast.show({
      type: 'error',
      text1: 'Update failed',
      text2: errorMessage,
    });
  }
}

function* markAllNotificationsAsReadSaga() {
  try {
    const response: { data?: MarkAllAsReadResponse; error?: string; message?: string } = yield call(
      request<MarkAllAsReadResponse>,
      {
        url: '/api/users/notifications/read-all',
        method: 'PATCH',
      },
    );

    if (response.error) {
      throw new Error(response.error || response.message || 'Failed to mark all notifications as read');
    }

    yield put(actions.markAllNotificationsAsReadSuccess());
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to mark all notifications as read';
    yield put(actions.markAllNotificationsAsReadFailure(errorMessage));
    Toast.show({
      type: 'error',
      text1: 'Update failed',
      text2: errorMessage,
    });
  }
}

export function* notificationsSaga() {
  yield takeLatest(actions.fetchNotifications.type, fetchNotificationsSaga);
  yield takeLatest(actions.refreshNotifications.type, fetchNotificationsSaga);
  yield takeLatest(actions.markNotificationAsRead.type, markNotificationAsReadSaga);
  yield takeLatest(actions.markAllNotificationsAsRead.type, markAllNotificationsAsReadSaga);
}
