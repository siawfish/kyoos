import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import { BookingState, ServiceLocationType } from '@/redux/booking/types';
import { Worker } from '../search/types';

// The initial state of the GithubRepoForm container
export const initialState: BookingState = {
  summary: {
    estimatedDuration: 0,
    requiredSkills: [],
    requiredTools: [],
    estimatedPrice: '',
    reasoning: '',
  },
  artisan: null,
  description: '',
  requiredSkills: [],
  appointmentDateTime: {
    date: {
      value: '',
      error: '',
    },
    time: {
      value: '',
      error: '',
    },
  },
  serviceLocationType: ServiceLocationType.SHOP,
  serviceLocation: {
    address: '',
    lat: 0,
    lng: 0,
  },
  media: [],
  isLoading: false,
  isSuccess: false,
}

interface RehydrateAction {
  type: typeof REHYDRATE;
  key: string;
  payload: {
    booking?: BookingState;
  };
}

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    initializeBooking: () => {},
    onConfirmBooking: (state) => {
      state.isLoading = true;
      state.isSuccess = false;
    },
    onConfirmBookingSuccess: (state) => {
      state.isLoading = false;
      state.isSuccess = true;
    },
    onConfirmBookingError: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setServiceLocationType: (state, action: PayloadAction<ServiceLocationType>) => {
      state.serviceLocationType = action.payload;
    },
    setAppointmentDateTime: (state, action: PayloadAction<string>) => {
      const date = new Date(action.payload);
      state.appointmentDateTime = {
        date: {
          value: date.toISOString().split('T')[0],
          error: '',
        },
        time: {
          value: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          error: '',
        },
      };
    },
    clearAppointmentDateTime: (state) => {
      state.appointmentDateTime = initialState.appointmentDateTime;
    },
    setAppointmentDateTimeError: (state, action: PayloadAction<{ field: 'date' | 'time', error: string }>) => {
      const { field, error } = action.payload;
      state.appointmentDateTime[field].error = error;
    },
    updateBooking: (state, action: PayloadAction<Partial<BookingState>>) => {
      return {
        ...state,
        ...action.payload
      };
    },
    setArtisan: (state, action: PayloadAction<Worker>) => {
      state.artisan = action.payload;
    },
    resetState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action: RehydrateAction) => {
      // Handle rehydration explicitly
      if (action.payload?.booking) {
        return {
          ...state,
          ...action.payload.booking
        };
      }
      return state;
    });
  }
});

export const {actions, reducer, name: sliceKey} = bookingSlice;

