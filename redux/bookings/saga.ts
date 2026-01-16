import Toast from 'react-native-toast-message';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { actions } from './slice';
import { actions as bookingActions } from '../booking/slice';
import { BookingsResponse } from './types';
import { PayloadAction } from '@reduxjs/toolkit';
import { ApiResponse } from '@/services/types';
import { request } from '@/services/api';
import { Booking } from '../booking/types';
import { selectBooking, selectBookings, selectSelectedDate } from './selector';
import { addHours, isPast, isToday, setHours, setMinutes, setSeconds } from 'date-fns';
import { router } from 'expo-router';

function* fetchBookings() {
  try {
    const selectedDate: string = yield select(selectSelectedDate);
    const response: ApiResponse<BookingsResponse> = yield call(request, {
      method: 'GET',
      url: `/api/users/bookings`,
      params: {
        date: selectedDate,
      },
    })
    if (response.error || !response.data) {
      throw new Error(response.message || response.error || 'An error occurred while fetching bookings');
    }
    yield put(actions.fetchBookingsSuccess({
      bookings: response.data?.bookings,
      pagination: response.data?.pagination
    }));
  } catch (error:unknown) {
    const errorMessage = error instanceof Error ? error.message : (error as {error: string})?.error || 'An error occurred while fetching bookings';
    Toast.show({
      type: 'error',
      text1: 'Error fetching bookings',
      text2: errorMessage,
    });
    yield put(actions.fetchBookingsFailure());
  }
}

function* fetchBooking(action: PayloadAction<string>) {
  try {
    const bookingId = action.payload;
    const response: ApiResponse<Booking> = yield call(request, {
      method: 'GET',
      url: `/api/users/bookings/${bookingId}`,
  })
  if (response.error || !response.data) {
    throw new Error(response.message || response.error || 'An error occurred while fetching booking');
  }
  yield put(actions.fetchBookingSuccess(response.data));
  } catch (error:unknown) {
    const errorMessage = error instanceof Error ? error.message : (error as {error: string})?.error || 'An error occurred while fetching booking';
    Toast.show({
      type: 'error',
      text1: 'Error fetching booking',
      text2: errorMessage,
    });
    yield put(actions.fetchBookingFailure());
  }
}

export function* rescheduleBooking(action: PayloadAction<string>) {
  const bookings: Booking[] = yield select(selectBookings);
  const booking = bookings.find(booking => booking.id === action.payload);
  if (!booking) return;
  yield put(bookingActions.updateBooking({
    summary: {
      estimatedDuration: booking.estimatedDuration,
      requiredSkills: booking.requiredSkills,
      requiredTools: booking.requiredTools,
      estimatedPrice: booking.estimatedPrice.toString(),
      reasoning: '',
    },
    artisan: booking.worker,
    description: booking.description,
    requiredSkills: booking.requiredSkills.map(skill => skill.name),
    appointmentDateTime: {
      date: {
        value: booking.date,
        error: '',
      },
      time: {
        value: '',
        error: '',
      },
    },
    serviceLocationType: booking.serviceType,
    serviceLocation: booking.location,
    media: booking.media,
    bookingId: booking.id,
  }));
  let selectedDate = new Date(booking.date);
  // if date is today, pass the date as it is. if not reset the time to 00:00:00
  if (isToday(selectedDate)) {
    // set time to an hour away from now
    selectedDate = addHours(new Date(), 1);
  } else if (isPast(selectedDate)) {
    selectedDate = addHours(new Date(), 1);
  } else {
    selectedDate = setHours(selectedDate, 7);
    selectedDate = setMinutes(selectedDate, 0);
    selectedDate = setSeconds(selectedDate, 0);
  }
  const dateString = selectedDate.toISOString();
  yield put(bookingActions.getAvailableTimes(dateString));
}

function* cancelBooking(action: PayloadAction<string>) {
  try {
    const response: ApiResponse<Booking> = yield call(request, {
      method: 'POST',
      url: `/api/users/bookings/${action.payload}/cancel`,
    })
    if (response.error || !response.data) {
      throw new Error(response.message || response.error || 'An error occurred while canceling booking');
    }
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Booking canceled successfully',
    });
    yield put(actions.fetchBookings());
    yield put(actions.fetchBooking(action.payload));
  } catch (error:unknown) {
    const errorMessage = error instanceof Error ? error.message : (error as {error: string})?.error || 'An error occurred while canceling booking';
    Toast.show({
      type: 'error',
      text1: 'Error canceling booking',
      text2: errorMessage,
    });
  }
}

function* deleteBooking(action: PayloadAction<string>) {
  try {
    const response: ApiResponse<Booking> = yield call(request, {
      method: 'DELETE',
      url: `/api/users/bookings/${action.payload}`,
    })
    if (response.error || !response.data) {
      throw new Error(response.message || response.error || 'An error occurred while deleting booking');
    }
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Booking deleted successfully',
    });
    yield put(actions.fetchBookings());
    router.dismissTo('/(tabs)/(bookings)/bookings');
  } catch (error:unknown) {
    const errorMessage = error instanceof Error ? error.message : (error as {error: string})?.error || 'An error occurred while deleting booking';
    Toast.show({
      type: 'error',
      text1: 'Error deleting booking',
      text2: errorMessage,
    });
  }
}

export function* bookingsSaga() {
  yield takeLatest(actions.fetchBookings, fetchBookings);
  yield takeLatest(actions.fetchBooking, fetchBooking);
  yield takeLatest(actions.setSelectedDate, fetchBookings);
  yield takeLatest(actions.cancelBooking, cancelBooking);
  yield takeLatest(actions.deleteBooking, deleteBooking);
  yield takeLatest(actions.rescheduleBooking, rescheduleBooking);
}

