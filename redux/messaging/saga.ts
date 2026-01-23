import { actions } from '@/redux/messaging/slice';
import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import { Conversation, MessageForm, Message } from './types';
import { request } from '@/services/api';
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
 */
function* sendMessageSaga(
  action: PayloadAction<{ conversationId: string; message: MessageForm }>
) {
  try {
    const { conversationId, message } = action.payload;

    // Convert media attachments to Asset format if needed
    const media = message.attachments.map((attachment) => ({
      id: attachment.id || '',
      type: attachment.type || 'image',
      url: attachment.url,
    }));

    // Send via Socket.io for real-time delivery
    socketService.sendMessage(conversationId, message.content, media);

    yield put(actions.sendMessageSuccess());
  } catch (error) {
    yield put(
      actions.sendMessageFailure(
        error instanceof Error ? error.message : 'Failed to send message'
      )
    );
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
  yield takeLatest(actions.markConversationAsRead.type, markConversationAsReadSaga);
  yield takeLatest(
    actions.fetchOrCreateConversationByBooking.type,
    fetchConversationByBookingSaga
  );
  yield takeLatest(actions.createConversationByBooking.type, createConversationByBookingSaga);
} 