/**
 * Gets the repositories of the game from Game
 */

import {put, select, takeLatest, call} from 'redux-saga/effects';
import { actions } from './slice';
import { selectCredentials, selectLoginFormOtp, selectLoginFormPhoneNumber, selectReferenceId, selectRegisterForm } from './selector';
import { KeyValue, User } from '@/redux/app/types';
import { actions as appActions } from '@/redux/app/slice';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { ApiResponse } from '@/services/types';
import { request } from '@/services/api';
import { Credentials, LoginResponse, RegisterForm, RegisterResponse, VerifyPhoneNumberResponse } from '@/redux/auth/types';
import { setItemToStorage } from '@/services/asyncStorage';

export function* register() {
    try {
        const registerForm: RegisterForm = yield select(selectRegisterForm);
        const referenceId: string = yield select(selectReferenceId);
        const data = {
            referenceId,
            name: registerForm.name.value,
            email: registerForm.email.value,
            avatar: registerForm.avatar.value,
            phoneNumber: registerForm.phoneNumber.value,
            gender: registerForm.gender.value,
            location: {
                address: registerForm.location.address,
                lat: registerForm.location.lat,
                lng: registerForm.location.lng
            },
            acceptedTerms: {
                acceptedAt: new Date().toISOString(),
                status: true
            },
        }
        const response: ApiResponse<RegisterResponse> = yield call(request, {
            method: 'POST',
            url: `/api/users/auth/register`,
            data,
        });
        if (response.error || !response.data) {
            throw new Error(response.message || response.error || 'An error occurred while registering');
        }
        yield put(actions.setCredentials({
            token: response.data.accessToken,
            user: response.data.user as User
        }));
        yield call(setItemToStorage, 'refreshToken', response.data.refreshToken);
        router.replace('/(auth)/success');
    } catch (error:any) {
        Toast.show({
            type: 'error',
            text1: 'Register failed',
            text2: error?.error || error?.message || 'An error occurred while registering',
        });
    } finally {
        yield put(actions.setRegisterFormIsLoading(false));
    }
}
export function* login() {
    try {
        const otp: KeyValue<'otp'> = yield select(selectLoginFormOtp);
        const phoneNumber: KeyValue<'phoneNumber'> = yield select(selectLoginFormPhoneNumber);
        const referenceId: string = yield select(selectReferenceId);
        const response: ApiResponse<LoginResponse> = yield call(request, {
            method: 'POST',
            url: `/api/users/auth/verifyOTP`,
            data: {
                phoneNumber: phoneNumber.value,
                otp: otp.value,
                referenceId: referenceId,
            },
        });
        if (response.error || !response.data) {
            throw new Error(response.message || response.error || 'An error occurred while verifying OTP');
        }
        if (response.data.accessToken && response.data.user) {
            yield put(appActions.setIsAuthenticated(response.data.accessToken));
            yield put(appActions.setUser(response.data.user));
            yield call(setItemToStorage, 'token', response.data.accessToken);
            yield call(setItemToStorage, 'refreshToken', response.data.refreshToken!);
            yield put(actions.resetAuthState());
            return;
        }
        yield put(actions.setRegisterFormValue({
            key: 'phoneNumber',
            value: response.data.phoneNumber,
        }));
        router.replace('/(auth)/register');
    } catch (error:any) {
        const errorMessage = error?.error || error?.message || 'An error occurred while logging in';
        yield put(actions.setLoginFormErrors({key: 'otp', value: errorMessage}));
        Toast.show({
            type: 'error',
            text1: 'Login failed',
            text2: errorMessage,
        });
    } finally {
        yield put(actions.setLoginFormIsLoading(false));
    }
}

export function* verifyPhoneNumber() {
    try {
        const phoneNumber: KeyValue<'phoneNumber'> = yield select(selectLoginFormPhoneNumber);
        const response: ApiResponse<VerifyPhoneNumberResponse> = yield call(request, {
            method: 'GET',
            url: `/api/users/auth/verifyPhoneNumber?phoneNumber=${phoneNumber.value}`,
        });
        if (response.error || !response.data) {
            throw new Error(response.message || response.error || 'An error occurred while verifying phone number');
        }
        yield put(actions.verifyPhoneNumberSuccess(response.data.referenceId));
        router.replace('/(auth)/otp');
    } catch (error:any) {
        const errorMessage = error?.error || error?.message || 'An error occurred while verifying phone number';
        yield put(actions.verifyPhoneNumberError());
        Toast.show({
            type: 'error',
            text1: 'Verify phone number failed',
            text2: errorMessage,
        });
    }
}

export function* confirmLogin() {
    try {
        const credentials:Credentials = yield select(selectCredentials);
        if (!credentials.token || !credentials.user) {
            throw new Error('No credentials found');
        }
        yield put(appActions.setIsAuthenticated(credentials.token));
        yield put(appActions.setUser(credentials.user));
        yield call(setItemToStorage, 'token', credentials.token);
        yield put(actions.resetAuthState());
    } catch (error:any) {
        const errorMessage = error?.error || error?.message || 'An error occurred while confirming login';
        router.replace('/(auth)');
        Toast.show({
            type: 'error',
            text1: 'Confirm login failed',
            text2: errorMessage,
        });
    }
}

export function* resendOtp() {
    try {
        const phoneNumber: KeyValue<'phoneNumber'> = yield select(selectLoginFormPhoneNumber);
        const referenceId: string = yield select(selectReferenceId);
        const response: ApiResponse<LoginResponse> = yield call(request, {
            method: 'POST',
            url: `/api/users/auth/resendOTP`,
            data: {
                phoneNumber: phoneNumber.value,
                referenceId: referenceId,
            },
        });
        if (response.error || !response.data) {
            throw new Error(response.message || response.error || 'An error occurred while resending OTP');
        }
        Toast.show({
            type: 'success',
            text1: 'OTP resent successfully',
            text2: 'Please check your phone for the new OTP',
        });
    } catch (error:any) {
        const errorMessage = error?.error || error?.message || 'An error occurred while resending OTP';
        Toast.show({
            type: 'error',
            text1: 'Resend OTP failed',
            text2: errorMessage,
        });
    }
    finally {
        yield put(actions.setLoginFormIsResending(false));
    }
}

export function* authSaga() {
    yield takeLatest(actions.initiateLogin, login);
    yield takeLatest(actions.submitRegisterForm, register);
    yield takeLatest(actions.verifyPhoneNumber, verifyPhoneNumber);
    yield takeLatest(actions.confirmLogin, confirmLogin);
    yield takeLatest(actions.resendOtp, resendOtp);
}
