import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Conversation, Message, MessageForm, MessagingState, MessageStatus, SendMessagePayload, Asset } from './types';

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
    
    // Send message - creates optimistic message immediately
    sendMessage: (state, action: PayloadAction<SendMessagePayload>) => {
      const { conversationId, message, tempId, senderId, sender } = action.payload;
      
      // Create optimistic message immediately
      const optimisticMessage: Message = {
        id: tempId,
        tempId: tempId,
        conversationId,
        senderId,
        content: message.content,
        media: message.attachments.map(a => ({ 
          id: a.id || '', 
          type: a.type?.toString() || 'image', 
          url: a.uri || a.url || '' 
        })),
        status: MessageStatus.PENDING,
        sentAt: new Date().toISOString(),
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender,
      };
      
      // Add to current conversation messages
      state.currentConversationMessages.push(optimisticMessage);
      
      // Update conversation last message
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.lastMessage = message.content || 'Media';
        conversation.lastMessageAt = optimisticMessage.sentAt;
      }
      
      // Clear form
      state.messageForm.content = '';
      state.messageForm.attachments = [];
      state.messageForm.isLoading = true;
      state.error = null;
    },
    
    // Message sent successfully - update optimistic message
    sendMessageSuccess: (state, action: PayloadAction<{ tempId: string; message?: Message }>) => {
      const { tempId, message: serverMessage } = action.payload;
      
      // Find the optimistic message by tempId
      const messageIndex = state.currentConversationMessages.findIndex(m => m.tempId === tempId);
      if (messageIndex !== -1) {
        if (serverMessage) {
          // Replace with server message but keep tempId for duplicate detection
          state.currentConversationMessages[messageIndex] = {
            ...serverMessage,
            tempId: tempId,
            status: MessageStatus.SENT,
          };
        } else {
          // Just update status
          state.currentConversationMessages[messageIndex].status = MessageStatus.SENT;
        }
      }
      
      state.messageForm.isLoading = false;
    },
    
    // Message failed to send
    sendMessageFailure: (state, action: PayloadAction<{ tempId: string; error: string }>) => {
      const { tempId, error } = action.payload;
      
      // Find the optimistic message and mark as failed
      const message = state.currentConversationMessages.find(m => m.tempId === tempId);
      if (message) {
        message.status = MessageStatus.FAILED;
      }
      
      state.messageForm.isLoading = false;
      state.error = error;
    },
    
    // Retry sending a failed message
    retryMessage: (state, action: PayloadAction<{ 
      tempId: string; 
      newTempId: string;
      conversationId: string;
      content?: string;
      media?: Asset[];
    }>) => {
      const { tempId, newTempId } = action.payload;
      
      // Find the failed message and update it
      const message = state.currentConversationMessages.find(m => m.tempId === tempId);
      if (message) {
        message.status = MessageStatus.PENDING;
        message.tempId = newTempId;
        message.id = newTempId;
        message.sentAt = new Date().toISOString();
      }
      
      state.messageForm.isLoading = true;
    },
    
    // Remove a failed message
    removeFailedMessage: (state, action: PayloadAction<string>) => {
      const tempId = action.payload;
      state.currentConversationMessages = state.currentConversationMessages.filter(
        m => m.tempId !== tempId
      );
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
    messageReceived: (state, action: PayloadAction<Message & { currentUserId?: string }>) => {
      const { currentUserId, ...message } = action.payload;
      
      // Check if user is currently viewing this conversation
      const isViewingConversation = state.currentConversationMessages.length > 0 && 
          state.currentConversationMessages[0]?.conversationId === message.conversationId;
      
      // Check if this is our own message (might be a confirmation of optimistic message)
      const isOwnMessage = currentUserId && message.senderId === currentUserId;
      
      if (isViewingConversation) {
        // Check for duplicate/optimistic message
        // Find an optimistic message that matches this server message
        const optimisticIndex = state.currentConversationMessages.findIndex(m => {
          // Check if it's a pending/sent message from us with matching content
          if (!m.tempId) return false;
          if (m.senderId !== message.senderId) return false;
          if (m.conversationId !== message.conversationId) return false;
          // Check if content matches (for text messages)
          if (m.content && message.content && m.content === message.content) return true;
          // Check if both have media but no content (media message)
          if (!m.content && !message.content && m.media?.length && message.media?.length) return true;
          return false;
        });
        
        if (optimisticIndex !== -1) {
          // Update the optimistic message with server data
          const tempId = state.currentConversationMessages[optimisticIndex].tempId;
          state.currentConversationMessages[optimisticIndex] = {
            ...message,
            tempId, // Keep tempId for reference
            status: message.status || MessageStatus.SENT,
          };
        } else if (!isOwnMessage) {
          // Only add if it's from someone else (not our optimistic message)
          state.currentConversationMessages.push(message);
        } else {
          // Check if message with same ID already exists
          const existingIndex = state.currentConversationMessages.findIndex(m => m.id === message.id);
          if (existingIndex === -1) {
            // This is a new message from us that wasn't optimistically added (edge case)
            state.currentConversationMessages.push(message);
          }
        }
      }
      
      // Update conversation in list
      const conversation = state.conversations.find(c => c.id === message.conversationId);
      if (conversation) {
        conversation.lastMessage = message.content || 'Media';
        conversation.lastMessageAt = message.sentAt;
        
        // Increment unread count if:
        // 1. Message is from someone else (not current user)
        // 2. User is NOT currently viewing this conversation
        const isFromOtherUser = currentUserId ? message.senderId !== currentUserId : true;
        if (isFromOtherUser && !isViewingConversation) {
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
