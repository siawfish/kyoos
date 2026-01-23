import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Conversation, Message, MessageForm, MessagingState } from './types';

const initialState: MessagingState = {
  conversations: [],
  currentConversationMessages: [],
  messageForm: {
    content: '',
    attachments: [],
    isLoading: false,
  },
  isLoading: false,
  isRefreshing: false,
  fetchingConversation: false,
  error: null,
  typingUsers: {},
};

const messagingSlice = createSlice({
  name: 'messaging',
  initialState,
  reducers: {
    // Fetch conversations
    fetchConversations: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    refreshConversations: (state) => {
      state.isRefreshing = true;
      state.error = null;
    },
    fetchConversationsSuccess: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
      state.isLoading = false;
      state.isRefreshing = false;
    },
    fetchConversationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isRefreshing = false;
      state.error = action.payload;
    },
    
    // Fetch messages for a conversation
    fetchConversationMessages: (state, action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchConversationMessagesSuccess: (state, action: PayloadAction<Message[]>) => {
      state.currentConversationMessages = action.payload.reverse(); // Reverse to show oldest first
      state.isLoading = false;
    },
    fetchConversationMessagesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Send message
    sendMessage: (state, action: PayloadAction<{ conversationId: string; message: MessageForm }>) => {
      state.messageForm.isLoading = true;
      state.error = null;
    },
    sendMessageSuccess: (state) => {
      state.messageForm.isLoading = false;
      state.messageForm.content = '';
      state.messageForm.attachments = [];
    },
    sendMessageFailure: (state, action: PayloadAction<string>) => {
      state.messageForm.isLoading = false;
      state.error = action.payload;
    },
    
    // Fetch or create conversation by booking ID
    fetchOrCreateConversationByBooking: (state, action: PayloadAction<string>) => {
      state.fetchingConversation = true;
      state.error = null;
    },
    createConversationByBooking: (state, action: PayloadAction<string>) => {
      state.fetchingConversation = true;
      state.error = null;
    },
    fetchOrCreateConversationByBookingSuccess: (state, action: PayloadAction<{ conversationId: string }>) => {
      state.fetchingConversation = false;
      // Navigation happens in saga after success
    },
    fetchOrCreateConversationByBookingFailure: (state, action: PayloadAction<string>) => {
      state.fetchingConversation = false;
      state.error = action.payload;
    },
    
    // Real-time message received
    messageReceived: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      
      // Add to current conversation messages if viewing this conversation
      if (state.currentConversationMessages.length > 0 && 
          state.currentConversationMessages[0]?.conversationId === message.conversationId) {
        state.currentConversationMessages.push(message);
      }
      
      // Update conversation in list
      const conversation = state.conversations.find(c => c.id === message.conversationId);
      if (conversation) {
        conversation.lastMessage = message.content || 'Media';
        conversation.lastMessageAt = message.sentAt;
        if (message.senderId !== conversation.clientId && message.senderId !== conversation.workerId) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }
      }
    },
    
    // Message edited
    messageEdited: (state, action: PayloadAction<{ messageId: string; content: string; editedAt: string }>) => {
      const { messageId, content, editedAt } = action.payload;
      const message = state.currentConversationMessages.find(m => m.id === messageId);
      if (message) {
        message.content = content;
        message.editedAt = editedAt;
      }
    },
    
    // Message deleted
    messageDeleted: (state, action: PayloadAction<{ messageId: string; deletedAt: string }>) => {
      const { messageId, deletedAt } = action.payload;
      const message = state.currentConversationMessages.find(m => m.id === messageId);
      if (message) {
        message.isDeleted = true;
        message.deletedAt = deletedAt;
      }
    },
    
    // Message status updated
    messageStatusUpdated: (state, action: PayloadAction<{ messageId: string; status: string }>) => {
      const { messageId, status } = action.payload;
      const message = state.currentConversationMessages.find(m => m.id === messageId);
      if (message) {
        message.status = status as any;
      }
    },
    
    // Mark conversation as read
    markConversationAsRead: (state, action: PayloadAction<string>) => {
      const conversation = state.conversations.find(c => c.id === action.payload);
      if (conversation) {
        conversation.unreadCount = 0;
      }
    },
    
    // Typing indicators
    userStartedTyping: (state, action: PayloadAction<{ conversationId: string; userId: string; userName: string }>) => {
      const { conversationId, userId } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      if (!state.typingUsers[conversationId].includes(userId)) {
        state.typingUsers[conversationId].push(userId);
      }
    },
    userStoppedTyping: (state, action: PayloadAction<{ conversationId: string; userId: string }>) => {
      const { conversationId, userId } = action.payload;
      if (state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(id => id !== userId);
      }
    },
    
    // Update message form
    updateMessageForm: (state, action: PayloadAction<Partial<MessageForm>>) => {
      state.messageForm = { ...state.messageForm, ...action.payload };
    },
    
    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { actions, reducer, name: messagingSliceKey } = messagingSlice; 
