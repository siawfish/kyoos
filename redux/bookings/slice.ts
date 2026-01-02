import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import { Booking, ContainerState } from './types';

export const initialState: ContainerState = {
  bookings: [],
  isLoading: false,
};

interface RehydrateAction {
  type: typeof REHYDRATE;
  key: string;
  payload: {
    bookings?: ContainerState;
  };
}

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    fetchBookings: (state) => {
      state.isLoading = true;
    },
    fetchBookingsSuccess: (state, action: PayloadAction<Booking[]>) => {
      state.bookings = action.payload;
      state.isLoading = false;
    },
    fetchBookingsFailure: (state) => {
      state.isLoading = false;
    },
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

