import {
  ANDROID_DEFAULT_NOTIFICATION_CHANNEL_ID,
  MESSAGE_PUSH_REPLY_ACTION_ID,
  MESSAGE_REPLY_PUSH_CATEGORY_ID,
} from '@/constants/pushNotifications';
import { selectIsAuthenticated, selectUser } from '@/redux/app/selector';
import { actions as bookingsActions } from '@/redux/bookings/slice';
import { actions as messagingActions } from '@/redux/messaging/slice';
import { actions as notificationsActions } from '@/redux/notifications/slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';

/**
 * Registers the message-reply notification category and, when authenticated,
 * handles inline reply and cold-start last response.
 */
export function useInAppNotificationActions() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const processedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    void (async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync(ANDROID_DEFAULT_NOTIFICATION_CHANNEL_ID, {
            name: 'default',
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
            options: { opensAppToForeground: true },
          },
        ]);
      } catch {
        // Category registration is best-effort.
      }
    })();
  }, []);

  const handleResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const key = `${response.notification.request.identifier}:${response.actionIdentifier}`;
      if (processedKeys.current.has(key)) {
        return;
      }

      const { actionIdentifier } = response;
      const raw = (response.notification.request.content.data ?? {}) as Record<string, unknown>;
      const payloadType = raw.type;

      if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
        if (payloadType === 'booking') {
          const bookingId = typeof raw.bookingId === 'string' ? raw.bookingId : null;
          if (bookingId) {
            processedKeys.current.add(key);
            router.push(`/(tabs)/(bookings)/${bookingId}`, { withAnchor: true });
            void Notifications.clearLastNotificationResponseAsync();
          }
          return;
        }
        if (payloadType === 'message') {
          const conversationId =
            typeof raw.conversationId === 'string' ? raw.conversationId : null;
          if (conversationId) {
            processedKeys.current.add(key);
            router.push(`/(tabs)/(messaging)/${conversationId}`, { withAnchor: true });
            void Notifications.clearLastNotificationResponseAsync();
          }
          return;
        }
        return;
      }

      if (raw.type !== 'message') {
        return;
      }

      const conversationId =
        typeof raw.conversationId === 'string' ? raw.conversationId : null;
      if (!conversationId || !user?.id) {
        return;
      }
      if (actionIdentifier !== MESSAGE_PUSH_REPLY_ACTION_ID) {
        return;
      }
      const text = response.userText?.trim();
      if (!text) {
        return;
      }

      processedKeys.current.add(key);
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      dispatch(
        messagingActions.sendMessage({
          conversationId,
          tempId,
          senderId: user.id,
          sender: {
            id: user.id,
            name: user.name || '',
            avatar: user.avatar || '',
          },
          message: {
            content: text,
            attachments: [],
          },
        })
      );
      void Notifications.clearLastNotificationResponseAsync();
    },
    [dispatch, user]
  );

  const handleNotificationReceived = useCallback(
    (notification: Notifications.Notification) => {
      dispatch(notificationsActions.fetchNotifications());

      const raw = notification.request.content.data ?? {};
      if (raw.type === 'message') {
        dispatch(messagingActions.refreshConversations());
        return;
      }
      if (raw.type === 'booking') {
        dispatch(bookingsActions.refreshBookings());
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    dispatch(notificationsActions.fetchNotifications());

    let cancelled = false;
    const drainLastResponse = () => {
      void Notifications.getLastNotificationResponseAsync().then((last) => {
        if (!cancelled && last) {
          handleResponse(last);
        }
      });
    };

    drainLastResponse();

    const subscription = Notifications.addNotificationResponseReceivedListener((r) => {
      handleResponse(r);
    });
    const notificationReceivedSubscription =
      Notifications.addNotificationReceivedListener(handleNotificationReceived);

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        dispatch(notificationsActions.fetchNotifications());
        drainLastResponse();
      }
    };
    const appSub = AppState.addEventListener('change', onAppState);

    return () => {
      cancelled = true;
      subscription.remove();
      notificationReceivedSubscription.remove();
      appSub.remove();
    };
  }, [dispatch, isAuthenticated, handleNotificationReceived, handleResponse]);
}
