import { Media } from '@/redux/app/types';
import { Location } from '@/redux/auth/types';
import { selectMedia, selectSearch } from '@/redux/search/selector';
import { actions } from '@/redux/search/slice';
import { InitializeResponse, SearchResponse } from '@/redux/search/types';
import { request } from '@/services/api';
import { ApiResponse } from '@/services/types';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { selectUserLocation } from '../app/selector';

export function* search() {
    try {
        const search: string = yield select(selectSearch);
        const media: Media[] = yield select(selectMedia);
        const location: Location = yield select(selectUserLocation);
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
    } catch (error:unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while searching';
        Toast.show({
            type: 'error',
            text1: 'Search failed',
            text2: errorMessage,
        });
    } finally {
        yield put(actions.setIsLoading(false));
    }
}

export function* onInitialize() {
    try {
        const location: Location = yield select(selectUserLocation);
        const { data, error, message } : ApiResponse<InitializeResponse> = yield call(request, {
            method: 'GET',
            url: '/api/users/search',
            params: {
                lat: location.lat,
                lng: location.lng,
                skill: '35f3fc0c-d7bf-44e0-8c63-a8518b768073'
            },
        });
        if (error || !data) {
            throw new Error(error || message || 'An error occurred while initializing');
        }
        yield put(actions.setNearestWorkers(data.workers));
    } catch (error:unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while initializing';
        Toast.show({
            type: 'error',
            text1: 'Initialization failed',
            text2: errorMessage,
        });
    } finally {
        yield put(actions.onInitializeCompleted());
    }
}

export function* searchSaga() {
    yield takeLatest(actions.onSearch, search);
    yield takeLatest(actions.onInitialize, onInitialize);
}
