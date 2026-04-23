/**
 * Registers a headless task so notification actions work when the app is backgrounded or killed.
 * Android: required for action taps outside the foreground (see expo-notifications registerTaskAsync).
 * Also re-presents categorized pushes locally on Android because registerTaskAsync suppresses native
 * presentation in favour of the JS task, and the OS-level tray entry would otherwise be empty.
 * Must load early — imported from notificationBootstrap before other app code.
 */
import { MESSAGE_PUSH_REPLY_ACTION_ID } from '@/constants/pushNotifications';
import { getItemFromStorage } from '@/services/asyncStorage';
import {
  BackgroundNotificationTaskResult,
  dismissNotificationAsync,
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

type NotifPayload = {
  title?: string;
  body?: string;
  categoryId?: string;
  channelId?: string;
  sound?: string;
};

/**
 * Present a categorized push locally on Android so the user sees title/body and action buttons.
 *
 * When registerTaskAsync is active the native code calls this task BEFORE presenting the
 * notification. Returning NoData tells it to suppress the original (empty) tray entry while
 * our scheduleNotificationAsync call creates a proper local notification with category actions.
 *
 * The task callback's `data` parameter is the Expo message's `data` field directly, so `_notif`
 * lives at the root of `payload` (NOT at `payload.data._notif` — that was the v2 bug).
 */
async function presentCategorizedNotification(
  payload: Record<string, unknown>,
): Promise<BackgroundNotificationTaskResult> {
  if (Platform.OS !== 'android') {
    return BackgroundNotificationTaskResult.NoData;
  }

  const notif = payload._notif as NotifPayload | undefined;
  if (!notif?.categoryId) {
    logBackgroundTask('no_notif_payload', { keys: Object.keys(payload) });
    return BackgroundNotificationTaskResult.NoData;
  }

  try {
    await scheduleNotificationAsync({
      content: {
        title: notif.title ?? '',
        body: notif.body ?? '',
        data: payload,
        categoryIdentifier: notif.categoryId,
        sound: notif.sound ?? 'notification.wav',
      },
      trigger: null,
    });
    logBackgroundTask('presented_local_notification', { categoryId: notif.categoryId });
    return BackgroundNotificationTaskResult.NoData;
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
    return presentCategorizedNotification(payload);
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
    if (res.ok) {
      await dismissNotificationAsync(response.notification.request.identifier).catch(() => {});
      return BackgroundNotificationTaskResult.NewData;
    }
    return BackgroundNotificationTaskResult.Failed;
  } catch {
    logBackgroundTask('request_failed');
    return BackgroundNotificationTaskResult.Failed;
  }
});

void registerTaskAsync(BACKGROUND_NOTIFICATION_ACTIONS_TASK).catch(() => {});
