import { call, delay, put, select, takeLatest } from "redux-saga/effects";
import { actions } from "./slice";
import { RegisterForm } from "@/redux/auth/types";
import { selectProfileForm } from "./selector";
import { actions as appActions } from "@/redux/app/slice"
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { Gender, User } from "@/redux/app/types";
import { request } from "@/services/api";
import { ApiResponse } from "@/services/types";

export function* submitProfileForm() {
    try {
        yield delay(500);
        const userForm: RegisterForm = yield select(selectProfileForm);  
        let user: Partial<User> = {};
        if (userForm.name.value) {
            user.name = userForm.name.value;
        }
        if (userForm.email.value) {
            user.email = userForm.email.value;
        }
        if (userForm.gender.value) {
            user.gender = userForm.gender.value as Gender;
        }
        if (userForm.avatar.value) {
            user.avatar = userForm.avatar.value;
        }
        if (userForm.location.address) {
            user.location = userForm.location;
        }
        const { data, error } = yield call(updateUser, user);
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
    yield takeLatest(actions.submitProfileForm, submitProfileForm);
}