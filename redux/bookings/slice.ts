import { Booking } from '@/redux/booking/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isSameDay, startOfWeek } from 'date-fns';
import { REHYDRATE } from 'redux-persist';
import { BookingsState } from './types';

export const initialState: BookingsState = {
  bookings: [],
  booking: null,
  homeActiveBooking: null,
  isLoading: false,
  selectedDate: new Date().toISOString(),
  currentWeekStart: startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString(),
  isUpdatingBooking: false,
  isRefreshing: false,
};

interface RehydrateAction {
  type: typeof REHYDRATE;
  key: string;
  payload: {
    bookings?: BookingsState;
  };
}

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    fetchBookings: (state) => {
      state.isLoading = true;
    },
    refreshBookings: (state) => {
      state.isRefreshing = true;
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setCurrentWeekStart: (state, action: PayloadAction<string>) => {
      state.currentWeekStart = action.payload;
      state.isLoading = true;
    },
    fetchBookingsSuccess: (state, action: PayloadAction<Booking[]>) => {
      state.bookings = action.payload;
      state.isLoading = false;
      state.isRefreshing = false;
    },
    fetchBookingsFailure: (state) => {
      state.isLoading = false;
      state.isRefreshing = false;
    },
    fetchHomeActiveBooking: () => {},
    setHomeActiveBooking: (state, action: PayloadAction<Booking | null>) => {
      state.homeActiveBooking = action.payload;
    },
    rescheduleBooking: (state, action: PayloadAction<string>) => {},
    fetchBooking: (state, action: PayloadAction<string>) => {
      state.isLoading = true;
    },
    fetchBookingSuccess: (state, action: PayloadAction<Booking>) => {
      state.booking = action.payload;
      state.isLoading = false;
    },
    fetchBookingFailure: (state) => {
      state.isLoading = false;
    },
    rebookBooking: (state, action: PayloadAction<string>) => {},
    deleteBooking: (state, action: PayloadAction<string>) => {
      state.isUpdatingBooking = true;
    },
    cancelBooking: (state, action: PayloadAction<string>) => {
      state.isUpdatingBooking = true;
    },
    reportBooking: (
      state,
      action: PayloadAction<{ bookingId: string; reason: string; comment: string }>
    ) => {
      state.isUpdatingBooking = true;
    },
    rateWorker: (
      state,
      action: PayloadAction<{ bookingId: string; rating: number; comment: string }>
    ) => {
      state.isUpdatingBooking = true;
    },
    setIsUpdatingBooking: (state, action: PayloadAction<boolean>) => {
      state.isUpdatingBooking = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetBookings: (state) => {
      state.bookings = [];
      state.homeActiveBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action: RehydrateAction) => {
      if (action.payload?.bookings) {
        const merged = {
          ...state,
          ...action.payload.bookings,
          isLoading: false,
          isUpdatingBooking: false,
          isRefreshing: false,
        };
        const now = new Date();
        if (!isSameDay(new Date(merged.selectedDate), now)) {
          return {
            ...merged,
            selectedDate: now.toISOString(),
            currentWeekStart: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
          };
        }
        return merged;
      }
      return state;
    });
  },
});

export const { actions, reducer, name: bookingsSliceKey } = bookingsSlice;

