/**
 * Homepage selectors
 */

import {RootState} from '@/store';
import {createSelector} from '@reduxjs/toolkit';

import {initialState} from './slice';

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