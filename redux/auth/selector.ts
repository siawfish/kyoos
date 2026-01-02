/**
 * Homepage selectors
 */

import {RootState} from '@/store';
import {createSelector} from '@reduxjs/toolkit';

import {initialState} from './slice';

// TODO: Add an explanation for this
const selectDomain = (state: RootState) => state?.auth || initialState;

export const selectLoginFormIsLoading = createSelector(
    [selectDomain],
    (auth) => auth?.loginForm.isLoading,
);

export const selectRegisterFormIsLoading = createSelector(
    [selectDomain],
    (auth) => auth?.registerForm.isLoading,
);

export const selectLoginFormPhoneNumber = createSelector(
    [selectDomain],
    (auth) => auth?.loginForm.phoneNumber,
);

export const selectLoginFormOtp = createSelector(
    [selectDomain],
    (auth) => auth?.loginForm.otp,
);

export const selectRegisterFormName = createSelector(
    [selectDomain],
    (auth) => auth?.registerForm.name,
);

export const selectRegisterFormEmail = createSelector(
    [selectDomain],
    (auth) => auth?.registerForm.email,
);

export const selectRegisterFormPhoneNumber = createSelector(
    [selectDomain],
    (auth) => auth?.registerForm.phoneNumber,
);

export const selectRegisterFormAvatar = createSelector(
    [selectDomain],
    (auth) => auth?.registerForm.avatar,
);

export const selectRegisterFormGender = createSelector(
    [selectDomain],
    (auth) => auth?.registerForm.gender,
);

export const selectReferenceId = createSelector(
    [selectDomain],
    (auth) => auth?.referenceId,
);

export const selectRegisterForm = createSelector(
    [selectDomain],
    (auth) => auth?.registerForm,
);

export const selectCredentials = createSelector(
    [selectDomain],
    (auth) => auth?.credentials,
);

export const selectRegisterFormLocation = createSelector(
    [selectDomain],
    (auth) => auth?.registerForm.location,
);

export const selectRegisterFormLocationIsMapPickerOpen = createSelector(
    [selectRegisterFormLocation],
    (location) => location?.isMapPickerOpen,
);

export const selectRegisterFormLocationIsLoading = createSelector(
    [selectRegisterFormLocation],
    (location) => location?.isLoading,
);