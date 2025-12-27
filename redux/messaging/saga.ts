import { selectUser } from '@/redux/app/selector';
import { User } from '@/redux/app/types';
import { selectMessages } from '@/redux/messaging/selector';
import { actions } from '@/redux/messaging/slice';
import { PayloadAction } from '@reduxjs/toolkit';
import { put, select, takeLatest } from 'redux-saga/effects';
import { Conversation, MessageForm } from './types';

const conversations: Conversation[] = [
  {
    id: '1',
    participants: [
      {
        id: '1',
        name: 'Gerald Amanor',
        avatar: null
      },
      {
        id: '101',
        name: 'John Smith',
        avatar: 'https://example.com/avatar1.jpg'
      }
    ],
    messages:[
      {
        id: '1',
        content: 'Fix leaking pipe and install new faucet',
        senderId: '1',
        receiverId: '101',
        read: false,
        timestamp: '2024-02-06T10:00:00Z',
        attachments: []
      },
      {
        id: '2',
        content: 'When can you come fix my AC?',
        senderId: '101',
        receiverId: '1',
        read: false,
        timestamp: '2024-02-05T15:30:00Z',
        attachments: []
      }
    ],
    unreadCount: 1,
    updatedAt: '2024-02-06T10:00:00Z',
    createdAt: '2024-02-06T10:00:00Z'
  },
  {
    id: '2', 
    participants: [
      {
        id: '1',
        name: 'Gerald Amanor',
        avatar: null
      },
      {
        id: '102',
        name: 'Jane Doe',
        avatar: null
      }
    ],
    messages:[
      {
        id: '1',
        content: 'Fix leaking pipe and install new faucet',
        senderId: '101',
        receiverId: '1',
        read: false,
        timestamp: '2024-02-06T10:00:00Z',
        attachments: []
      },
      {
        id: '2',
        content: 'When can you come fix my AC?',
        senderId: '102',
        receiverId: '1',
        read: false,
        timestamp: '2024-02-05T15:30:00Z',
        attachments: []
      }
    ],
    unreadCount: 0,
    updatedAt: '2024-02-05T15:30:00Z',
    createdAt: '2024-02-05T15:30:00Z'
  }
];

function* fetchMessagesSaga(action: PayloadAction<string>) {
  try {
    yield put(actions.fetchMessagesSuccess(conversations));
  } catch (error) {
    yield put(actions.fetchMessagesFailure(error instanceof Error ? error.message : 'Failed to fetch messages'));
  }
}

function* sendMessageSaga(action: PayloadAction<{ conversationId: string; message: MessageForm }>) {
  try {
    const messages: Conversation[] = yield select(selectMessages);
    const user: User = yield select(selectUser);
    const conversation = messages.find(conv => conv.id === action.payload.conversationId);
    yield put(actions.sendMessageSuccess({ 
      conversationId: action.payload.conversationId,
      message: {
        id: new Date().toISOString(),
        content: action.payload.message.content,
        senderId: user.id,
        receiverId: conversation?.participants.find(p => p.id !== user.id)?.id ?? '',
        read: false,
        timestamp: new Date().toISOString(),
        attachments: action.payload.message.attachments
      },
    }));
  } catch (error) {
    yield put(actions.sendMessageFailure(error instanceof Error ? error.message : 'Failed to send message'));
  }
}

export function* messagingSaga() {
  yield takeLatest(actions.fetchMessages.type, fetchMessagesSaga);
  yield takeLatest(actions.sendMessage.type, sendMessageSaga);
} 