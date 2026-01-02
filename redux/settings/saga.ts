import { actions as appActions } from '@/redux/app/slice';
import { Gender, User } from '@/redux/app/types';
import { ProfileForm } from '@/redux/auth/types';
import { request } from '@/services/api';
import { ApiResponse } from '@/services/types';
import Toast from 'react-native-toast-message';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { selectProfileForm } from './selector';
import { actions } from './slice';

export function* saveUserBasicInformation() {
    try {
        const userForm: ProfileForm = yield select(selectProfileForm);  
        const { data, error } = yield call(updateUser, {
            name: userForm.name.value,
            email: userForm.email.value,
            gender: userForm.gender.value as Gender,
            avatar: userForm.avatar.value,
        });
        if (error) {
            throw new Error(error);
        }
        yield put(appActions.setUser(data));
        Toast.show({
            type: 'success',
            text1: 'Profile Update',
            text2: 'User profile updated successfully',
        });
    } catch (error: any) {
        const errorMessage = error?.error || error?.message || 'Failed to save user form';
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: errorMessage,
        });
    } finally {
        yield put(actions.setProfileFormIsLoading(false));
    }
}

export async function updateUser(user: Partial<User>) {
    try {
        const response : ApiResponse<User> = await request({
            method: 'PATCH',
            url: '/api/users/profile',
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
    yield takeLatest(actions.submitProfileForm.type, saveUserBasicInformation);
}
