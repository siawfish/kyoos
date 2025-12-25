/**
 * Gets the repositories of the game from Game
 */

import {call, put, select, takeLatest} from 'redux-saga/effects';
import { actions } from '@/redux/search/slice';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { SearchResponse } from '@/redux/search/types';
import { selectLocationForm, selectMedia, selectSearch } from '@/redux/search/selector';
import { Media, User } from '@/redux/app/types';
import { request } from '@/services/api';
import { ApiResponse } from '@/services/types';
import { Location } from '@/redux/auth/types';

export function* search() {
    try {
        const search: string = yield select(selectSearch);
        const media: Media[] = yield select(selectMedia);
        const location: string = yield select(selectLocationForm);
        const formData = new FormData();
        formData.append('query', search);
        formData.append('location', JSON.stringify(location));
        media.forEach((item) => {
            const file = {
                uri: item.uri,
                name: item.uri.split('/').pop(),
                type: item.type,
                width: item?.width,
                height: item?.height,
            } as any;
            formData.append('assets', file);
        });

        const { data, error, message } : ApiResponse<SearchResponse> = yield call(request, {
            method: 'POST',
            url: '/api/users/search/ai',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (error || !data) {
            throw new Error(error || message || 'An error occurred while searching');
        }

        yield put(actions.setSummary({
            estimatedDuration: data.estimatedDuration || 0,
            requiredSkills: data.requiredSkills || [],
            requiredTools: data.requiredTools || [],
            estimatedPrice: data.estimatedPrice || "",
            reasoning: data.reasoning || "",
        }));
        yield put(actions.setRecommendedWorkers(data.recommendedWorkers));
        yield put(actions.setClosestWorkers(data.closestWorkers));
        yield put(actions.setSearchReferenceId(data.searchReferenceId));
        router.push('/(tabs)/(search)/results');
    } catch (error:any) {
        const errorMessage = error?.message || error?.error || 'An error occurred while searching';
        Toast.show({
            type: 'error',
            text1: 'Search failed',
            text2: errorMessage,
        });
    } finally {
        yield put(actions.setIsLoading(false));
    }
}



export function* updateUserLocation() {
    try {
        const location: Location = yield select(selectLocationForm);
        const response : ApiResponse<User> = yield call(request, {
            method: 'PATCH',
            url: '/api/users/profile',
            data: {
                location: {
                    lat: location.lat,
                    lng: location.lng,
                    address: location.address,
                },
            },
        });
        if (response.error || !response.data) {
            throw new Error(response.error || response.message || 'An error occurred while getting user');
        }
    } catch (error: any) {
        const errorMessage = error?.error || error?.message || 'Failed to update user';
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: errorMessage,
        });
    }
}

export function* searchSaga() {
  yield takeLatest(actions.onSearch, search);
  yield takeLatest(actions.setLocation, updateUserLocation);
}
