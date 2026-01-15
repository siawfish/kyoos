/**
 * Gets the repositories of the game from Game
 */

import { FormElement, Media } from '@/redux/app/types';
import { actions } from '@/redux/booking/slice';
import { Summary, Worker } from '@/redux/search/types';
import Toast from 'react-native-toast-message';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { selectMedia, selectSearch, selectSearchReferenceId, selectSummary } from '../search/selector';
import { selectArtisan, selectServiceDate, selectServiceLocation, selectServiceLocationType, selectServiceTime } from './selector';
import { PayloadAction } from '@reduxjs/toolkit';
import { ApiResponse } from '@/services/types';
import { request } from '@/services/api';
import { Booking, GetAvailableTimesResponse, ServiceLocationType } from './types';
import { Location } from '../auth/types';
import { selectUserLocation } from '../app/selector';
import { router } from 'expo-router';

export function* confirmBooking() {
    try {
        const serviceType: ServiceLocationType = yield select(selectServiceLocationType);
        const serviceLocation: Location = yield select(selectServiceLocation);
        const worker: Worker = yield select(selectArtisan);
        const time: FormElement = yield select(selectServiceTime);
        const date: FormElement = yield select(selectServiceDate);
        const searchId: string = yield select(selectSearchReferenceId);
        const response: ApiResponse<Booking> = yield call(request, {
            method: 'POST',
            url: `/api/users/booking`,
            data: {
                serviceType,
                serviceLocation: serviceType === ServiceLocationType.PERSON ? serviceLocation : null,
                workerId: worker?.id,
                date: date?.value,
                startTime: time?.value,
                searchId,
            }
        })
        if (response.error || !response.data) {
            throw new Error(response.message || response.error || 'An error occurred while booking');
        }
        yield put(actions.onConfirmBookingSuccess());
    } catch (error:unknown) {
        const errorMessage = error instanceof Error ? error.message : (error as {error: string})?.error || 'An error occurred while booking';
        yield put(actions.onConfirmBookingError(errorMessage));
        const worker: Worker = yield select(selectArtisan);
        router.replace({
            pathname: '/(tabs)/(search)/(booking)/booking',
            params: {
                artisanId: worker?.id,
            },
        });
    }
}

export function* initializeBooking() {
    const media: Media[] = yield select(selectMedia);
    const summary: Summary = yield select(selectSummary);
    const search: string = yield select(selectSearch);
    const userLocation: Location = yield select(selectUserLocation);
    yield put(actions.updateBooking({
        media,
        summary,
        description: search,
        requiredSkills: summary.requiredSkills.map((skill) => skill.name),
        serviceLocation: userLocation,
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

export function* reverseGeocodeServiceLocation(action: PayloadAction<string>) {
    try {
        const response: ApiResponse<Location> = yield call(request, {
            method: 'GET',
            url: `/api/google/reverseGeoCode/${action.payload}`,
        });
        if (response.error || !response.data) {
            throw new Error(response.message || response.error || 'An error occurred while reverse geocoding location');
        }
        yield put(actions.setServiceLocation({
            lat: response.data.lat,
            lng: response.data.lng,
            address: response.data.address,
        }));
        yield put(actions.closeMapPicker());
    } catch (error:unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while reverse geocoding location';
        Toast.show({
            type: 'error',
            text1: 'Reverse geocode location failed',
            text2: errorMessage,
        });
    }
}

export function* bookingSaga() {
  yield takeLatest(actions.onConfirmBooking, confirmBooking);
  yield takeLatest(actions.initializeBooking, initializeBooking);
  yield takeLatest(actions.getAvailableTimes, getAvailableTimes);
  yield takeLatest(actions.reverseGeocodeServiceLocation, reverseGeocodeServiceLocation);
}
