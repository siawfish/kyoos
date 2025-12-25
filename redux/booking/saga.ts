/**
 * Gets the repositories of the game from Game
 */

import { delay, put, takeLatest, select } from 'redux-saga/effects';
import { actions } from '@/redux/booking/slice';
import Toast from 'react-native-toast-message';
import { selectMedia, selectSearch, selectSummary } from '../search/selector';
import { Media } from '@/redux/app/types';
import { Worker, Summary } from '@/redux/search/types';

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
    // const media: Media[] = yield select(selectMedia);
    // const summary: Summary = yield select(selectSummary);
    // const search: string = yield select(selectSearch);
    // yield put(actions.updateBooking({
    //     media,
    //     summary,
    //     description: search,
    //     requiredSkills: summary.requiredSkills.map((skill: any) => skill.name),
    //     artisan
    // }));
}

export function* bookingSaga() {
  yield takeLatest(actions.onConfirmBooking, confirmBooking);
  yield takeLatest(actions.initializeBooking, initializeBooking);
}
