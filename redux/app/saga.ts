/**
 * Gets the repositories of the game from Game
 */

import {call, delay, put, takeLatest} from 'redux-saga/effects';
import { actions } from './slice';
import { actions as authActions } from '@/redux/auth/slice';
import Toast from 'react-native-toast-message';
import { ApiResponse } from '@/services/types';
import { request } from '@/services/api';
import { PayloadAction } from '@reduxjs/toolkit';
import { removeItemFromStorage } from '@/services/asyncStorage';
import { Asset, User, Theme, StoreName } from './types';
import { Location } from '@/redux/auth/types';

export function* logout() {
    try {
        yield delay(500);
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
    } catch (error:any) {
        const errorMessage = error?.error || error?.message || 'An error occurred while logging out';
        Toast.show({
            type: 'error',
            text1: 'Logout failed',
            text2: errorMessage,
        });
    } 
}

export function* getUser() {
    try {
        yield delay(500);
        const response : ApiResponse<User> = yield call(request, {
            method: 'GET',
            url: '/api/users/auth/me',
        });
        if (response.error || !response.data) {
            throw new Error(response.error || response.message || 'An error occurred while getting user');
        }
        yield put(actions.setUser(response.data));
    } catch (error:any) {
        const errorMessage = error?.error || error?.message || 'Please login again';    
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
        yield delay(500);
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
    } catch (error:any) {
        const errorMessage = error?.error || error?.message || 'An error occurred while uploading assets';
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
  callback: () => void;
}>) {
    try {
        yield delay(500);
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
    } catch (error:any) {
        const errorMessage = error?.error || error?.message || 'An error occurred while updating theme';
        yield put(actions.reverseTheme());
        Toast.show({
            type: 'error',
            text1: 'Update theme failed',
            text2: errorMessage,
        });
    } finally {
        action.payload.callback();
    }
}

export function* updateNotifications(action: PayloadAction<{
  pushNotification: boolean;
  callback: () => void;
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
    } catch (error:any) {
        const errorMessage = error?.error || error?.message || 'An error occurred while updating notifications';
        yield put(actions.reverseNotifications());
        Toast.show({
            type: 'error',
            text1: 'Update notifications failed',
            text2: errorMessage,
        });
    } finally {
        action.payload.callback();
    }
} 

export function* reverseGeocodeLocation(action: PayloadAction<{latlng: string, store?: StoreName}>) {
    try {
        yield delay(500);
        const response: ApiResponse<Location> = yield call(request, {
            method: 'GET',
            url: `/api/google/reverseGeoCode/${action.payload.latlng}`,
        });
        if (response.error || !response.data) {
            throw new Error(response.message || response.error || 'An error occurred while reverse geocoding location');
        }
        if (action?.payload?.store === StoreName.REGISTER) {
            yield put(authActions.setLocation(response.data));
        }
    } catch (error:any) {
        const errorMessage = error?.error || error?.message || 'An error occurred while reverse geocoding location';
        Toast.show({
            type: 'error',
            text1: 'Reverse geocode location failed',
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
}
