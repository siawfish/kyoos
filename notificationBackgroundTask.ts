/**
 * Registers a headless task so notification actions work when the app is backgrounded or killed.
 * Android: required for action taps outside the foreground (see expo-notifications registerTaskAsync).
 * Must load early — imported from app/_layout.tsx before other app code.
 */
import { MESSAGE_PUSH_REPLY_ACTION_ID } from '@/constants/pushNotifications';
import { getItemFromStorage } from '@/services/asyncStorage';
import {
  BackgroundNotificationTaskResult,
  registerTaskAsync,
  type NotificationResponse,
} from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_NOTIFICATION_ACTIONS_TASK = 'BACKGROUND_NOTIFICATION_ACTIONS_TASK';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_ACTIONS_TASK, async ({ data, error }) => {
  if (error) {
    return BackgroundNotificationTaskResult.Failed;
  }
  if (!data || typeof data !== 'object' || !('actionIdentifier' in data)) {
    return BackgroundNotificationTaskResult.NoData;
  }

  const response = data as NotificationResponse;
  const token = await getItemFromStorage('token');
  if (!token) {
    return BackgroundNotificationTaskResult.NoData;
  }

  const baseURL = process.env.EXPO_PUBLIC_API_URL;
  if (!baseURL) {
    return BackgroundNotificationTaskResult.Failed;
  }

  const raw = response.notification.request.content.data as Record<string, unknown> | undefined;
  if (raw?.type !== 'message') {
    return BackgroundNotificationTaskResult.NoData;
  }
  if (response.actionIdentifier !== MESSAGE_PUSH_REPLY_ACTION_ID) {
    return BackgroundNotificationTaskResult.NoData;
  }

  const conversationId =
    typeof raw.conversationId === 'string' ? raw.conversationId : null;
  const text = response.userText?.trim();
  if (!conversationId || !text) {
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
    return BackgroundNotificationTaskResult.Failed;
  }
});

void registerTaskAsync(BACKGROUND_NOTIFICATION_ACTIONS_TASK).catch(() => {});
