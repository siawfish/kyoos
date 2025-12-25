/**
 * Homepage selectors
 */

import {RootState} from '@/store';
import {createSelector} from '@reduxjs/toolkit';

import {initialState} from './slice';

// TODO: Add an explanation for this
const selectDomain = (state: RootState) => state?.booking || initialState;

export const selectMedia = createSelector(
    [selectDomain],
    (booking) => booking?.media,
);

export const selectSummary = createSelector(
    [selectDomain],
    (booking) => booking?.summary,
);

export const selectIsLoading = createSelector(
    [selectDomain],
    (booking) => booking?.isLoading,
);

export const selectServiceLocationType = createSelector(
    [selectDomain],
    (booking) => booking?.serviceLocationType,
);

export const selectServiceDate = createSelector(
    [selectDomain],
    (booking) => booking?.appointmentDateTime?.date,
);

export const selectServiceTime = createSelector(
    [selectDomain],
    (booking) => booking?.appointmentDateTime?.time,
);

export const selectArtisan = createSelector(
    [selectDomain],
    (booking) => booking?.artisan,
);

export const selectDescription = createSelector(
    [selectDomain],
    (booking) => booking?.description,
);

export const selectRequiredSkills = createSelector(
    [selectDomain],
    (booking) => booking?.requiredSkills,
);

export const selectAppointmentDateTime = createSelector(
    [selectDomain],
    (booking) => booking?.appointmentDateTime,
);

export const selectIsSuccess = createSelector(
    [selectDomain],
    (booking) => booking?.isSuccess,
);
