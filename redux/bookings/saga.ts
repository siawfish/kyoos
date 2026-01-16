import Toast from 'react-native-toast-message';
import { call, put, takeLatest } from 'redux-saga/effects';
import { actions } from './slice';
import { BookingsResponse } from './types';
import { PayloadAction } from '@reduxjs/toolkit';
import { ApiResponse } from '@/services/types';
import { request } from '@/services/api';
import { Booking } from '../booking/types';

function* fetchBookings() {
  try {
    const response: ApiResponse<BookingsResponse> = yield call(request, {
      method: 'GET',
      url: `/api/users/bookings`,
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

export function* bookingsSaga() {
  yield takeLatest(actions.fetchBookings, fetchBookings);
  yield takeLatest(actions.fetchBooking, fetchBooking);
}

