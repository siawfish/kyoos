import { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';
import { MessagingState } from './types';

const selectMessagingDomain = (state: RootState) => state.messaging as MessagingState;

export const selectConversations = createSelector(
  [selectMessagingDomain],
  (messagingState) => messagingState.conversations
);

export const selectCurrentConversationMessages = createSelector(
  [selectMessagingDomain],
  (messagingState) => messagingState.currentConversationMessages
);

export const selectMessageForm = createSelector(
  [selectMessagingDomain],
  (messagingState) => messagingState.messageForm
);

export const selectIsLoading = createSelector(
  [selectMessagingDomain],
  (messagingState) => messagingState.isLoading
);

export const selectError = createSelector(
  [selectMessagingDomain],
  (messagingState) => messagingState.error
);

export const selectTypingUsers = createSelector(
  [selectMessagingDomain],
  (messagingState) => messagingState.typingUsers
);

export const selectFetchingConversation = createSelector(
  [selectMessagingDomain],
  (messagingState) => messagingState.fetchingConversation
);

export const selectIsRefreshing = createSelector(
  [selectMessagingDomain],
  (messagingState) => messagingState.isRefreshing
);

// Selector for typing users in a specific conversation
export const selectTypingUsersInConversation = (conversationId: string) =>
  createSelector([selectTypingUsers], (typingUsers) => typingUsers?.[conversationId] || []); 