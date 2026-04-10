import { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';
import { format } from 'date-fns';
import { Booking } from '../booking/types';
import { BookingsState } from './types';

const selectBookingsDomain = (state: RootState) => state.bookings as BookingsState;

export const selectHomeActiveBooking = createSelector(
  [selectBookingsDomain],
  (bookingsState): Booking | null => bookingsState.homeActiveBooking ?? null,
);

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

/** Bookings for the selected calendar day, sorted by start time. */
export const selectBookingsForSelectedDateSorted = createSelector(
  [selectBookings, selectSelectedDate],
  (bookings, selectedDate) => {
    const selectedDateFormatted = format(new Date(selectedDate), 'yyyy-MM-dd');
    const forDay = bookings.filter((booking: Booking) => {
      const bookingDate = booking.date.includes('T')
        ? format(new Date(booking.date), 'yyyy-MM-dd')
        : booking.date;
      return bookingDate === selectedDateFormatted;
    });
    return [...forDay].sort((a, b) => {
      const ta = new Date(a.date).setTime(new Date(a.startTime).getTime());
      const tb = new Date(b.date).setTime(new Date(b.startTime).getTime());
      if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
      if (Number.isNaN(ta)) return 1;
      if (Number.isNaN(tb)) return -1;
      return ta - tb;
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