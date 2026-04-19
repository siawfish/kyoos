import {
  MESSAGE_PUSH_REPLY_ACTION_ID,
} from '@/constants/pushNotifications';
import { selectIsAuthenticated, selectUser } from '@/redux/app/selector';
import { actions as bookingsActions } from '@/redux/bookings/slice';
import { actions as messagingActions } from '@/redux/messaging/slice';
import { actions as notificationsActions } from '@/redux/notifications/slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

/**
 * Handles notification responses/listeners in-app (foreground/active lifecycle),
 * including cold-start replay via last response.
 */
export function useInAppNotificationActions() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const processedKeys = useRef<Set<string>>(new Set());
  const logNotificationAction = useCallback((event: string, payload?: Record<string, unknown>) => {
    if (!__DEV__) {
      return;
    }
    console.info('[notification-action:kyoos]', event, payload ?? {});
  }, []);

  const handleResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const key = `${response.notification.request.identifier}:${response.actionIdentifier}`;
      if (processedKeys.current.has(key)) {
        logNotificationAction('duplicate_response_ignored', { key });
        return;
      }

      const { actionIdentifier } = response;
      const raw = (response.notification.request.content.data ?? {}) as Record<string, unknown>;
      const payloadType = raw.type;
      logNotificationAction('response_received', {
        actionIdentifier,
        payloadType: typeof payloadType === 'string' ? payloadType : 'unknown',
      });

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
    [dispatch, logNotificationAction, user]
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
      logNotificationAction('response_listener_fired', { actionIdentifier: r.actionIdentifier });
      handleResponse(r);
    });
    const notificationReceivedSubscription =
      Notifications.addNotificationReceivedListener(handleNotificationReceived);

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        logNotificationAction('app_became_active');
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
  }, [dispatch, isAuthenticated, handleNotificationReceived, handleResponse, logNotificationAction]);
}
