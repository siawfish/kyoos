/**
 * Homepage selectors
 */

import {RootState} from '@/store';
import {createSelector} from '@reduxjs/toolkit';

import {initialState} from './slice';

// TODO: Add an explanation for this
const selectDomain = (state: RootState) => state?.app || initialState;

export const selectIsLoading = createSelector(
    [selectDomain],
    (app) => app?.isLoading,
);  

export const selectIsAuthenticated = createSelector(
    [selectDomain],
    (app) => !!app?.token && !!app?.user,
);

export const selectHasSeenOnboarding = createSelector(
    [selectDomain],
    (app) => app?.hasSeenOnboarding,
);

export const selectUser = createSelector(
    [selectDomain],
    (app) => app?.user,
);

export const selectUserLocation = createSelector(
    [selectDomain],
    (app) => app?.user?.location,
);
