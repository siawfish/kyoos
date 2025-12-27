import { actions as appActions } from '@/redux/app/slice';
import { User } from '@/redux/app/types';
import { LocationForm, RegisterForm } from '@/redux/auth/types';
import { request } from '@/services/api';
import { ApiResponse } from '@/services/types';
import { PayloadAction } from '@reduxjs/toolkit';
import Toast from 'react-native-toast-message';
import { call, delay, put, select, takeLatest } from 'redux-saga/effects';
import { selectProfileForm } from './selector';
import { actions } from './slice';

export function* saveUserBasicInformation() {
    try {
        yield delay(500);
        const userForm: RegisterForm = yield select(selectProfileForm);  
        const { data, error } = yield call(updateUser, {
            name: userForm.name.value,
        });
        if (error) {
            throw new Error(error);
        }
        yield put(appActions.setUser(data));
    } catch (error: any) {
        const errorMessage = error?.error || error?.message || 'Failed to save user form';
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: errorMessage,
        });
    }
}

export function* saveUserLocation() {
    try {
        yield delay(500);
        const userForm: RegisterForm = yield select(selectProfileForm);  
        const { data, error } = yield call(updateUser, {
            location: {
                address: userForm.location?.address,
                lat: userForm.location.lat,
                lng: userForm.location.lng
            },
        });
        if (error) {
            throw new Error(error);
        }
        yield put(appActions.setUser(data));
    } catch (error: any) {
        const errorMessage = error?.error || error?.message || 'Failed to save user form';
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: errorMessage,
        });
    }
}

export async function updateUser(user: Partial<User>) {
    try {
        const response : ApiResponse<User> = await request({
            method: 'PATCH',
            url: '/api/workers/profile',
            data: user,
        });
        if (response.error || !response.data) {
            throw new Error(response.error || response.message || 'An error occurred while getting user');
        }
        return {
            data: response.data,
            error: null,
        }
    } catch (error: any) {
        const errorMessage = error?.error || error?.message || 'Failed to update user';
        return {
            data: null,
            error: errorMessage,
        }
    }
}


export function* settingsSaga() {
}
