import {
  ANDROID_DEFAULT_NOTIFICATION_CHANNEL_ID,
  MESSAGE_PUSH_REPLY_ACTION_ID,
  MESSAGE_REPLY_PUSH_CATEGORY_ID,
} from '@/constants/pushNotifications';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Registers the headless notification action task.
import './notificationBackgroundTask';

async function bootstrapNotificationActions() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ANDROID_DEFAULT_NOTIFICATION_CHANNEL_ID, {
        name: ANDROID_DEFAULT_NOTIFICATION_CHANNEL_ID,
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    await Notifications.setNotificationCategoryAsync(MESSAGE_REPLY_PUSH_CATEGORY_ID, [
      {
        identifier: MESSAGE_PUSH_REPLY_ACTION_ID,
        buttonTitle: 'Reply',
        textInput: {
          submitButtonTitle: 'Send',
          placeholder: 'Message',
        },
        options: { opensAppToForeground: false },
      },
    ]);
  } catch {
    // Best-effort bootstrap: app remains usable even if category setup fails.
  }
}

void bootstrapNotificationActions();
