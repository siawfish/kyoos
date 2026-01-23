import { actions } from '@/redux/messaging/slice';
import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import { Conversation, Message, Asset, SendMessagePayload } from './types';
import { request } from '@/services/api';
import { uploadAttachments } from '@/services/upload';
import socketService from '@/services/socket';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

/**
 * Fetch all conversations
 */
function* fetchConversationsSaga() {
  try {
    const response: { data?: Conversation[]; error?: string } = yield call(
      request<Conversation[]>,
      {
        url: '/api/users/messages/conversations',
        method: 'GET',
      }
    );

    if (response.error) {
      throw new Error(response.error);
    }

    yield put(actions.fetchConversationsSuccess(response.data || []));
  } catch (error) {
    yield put(
      actions.fetchConversationsFailure(
        error instanceof Error ? error.message : 'Failed to fetch conversations'
      )
    );
  }
}

/**
 * Fetch messages for a specific conversation
 */
function* fetchConversationMessagesSaga(action: PayloadAction<string>) {
  try {
    const conversationId = action.payload;

    const response: { data?: Message[]; error?: string } = yield call(
      request<Message[]>,
      {
        url: `/api/users/messages/conversations/${conversationId}/messages`,
        method: 'GET',
        params: {
          limit: 50,
          offset: 0,
        },
      }
    );

    if (response.error) {
      throw new Error(response.error);
    }

    yield put(actions.fetchConversationMessagesSuccess(response.data || []));
  } catch (error) {
    yield put(
      actions.fetchConversationMessagesFailure(
        error instanceof Error ? error.message : 'Failed to fetch messages'
      )
    );
  }
}

/**
 * Send a new message
 * The optimistic message is already added to state by the reducer
 * This saga handles the actual sending in the background
 */
function* sendMessageSaga(
  action: PayloadAction<SendMessagePayload>
) {
  const { conversationId, message, tempId } = action.payload;
  
  try {
    let media: Asset[] = [];

    // Upload attachments if any exist
    if (message.attachments && message.attachments.length > 0) {
      const uploadResult: { data?: Asset[]; error?: string } = yield call(
        uploadAttachments,
        message.attachments
      );

      if (uploadResult.error) {
        throw new Error(uploadResult.error);
      }

      media = uploadResult.data || [];
    }

    // Send via Socket.io for real-time delivery
    // The server will broadcast the message back with a real ID
    socketService.sendMessage(conversationId, message.content, media);

    // Mark as sent (status will be updated when server confirms via socket)
    yield put(actions.sendMessageSuccess({ tempId }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
    
    yield put(actions.sendMessageFailure({ tempId, error: errorMessage }));
    
    Toast.show({
      type: 'error',
      text1: 'Failed to send message',
      text2: 'Tap the message to retry',
    });
  }
}

/**
 * Retry sending a failed message
 */
function* retryMessageSaga(
  action: PayloadAction<{ tempId: string; newTempId: string; conversationId: string; content?: string; media?: Asset[] }>
) {
  const { tempId, newTempId, conversationId, content, media } = action.payload;
  
  try {
    // Send via Socket.io
    socketService.sendMessage(conversationId, content, media || []);

    yield put(actions.sendMessageSuccess({ tempId: newTempId }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
    yield put(actions.sendMessageFailure({ tempId: newTempId, error: errorMessage }));
  }
}

/**
 * Mark conversation as read
 */
function* markConversationAsReadSaga(action: PayloadAction<string>) {
  try {
    const conversationId = action.payload;

    // Call API to mark as read
    yield call(request, {
      url: `/api/users/messages/conversations/${conversationId}/read`,
      method: 'POST',
    });

    // Also emit via socket
    socketService.markAsRead(conversationId);
  } catch (error) {
    console.error('Failed to mark conversation as read:', error);
  }
}

/**
 * Fetch or create conversation by booking ID
 */
function* fetchConversationByBookingSaga(action: PayloadAction<string>) {
  try {
    const bookingId = action.payload;
    // Try to fetch existing conversation by booking ID
    const response: { data?: Conversation; error?: string } = yield call(
      request<Conversation>,
      {
        url: `/api/users/messages/conversations/by-booking/${bookingId}`,
        method: 'GET',
      }
    );
    if (response.error) {
      throw new Error(response.error);
    }
    const conversationId = response.data?.id;
    // If no conversation exists, create one
    if (!conversationId) {
      throw new Error('Failed to get conversation ID');
    }
    yield put(actions.fetchOrCreateConversationByBookingSuccess({ conversationId }));
    // Navigate to conversation screen with the conversation ID
    router.push(`/(tabs)/(messaging)/${conversationId}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch conversation';
    console.error(errorMessage);
    yield put(
      actions.createConversationByBooking(action.payload)
    );
  }
}

function* createConversationByBookingSaga(action: PayloadAction<string>) {
  try {
    const bookingId = action.payload;
    const createResponse: { data?: Conversation; error?: string } = yield call(
      request<Conversation>,
      {
        url: '/api/users/messages/conversations',
        method: 'POST',
        data: { bookingId },
      }
    );
    
    if (createResponse.error) {
      throw new Error(createResponse.error);
    }
    
    const conversationId = createResponse.data?.id;
    if (!conversationId) {
      throw new Error('Failed to create conversation');
    }
    yield put(actions.fetchOrCreateConversationByBookingSuccess({ conversationId }));
    // Navigate to conversation screen with the conversation ID
    router.push(`/(tabs)/(messaging)/${conversationId}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation';
    yield put(actions.fetchOrCreateConversationByBookingFailure(errorMessage));
    Toast.show({
      type: 'error',
      text1: 'Failed to create conversation',
      text2: errorMessage,
    });
  }
}

export function* messagingSaga() {
  yield takeLatest(actions.fetchConversations.type, fetchConversationsSaga);
  yield takeLatest(
    actions.refreshConversations.type,
    fetchConversationsSaga
  );
  yield takeLatest(
    actions.fetchConversationMessages.type,
    fetchConversationMessagesSaga
  );
  yield takeLatest(actions.sendMessage.type, sendMessageSaga);
  yield takeLatest(actions.retryMessage.type, retryMessageSaga);
  yield takeLatest(actions.markConversationAsRead.type, markConversationAsReadSaga);
  yield takeLatest(
    actions.fetchOrCreateConversationByBooking.type,
    fetchConversationByBookingSaga
  );
  yield takeLatest(actions.createConversationByBooking.type, createConversationByBookingSaga);
} 