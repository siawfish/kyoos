/**
 * Homepage selectors
 */

import {createSelector} from '@reduxjs/toolkit';
import { RootState } from '@/store';

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

