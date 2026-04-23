/**
 * Registers a headless task so notification actions work when the app is backgrounded or killed.
 * Android: required for action taps outside the foreground (see expo-notifications registerTaskAsync).
 * Also re-presents categorized pushes locally on Android because the Expo push service delivers
 * them as data-only FCM messages (no OS-level notification).
 * Must load early — imported from notificationBootstrap before other app code.
 */
import { MESSAGE_PUSH_REPLY_ACTION_ID } from '@/constants/pushNotifications';
import { getItemFromStorage } from '@/services/asyncStorage';
import {
  BackgroundNotificationTaskResult,
  registerTaskAsync,
  scheduleNotificationAsync,
  type NotificationResponse,
} from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

const BACKGROUND_NOTIFICATION_ACTIONS_TASK = 'BACKGROUND_NOTIFICATION_ACTIONS_TASK';

const logBackgroundTask = (event: string, payload?: Record<string, unknown>) => {
  if (!__DEV__) {
    return;
  }
  console.info('[notification-bg-task:kyoos]', event, payload ?? {});
};

type DisplayPayload = {
  title?: string;
  body?: string;
  categoryId?: string;
  sound?: string;
  channelId?: string;
};

/**
 * Handle a data-only push delivery by presenting a local notification so the user actually sees
 * the notification (Android) with category action buttons attached. iOS delivers categorized
 * pushes as visible APNs alerts natively — no need to re-present there.
 */
async function presentDataOnlyNotification(
  payload: Record<string, unknown>,
): Promise<BackgroundNotificationTaskResult> {
  if (Platform.OS !== 'android') {
    return BackgroundNotificationTaskResult.NoData;
  }
  const notifData = (payload.data ?? {}) as Record<string, unknown>;
  const display = notifData._display as DisplayPayload | undefined;
  if (!display?.categoryId) {
    logBackgroundTask('data_only_missing_display', { hasData: Boolean(notifData) });
    return BackgroundNotificationTaskResult.NoData;
  }

  try {
    await scheduleNotificationAsync({
      content: {
        title: display.title ?? '',
        body: display.body ?? '',
        data: notifData,
        categoryIdentifier: display.categoryId,
        sound: display.sound ?? 'notification.wav',
      },
      trigger: null,
    });
    logBackgroundTask('presented_local_notification', { categoryId: display.categoryId });
    return BackgroundNotificationTaskResult.NewData;
  } catch (err) {
    logBackgroundTask('present_failed', { message: err instanceof Error ? err.message : String(err) });
    return BackgroundNotificationTaskResult.Failed;
  }
}

TaskManager.defineTask(BACKGROUND_NOTIFICATION_ACTIONS_TASK, async ({ data, error }) => {
  if (error) {
    logBackgroundTask('task_error', { message: error.message });
    return BackgroundNotificationTaskResult.Failed;
  }
  if (!data || typeof data !== 'object') {
    logBackgroundTask('no_data');
    return BackgroundNotificationTaskResult.NoData;
  }

  const payload = data as Record<string, unknown>;

  if (!('actionIdentifier' in payload)) {
    return presentDataOnlyNotification(payload);
  }

  const response = payload as unknown as NotificationResponse;
  logBackgroundTask('received_response', { actionIdentifier: response.actionIdentifier });
  const token = await getItemFromStorage('token');
  if (!token) {
    logBackgroundTask('missing_token');
    return BackgroundNotificationTaskResult.NoData;
  }

  const baseURL = process.env.EXPO_PUBLIC_API_URL;
  if (!baseURL) {
    logBackgroundTask('missing_api_url');
    return BackgroundNotificationTaskResult.Failed;
  }

  const raw = response.notification.request.content.data as Record<string, unknown> | undefined;
  if (raw?.type !== 'message') {
    logBackgroundTask('ignored_non_message', { type: raw?.type });
    return BackgroundNotificationTaskResult.NoData;
  }
  if (response.actionIdentifier !== MESSAGE_PUSH_REPLY_ACTION_ID) {
    logBackgroundTask('ignored_non_reply_action', { actionIdentifier: response.actionIdentifier });
    return BackgroundNotificationTaskResult.NoData;
  }

  const conversationId =
    typeof raw.conversationId === 'string' ? raw.conversationId : null;
  const text = response.userText?.trim();
  if (!conversationId || !text) {
    logBackgroundTask('missing_reply_payload', { hasConversationId: Boolean(conversationId), hasText: Boolean(text) });
    return BackgroundNotificationTaskResult.NoData;
  }

  try {
    const res = await fetch(
      `${baseURL}/api/users/messages/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: text }),
      }
    );
    return res.ok
      ? BackgroundNotificationTaskResult.NewData
      : BackgroundNotificationTaskResult.Failed;
  } catch {
    logBackgroundTask('request_failed');
    return BackgroundNotificationTaskResult.Failed;
  }
});

void registerTaskAsync(BACKGROUND_NOTIFICATION_ACTIONS_TASK).catch(() => {});
