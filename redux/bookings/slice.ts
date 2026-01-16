import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import { BookingsResponse, BookingsState } from './types';
import { Booking } from '@/redux/booking/types';

export const initialState: BookingsState = {
  bookings: [],
  booking: null,
  isLoading: false,
  selectedDate: new Date().toISOString(),
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
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
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
      state.isLoading = true;
    },
    fetchBookingsSuccess: (state, action: PayloadAction<BookingsResponse>) => {
      const pagination = action.payload.pagination;
      const bookings = pagination.page === 1 ? action.payload.bookings : [...state.bookings, ...action.payload.bookings];
      state.bookings = bookings;
      state.pagination = pagination;
      state.isLoading = false;
    },
    fetchBookingsFailure: (state) => {
      state.isLoading = false;
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
    deleteBooking: (state, action: PayloadAction<string>) => {},
    cancelBooking: (state, action: PayloadAction<string>) => {},
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetBookings: (state) => {
      state.bookings = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action: RehydrateAction) => {
      if (action.payload?.bookings) {
        return {
          ...state,
          ...action.payload.bookings,
        };
      }
      return state;
    });
  },
});

export const { actions, reducer, name: bookingsSliceKey } = bookingsSlice;

