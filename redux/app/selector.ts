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
    (app) => app?.location,
);

export const selectUserLocationIsMapPickerOpen = createSelector(
    [selectUserLocation],
    (location) => location?.isMapPickerOpen,
);

export const selectIsUpdatingTheme = createSelector(
    [selectDomain],
    (app) => app?.isUpdatingTheme,
);

export const selectIsUpdatingNotifications = createSelector(
    [selectDomain],
    (app) => app?.isUpdatingNotifications,
);