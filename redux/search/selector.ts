/**
 * Homepage selectors
 */

import { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';

import { initialState } from './slice';

// TODO: Add an explanation for this
const selectDomain = (state: RootState) => state?.search || initialState;

export const selectSearch = createSelector(
    [selectDomain],
    (search) => search?.search,
);

export const selectIsLoading = createSelector(
    [selectDomain],
    (search) => search?.isLoading,
);

export const selectMedia = createSelector(
    [selectDomain],
    (search) => search?.media,
);

export const selectSummary = createSelector(
    [selectDomain],
    (search) => search?.summary,
);

export const selectRecommendedWorkers = createSelector(
    [selectDomain],
    (search) => search?.recommendedWorkers,
);

export const selectClosestWorkers = createSelector(
    [selectDomain],
    (search) => search?.closestWorkers,
);

export const selectRequiredSkills = createSelector(
    [selectSummary],
    (summary) => summary?.requiredSkills || [],
);

export const selectRequiredTools = createSelector(
    [selectSummary],
    (summary) => summary?.requiredTools || [],
);

export const selectEstimatedDuration = createSelector(
    [selectSummary],
    (summary) => summary?.estimatedDuration || 0,
);

export const selectEstimatedPrice = createSelector(
    [selectSummary],
    (summary) => summary?.estimatedPrice || '',
);

export const selectReasoning = createSelector(
    [selectSummary],
    (summary) => summary?.reasoning || '',
);

export const selectIsInitializing = createSelector(
    [selectDomain],
    (search) => search?.isInitializing,
);

export const selectNearestWorkers = createSelector(
    [selectDomain],
    (search) => search?.nearestWorkers,
);

export const selectAllWorkers = createSelector(
    [selectRecommendedWorkers, selectClosestWorkers, selectNearestWorkers],
    (recommendedWorkers, closestWorkers, nearestWorkers) => [...(recommendedWorkers || []), ...(closestWorkers || []), ...(nearestWorkers || [])].filter(Boolean),
);

export const selectTotalNearbyWorkers = createSelector(
    [selectDomain],
    (search) => search?.totalNearbyWorkers || 0,
);

export const selectSearchReferenceId = createSelector(
    [selectDomain],
    (search) => search?.searchReferenceId || '',
);

export const selectSearchModalVisible = createSelector(
    [selectDomain],
    (search) => search?.searchModalVisible || false,
);

export const selectSelectedArtisan = createSelector(
    [selectDomain],
    (search) => search?.selectedArtisan || null,
);

export const selectDescriptionModalVisible = createSelector(
    [selectDomain],
    (search) => search?.descriptionModalVisible || false,
);

// Agent conversation selectors
export const selectAgentConversation = createSelector(
    [selectDomain],
    (search) => search?.agentConversation,
);

export const selectAgentConversationId = createSelector(
    [selectAgentConversation],
    (conversation) => conversation?.conversationId || null,
);

export const selectAgentConversationStatus = createSelector(
    [selectAgentConversation],
    (conversation) => conversation?.status || null,
);

export const selectAgentMessages = createSelector(
    [selectAgentConversation],
    (conversation) => conversation?.messages || [],
);

export const selectAgentCurrentQuestion = createSelector(
    [selectAgentConversation],
    (conversation) => conversation?.currentQuestion || null,
);

export const selectAgentIsLoading = createSelector(
    [selectAgentConversation],
    (conversation) => conversation?.isLoading || false,
);

export const selectAgentError = createSelector(
    [selectAgentConversation],
    (conversation) => conversation?.error || null,
);

export const selectAgentResults = createSelector(
    [selectAgentConversation],
    (conversation) => conversation?.results || null,
);

export const selectAgentConversationVisible = createSelector(
    [selectDomain],
    (search) => search?.agentConversationVisible || false,
);

export const selectFormattedAgentPrice = createSelector(
    [selectAgentResults],
    (results) => results?.formattedPrice || '',
);