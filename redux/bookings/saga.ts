import { request } from '@/services/api';
import { ApiResponse } from '@/services/types';
import { PayloadAction } from '@reduxjs/toolkit';
import { addDays, addHours, format, isPast, isToday, setHours, setMinutes, setSeconds } from 'date-fns';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { actions as bookingActions } from '../booking/slice';
import { Booking } from '../booking/types';
import { selectBookings, selectCurrentWeekStart } from './selector';
import { actions } from './slice';

function* fetchBookings() {
  try {
    const currentWeekStart: string = yield select(selectCurrentWeekStart);
    const weekStartDate = new Date(currentWeekStart);
    const weekEndDate = addDays(weekStartDate, 6);
    
    const response: ApiResponse<Booking[]> = yield call(request, {
      method: 'GET',
      url: `/api/users/bookings`,
      params: {
        startDate: format(weekStartDate, 'yyyy-MM-dd'),
        endDate: format(weekEndDate, 'yyyy-MM-dd'),
      },
    })
    if (response.error || !response.data) {
      throw new Error(response.message || response.error || 'An error occurred while fetching bookings');
    }
    yield put(actions.fetchBookingsSuccess(response.data));
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
      estimatedDuration: booking.estimatedDuration!,
      requiredSkills: booking.requiredSkills!,
      requiredTools: booking.requiredTools!,
      estimatedPrice: booking.estimatedPrice!.toString(),
      reasoning: '',
    },
    artisan: booking.worker,
    description: booking.description,
    requiredSkills: booking.requiredSkills!.map(skill => skill.name),
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

function* rebookBooking(action: PayloadAction<string>) {
  const bookings: Booking[] = yield select(selectBookings);
  const booking = bookings.find(booking => booking.id === action.payload);
  if (!booking) return;
  yield put(bookingActions.updateBooking({
    summary: {
      estimatedDuration: booking.estimatedDuration!,
      requiredSkills: booking.requiredSkills!,
      requiredTools: booking.requiredTools!,
      estimatedPrice: booking.estimatedPrice!.toString(),
      reasoning: '',
    },
    artisan: booking.worker,
    description: booking.description,
    requiredSkills: booking.requiredSkills!.map(skill => skill.name),
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
    searchHistoryId: booking.searchId,
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
      text2: 'Booking has been canceled successfully',
    });
    yield put(actions.fetchBookings());
    yield put(actions.fetchBooking(action.payload));
  } catch (error:unknown) {
    const errorMessage = error instanceof Error ? error.message : (error as {error: string})?.error || 'An error occurred while canceling booking';
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
  } finally {
    yield put(actions.setIsUpdatingBooking(false));
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
      text2: 'Booking has been deleted successfully',
    });
    yield put(actions.fetchBookings());
    router.dismissTo('/(tabs)/(bookings)/bookings');
  } catch (error:unknown) {
    const errorMessage = error instanceof Error ? error.message : (error as {error: string})?.error || 'An error occurred while deleting booking';
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
  } finally {
    yield put(actions.setIsUpdatingBooking(false));
  }
}

function* completeBooking(action: PayloadAction<string>) {
  try {
    const response: ApiResponse<Booking> = yield call(request, {
      method: 'POST',
      url: `/api/users/bookings/${action.payload}/complete`,
    })
    if (response.error || !response.data) {
      throw new Error(response.message || response.error || 'An error occurred while completing booking');
    }
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Booking has been marked as completed successfully',
    });
    yield put(actions.fetchBookings());
    yield put(actions.fetchBooking(action.payload));
  } catch (error:unknown) {
    const errorMessage = error instanceof Error ? error.message : (error as {error: string})?.error || 'An error occurred while completing booking';
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
  } finally {
    yield put(actions.setIsUpdatingBooking(false));
  }
}

function* reportBooking(action: PayloadAction<string>) {
  try {
    const response: ApiResponse<Booking> = yield call(request, {
      method: 'POST',
      url: `/api/users/bookings/${action.payload}/report`,
    })
    if (response.error || !response.data) {
      throw new Error(response.message || response.error || 'An error occurred while reporting booking');
    }
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'You complaint has been received. We will review it and get back to you soon.',
    });
    yield put(actions.fetchBookings());
    yield put(actions.fetchBooking(action.payload));
  } catch (error:unknown) {
    const errorMessage = error instanceof Error ? error.message : (error as {error: string})?.error || 'An error occurred while reporting booking';
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
  } finally {
    yield put(actions.setIsUpdatingBooking(false));
  }
}

export function* bookingsSaga() {
  yield takeLatest(actions.fetchBookings, fetchBookings);
  yield takeLatest(actions.refreshBookings, fetchBookings);
  yield takeLatest(actions.fetchBooking, fetchBooking);
  yield takeLatest(actions.setCurrentWeekStart, fetchBookings);
  yield takeLatest(actions.cancelBooking, cancelBooking);
  yield takeLatest(actions.deleteBooking, deleteBooking);
  yield takeLatest(actions.rescheduleBooking, rescheduleBooking);
  yield takeLatest(actions.completeBooking, completeBooking);
  yield takeLatest(actions.reportBooking, reportBooking);
  yield takeLatest(actions.rebookBooking, rebookBooking);
}

