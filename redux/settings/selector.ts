/**
 * Homepage selectors
 */

import { RootState } from '@/store';
import {createSelector} from '@reduxjs/toolkit';

import {initialState} from './slice';

// TODO: Add an explanation for this
const selectDomain = (state: RootState) => state?.settings || initialState;

export const selectProfileForm = createSelector(
    [selectDomain],
    (settings) => settings.profileForm,
);

export const selectProfileFormIsLoading = createSelector(
    [selectDomain],
    (settings) => settings.profileForm.isLoading,
);

export const selectProfileFormLocation = createSelector(
    [selectDomain],
    (settings) => settings.profileForm.location,
);

