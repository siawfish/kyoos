import { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';
import { BookingsState } from './types';

const selectBookingsDomain = (state: RootState) => state.bookings as BookingsState;

export const selectBookings = createSelector(
  [selectBookingsDomain],
  (bookingsState) => bookingsState.bookings
);

export const selectIsLoading = createSelector(
  [selectBookingsDomain],
  (bookingsState) => bookingsState.isLoading
);

