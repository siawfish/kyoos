import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Conversation, Message, MessageForm, MessagingState } from './types';

const initialState: MessagingState = {
  messages: [],
  messageForm: {
    content: '',
    attachments: [],
    isLoading: false,
  },
  isLoading: false,
  error: null,
};

const messagingSlice = createSlice({
  name: 'messaging',
  initialState,
  reducers: {
    fetchMessages: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchMessagesSuccess: (state, action: PayloadAction<Conversation[]>) => {
      state.messages = action.payload;
      state.isLoading = false;
    },
    fetchMessagesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    sendMessage: (state, action: PayloadAction<{ conversationId: string; message: MessageForm }>) => {
      state.messageForm.isLoading = true;
      state.error = null;
    },
    sendMessageSuccess: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
      const { conversationId, message } = action.payload;
      const conversation = state.messages.find(conv => conv.id === conversationId);
      if (conversation) {
        conversation.messages.push(message);
      } else {
        state.messages.push({
          id: conversationId,
          messages: [message],
          participants: [],
          unreadCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      state.messageForm.isLoading = false;
    },
    sendMessageFailure: (state, action: PayloadAction<string>) => {
      state.messageForm.isLoading = false;
      state.error = action.payload;
    },
    markConversationAsRead: (state, action: PayloadAction<string>) => {
      const conversationIndex = state.messages.findIndex(conv => conv.id === action.payload);
      if (conversationIndex !== -1) {
        state.messages[conversationIndex].unreadCount = 0;
      }
    },
  },
});

export const { actions, reducer, name: messagingSliceKey } = messagingSlice; 
