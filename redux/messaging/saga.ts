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
        name: 'Sarah Mensah',
        avatar: null
      }
    ],
    messages: [
      {
        id: 'msg-1-1',
        content: 'Hi! I need help fixing a leaking pipe in my kitchen. When are you available?',
        senderId: '101',
        receiverId: '1',
        read: true,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        attachments: []
      },
      {
        id: 'msg-1-2',
        content: 'Hello Sarah! I can come tomorrow morning around 10 AM. Does that work for you?',
        senderId: '1',
        receiverId: '101',
        read: true,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        attachments: []
      },
      {
        id: 'msg-1-3',
        content: 'Perfect! That works for me. The address is 456 Residential Ave, Accra.',
        senderId: '101',
        receiverId: '1',
        read: true,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
        attachments: []
      },
      {
        id: 'msg-1-4',
        content: 'Great! I\'ll also need to install a new faucet. Is that something you can do?',
        senderId: '101',
        receiverId: '1',
        read: true,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        attachments: []
      },
      {
        id: 'msg-1-5',
        content: 'Yes, absolutely! I can handle both the pipe repair and faucet installation. The estimated cost is GHS 150.',
        senderId: '1',
        receiverId: '101',
        read: true,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
        attachments: []
      },
      {
        id: 'msg-1-6',
        content: 'That sounds good. See you tomorrow at 10 AM!',
        senderId: '101',
        receiverId: '1',
        read: false,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        attachments: []
      }
    ],
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
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
        name: 'Kwame Asante',
        avatar: null
      }
    ],
    messages: [
      {
        id: 'msg-2-1',
        content: 'My AC unit is not cooling properly. Can you help diagnose the issue?',
        senderId: '102',
        receiverId: '1',
        read: true,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        attachments: []
      },
      {
        id: 'msg-2-2',
        content: 'Sure! I can come by tomorrow afternoon. What time works best for you?',
        senderId: '1',
        receiverId: '102',
        read: true,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
        attachments: []
      },
      {
        id: 'msg-2-3',
        content: 'How about 2:30 PM?',
        senderId: '102',
        receiverId: '1',
        read: true,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        attachments: []
      },
      {
        id: 'msg-2-4',
        content: 'Perfect! I\'ll be there at 2:30 PM. The address is 789 Business St, Accra.',
        senderId: '1',
        receiverId: '102',
        read: true,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
        attachments: []
      },
      {
        id: 'msg-2-5',
        content: 'Great! Looking forward to it.',
        senderId: '102',
        receiverId: '1',
        read: true,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        attachments: []
      }
    ],
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    participants: [
      {
        id: '1',
        name: 'Gerald Amanor',
        avatar: null
      },
      {
        id: '103',
        name: 'Ama Osei',
        avatar: null
      }
    ],
    messages: [
      {
        id: 'msg-3-1',
        content: 'Hi! I need help assembling office furniture. Are you available this week?',
        senderId: '103',
        receiverId: '1',
        read: true,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        attachments: []
      },
      {
        id: 'msg-3-2',
        content: 'Yes, I can help with that! What day works for you?',
        senderId: '1',
        receiverId: '103',
        read: true,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        attachments: []
      },
      {
        id: 'msg-3-3',
        content: 'How about Monday morning at 9 AM?',
        senderId: '103',
        receiverId: '1',
        read: true,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        attachments: []
      },
      {
        id: 'msg-3-4',
        content: 'Monday at 9 AM works perfectly! I\'ll bring all the necessary tools.',
        senderId: '1',
        receiverId: '103',
        read: true,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        attachments: []
      },
      {
        id: 'msg-3-5',
        content: 'Thank you! The office is at 321 Office Complex, Accra.',
        senderId: '103',
        receiverId: '1',
        read: true,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
        attachments: []
      },
      {
        id: 'msg-3-6',
        content: 'Perfect! See you Monday morning.',
        senderId: '1',
        receiverId: '103',
        read: true,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        attachments: []
      }
    ],
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    participants: [
      {
        id: '1',
        name: 'Gerald Amanor',
        avatar: null
      },
      {
        id: '104',
        name: 'Efua Adjei',
        avatar: null
      }
    ],
    messages: [
      {
        id: 'msg-4-1',
        content: 'Hello! My bathroom drain is completely clogged. Can you help?',
        senderId: '104',
        receiverId: '1',
        read: false,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        attachments: []
      },
      {
        id: 'msg-4-2',
        content: 'Hi Efua! Yes, I can help with that. When would be a good time?',
        senderId: '1',
        receiverId: '104',
        read: false,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        attachments: []
      },
      {
        id: 'msg-4-3',
        content: 'How about day after tomorrow at 3 PM?',
        senderId: '104',
        receiverId: '1',
        read: false,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        attachments: []
      }
    ],
    unreadCount: 3,
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
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