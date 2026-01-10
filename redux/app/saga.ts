import {call, put, select, takeLatest} from 'redux-saga/effects';
import { actions } from './slice';
import { actions as authActions } from '@/redux/auth/slice';
import Toast from 'react-native-toast-message';
import { ApiResponse } from '@/services/types';
import { request } from '@/services/api';
import { PayloadAction } from '@reduxjs/toolkit';
import { removeItemFromStorage } from '@/services/asyncStorage';
import { Asset, User, Theme, StoreName } from './types';
import { Location } from '@/redux/auth/types';
import { selectUserLocation } from './selector';

export function* logout() {
    try {
        yield call(request, {
            method: 'GET',
            url: '/api/users/auth/signOut',
        });
        yield put(actions.resetAppState());
        yield call(removeItemFromStorage, 'token');
        Toast.show({
            type: 'success',
            text1: 'Logout successful',
            text2: 'You have been logged out successfully',
        });
    } catch (error:unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while logging out';
        Toast.show({
            type: 'error',
            text1: 'Logout failed',
            text2: errorMessage,
        });
    } 
}

export function* getUser() {
    try {
        const response : ApiResponse<User> = yield call(request, {
            method: 'GET',
            url: '/api/users/auth/me',
        });
        if (response.error || !response.data) {
            throw new Error(response.error || response.message || 'An error occurred while getting user');
        }
        yield put(actions.setUser(response.data));
    } catch (error:unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Please login again';    
        Toast.show({
            type: 'error',
            text1: 'Session expired',
            text2: errorMessage,
        });
        yield put(actions.resetAppState());
    }
}

export function* setIsUploadingAsset(action: PayloadAction<{
  formData: FormData;
  callback: (asset: Asset[]) => void;
  notify?: boolean;
}>) {
    try {
        const response: ApiResponse<Asset[]> = yield call(request, {
            method: 'POST',
            url: '/api/assets',
            data: action.payload.formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (response.error || !response.data) {
            throw new Error(response.error || response.message || 'An error occurred while uploading assets');
        }
        const failedAssets = response.data.filter((asset) => !asset.success);
        if (failedAssets.length > 0) {
            Toast.show({
                type: 'error',
                text1: 'Asset upload failed',
                text2: failedAssets.map((asset) => asset.error).join(', '),
            });
            action.payload.callback(response.data.filter((asset) => asset.success));
            return;
        }
        action.payload.callback(response.data);
        if (action?.payload?.notify) {
            Toast.show({
                type: 'success',
                text1: 'Assets uploaded successfully',
                text2: 'Your assets have been uploaded successfully',
            });
        }
    } catch (error:unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while uploading assets';
        Toast.show({
            type: 'error',
            text1: 'Upload assets failed',
            text2: errorMessage,
        });
        action.payload.callback([]);
    }
} 

export function* updateTheme(action: PayloadAction<{
  theme: Theme;
}>) {
    try {
        const response: ApiResponse<User> = yield call(request, {
            method: 'PATCH',
            url: '/api/users/profile/theme',
            data: {
                theme: action.payload.theme,
            },
        });
        if (response.error || !response.data) {
            throw new Error(response.error || response.message || 'An error occurred while updating theme');
        }
        yield put(actions.setUser(response.data));
    } catch (error:unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while updating theme';
        yield put(actions.reverseTheme());
        Toast.show({
            type: 'error',
            text1: 'Update theme failed',
            text2: errorMessage,
        });
    } finally {
        yield put(actions.updateThemeCompleted());
    }
}

export function* updateNotifications(action: PayloadAction<{
  pushNotification: boolean;
}>) {
    try {
        const response: ApiResponse<User> = yield call(request, {
            method: 'PATCH',
            url: '/api/users/profile/push-notification',
            data: {
                pushNotification: action.payload.pushNotification,
            },
        });
        if (response.error || !response.data) {
            throw new Error(response.error || response.message || 'An error occurred while updating notifications');
        }
        yield put(actions.setUser(response.data));
    } catch (error:unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while updating notifications';
        yield put(actions.reverseNotifications());
        Toast.show({
            type: 'error',
            text1: 'Update notifications failed',
            text2: errorMessage,
        });
    } finally {
        yield put(actions.updateNotificationsCompleted());
    }
} 

export function* reverseGeocodeLocation(action: PayloadAction<{latlng: string, store?: StoreName}>) {
    try {
        const response: ApiResponse<Location> = yield call(request, {
            method: 'GET',
            url: `/api/google/reverseGeoCode/${action.payload.latlng}`,
        });
        if (response.error || !response.data) {
            throw new Error(response.message || response.error || 'An error occurred while reverse geocoding location');
        }
        if (action?.payload?.store === StoreName.REGISTER) {
            yield put(authActions.setLocation({
                lat: response.data.lat,
                lng: response.data.lng,
                address: response.data.address,
                error: '',
                isLoading: false,
                isMapPickerOpen: false,
            }));
            yield put(authActions.closeMapPicker());
        }
        if (action?.payload?.store === StoreName.LOCATION) {
            yield put(actions.setLocation({
                lat: response.data.lat,
                lng: response.data.lng,
                address: response.data.address,
                error: '',
                isLoading: false,
                isMapPickerOpen: false,
            }));
            yield put(actions.closeMapPicker());
        }
    } catch (error:unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while reverse geocoding location';
        Toast.show({
            type: 'error',
            text1: 'Reverse geocode location failed',
            text2: errorMessage,
        });
    }
}

export function* updateUserLocation() {
    try {
        const location: Location = yield select(selectUserLocation);
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
    } catch (error:unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: errorMessage,
        });
    }
}

export function* registerPushToken(action: PayloadAction<string>) {
    try {
        const response: ApiResponse<User> = yield call(request, {
            method: 'POST',
            url: '/api/users/profile/push-token',
            data: {
                pushToken: action.payload,
            },
        });
        if (response.error || !response.data) {
            throw new Error(response.error || response.message || 'An error occurred while registering push token');
        }
        yield put(actions.setUser(response.data));
        Toast.show({
            type: 'success',
            text1: 'Push token registered successfully',
            text2: 'Your push token has been registered successfully',
        });
    } catch (error:unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while registering push token';
        Toast.show({
            type: 'error',
            text1: 'Register push token failed',
            text2: errorMessage,
        });
    }
}

export function* appSaga() {
  yield takeLatest(actions.logout, logout);
  yield takeLatest(actions.getUser, getUser);
  yield takeLatest(actions.setIsUploadingAsset.type, setIsUploadingAsset);
  yield takeLatest(actions.updateTheme.type, updateTheme);
  yield takeLatest(actions.updateNotifications.type, updateNotifications);
  yield takeLatest(actions.reverseGeocodeLocation.type, reverseGeocodeLocation);
  yield takeLatest(actions.setLocation.type, updateUserLocation);
  yield takeLatest(actions.registerPushToken.type, registerPushToken);
}
