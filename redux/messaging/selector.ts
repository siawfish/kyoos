import { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';
import { MessagingState } from './types';

const selectMessagingDomain = (state: RootState) => state.messaging as MessagingState;

export const selectMessages = createSelector(
  [selectMessagingDomain],
  (messagingState) => messagingState.messages
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