import { AvailableSlot, BookingState, ServiceLocationType } from '@/redux/booking/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import { Worker } from '../search/types';
import { Location } from '../auth/types';

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
  bookingId: '',
  availableSlots: [],
  isGettingAvailableSlots: false,
  isLoading: false,
  isSuccess: false,
  isMapPickerOpen: false,
  error: '',
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
    onConfirmBookingSuccess: (state, action: PayloadAction<string>) => {
      state.bookingId = action.payload;
      state.isLoading = false;
      state.isSuccess = true;
    },
    onConfirmBookingError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.error = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setServiceLocationType: (state, action: PayloadAction<ServiceLocationType>) => {
      state.serviceLocationType = action.payload;
      state.error = '';
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
      state.error = '';
    },
    setAppointmentDate: (state, action: PayloadAction<string>) => {
      state.appointmentDateTime.date.value = action.payload;
      state.appointmentDateTime.date.error = '';
      // Clear time when date changes
      state.appointmentDateTime.time.value = '';
      state.appointmentDateTime.time.error = '';
      state.error = '';
    },
    setAppointmentTime: (state, action: PayloadAction<string>) => {
      state.appointmentDateTime.time.value = action.payload;
      state.appointmentDateTime.time.error = '';
      state.error = '';
    },
    getAvailableTimes: (state, action: PayloadAction<string>) => {
      state.isGettingAvailableSlots = true;
      state.error = '';
    },
    getAvailableTimesSuccess: (state, action: PayloadAction<AvailableSlot[]>) => {
      state.availableSlots = action.payload;
      state.isGettingAvailableSlots = false;
    },
    getAvailableTimesError: (state, action: PayloadAction<string>) => {
      state.isGettingAvailableSlots = false;
      state.availableSlots = [];
      state.appointmentDateTime.time.error = action.payload;
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
    setServiceLocation: (state, action: PayloadAction<Location>) => {
      state.serviceLocation = action.payload;
    },
    openMapPicker: (state) => {
      state.isMapPickerOpen = true;
    },
    closeMapPicker: (state) => {
      state.isMapPickerOpen = false;
    },
    reverseGeocodeServiceLocation: (state, action: PayloadAction<string>) => {
      // This action is handled by the saga
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

