/**
 * Gets the repositories of the game from Game
 */

import { Media } from '@/redux/app/types';
import { actions } from '@/redux/booking/slice';
import { Summary, Worker } from '@/redux/search/types';
import Toast from 'react-native-toast-message';
import { call, delay, put, select, takeLatest } from 'redux-saga/effects';
import { selectMedia, selectSearch, selectSummary } from '../search/selector';
import { selectArtisan, selectAvailableSlots } from './selector';
import { PayloadAction } from '@reduxjs/toolkit';
import { ApiResponse } from '@/services/types';
import { request } from '@/services/api';
import { GetAvailableTimesResponse } from './types';
import { addHours, addMinutes } from 'date-fns';

export function* confirmBooking() {
    try {
        yield delay(500);
    } catch (error:any) {
        Toast.show({
            type: 'error',
            text1: 'Booking failed',
            text2: error?.message || 'An error occurred while booking',
        });
    } finally {
        yield put(actions.setIsLoading(false));
    }
}

export function* initializeBooking() {
    const media: Media[] = yield select(selectMedia);
    const summary: Summary = yield select(selectSummary);
    const search: string = yield select(selectSearch);
    yield put(actions.updateBooking({
        media,
        summary,
        description: search,
        requiredSkills: summary.requiredSkills.map((skill) => skill.name),
    }));
}

export function* getAvailableTimes(action: PayloadAction<string>) {
    try {
        const date = action.payload;
        const worker: Worker = yield select(selectArtisan);
        const response: ApiResponse<GetAvailableTimesResponse> = yield call(request, {
            method: 'GET',
            url: `/api/users/booking/${worker?.id}/availability?date=${date}`,
        })
        if (response.error) {
            throw new Error(response.message || response.error || 'An error occurred while getting available times');
        }
        yield put(actions.getAvailableTimesSuccess(response.data?.availableSlots || []));
} catch (error:unknown) {
        const errorMessage = error instanceof Error ? error.message : (error as {error: string})?.error || 'An error occurred while getting available times';
        yield put(actions.getAvailableTimesError(errorMessage));
    }
}

export function* bookingSaga() {
  yield takeLatest(actions.onConfirmBooking, confirmBooking);
  yield takeLatest(actions.initializeBooking, initializeBooking);
  yield takeLatest(actions.getAvailableTimes, getAvailableTimes);
}
