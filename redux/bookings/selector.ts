import { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';
import { format } from 'date-fns';
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

export const selectBooking = createSelector(
  [selectBookingsDomain],
  (bookingsState) => bookingsState.booking
);

export const selectSelectedDate = createSelector(
  [selectBookingsDomain],
  (bookingsState) => bookingsState.selectedDate
);

export const selectCurrentWeekStart = createSelector(
  [selectBookingsDomain],
  (bookingsState) => bookingsState.currentWeekStart
);

export const selectBookingsForSelectedDate = createSelector(
  [selectBookings, selectSelectedDate],
  (bookings, selectedDate) => {
    const selectedDateFormatted = format(new Date(selectedDate), 'yyyy-MM-dd');
    return bookings.filter((booking) => {
      // Handle both 'yyyy-MM-dd' format and ISO date strings
      const bookingDate = booking.date.includes('T') 
        ? format(new Date(booking.date), 'yyyy-MM-dd')
        : booking.date;
      return bookingDate === selectedDateFormatted;
    });
  }
);

export const selectIsUpdatingBooking = createSelector(
  [selectBookingsDomain],
  (bookingsState) => bookingsState.isUpdatingBooking
);

export const selectIsRefreshing = createSelector(
  [selectBookingsDomain],
  (bookingsState) => bookingsState.isRefreshing
);