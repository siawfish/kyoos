import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginFormFields, RegisterFormFields } from '@/redux/auth/types';
import { KeyValue, LocationForm, User } from '@/redux/app/types';
import { REHYDRATE } from 'redux-persist';

interface RehydrateAction {
  type: typeof REHYDRATE;
  key: string;
  payload: {
    auth?: AuthState;
  };
}

// The initial state of the GithubRepoForm container
export const initialState: AuthState = {
  loginForm: {
    phoneNumber: {
      value: '',
      error: '',
    },
    otp: {
      value: '',
      error: '',
    },
    isLoading: false,
  },
  referenceId: '',
  registerForm: {
    name: {
      value: '',
      error: '',
    },
    email: {
      value: '',
      error: '',
    },
    phoneNumber: {
      value: '',
      error: '',
    },
    gender: {
      value: '',
      error: '',
    },
    location: {
      lat: 0,
      lng: 0,
      address: '',
      error: '',
      isLoading: false, 
      isMapPickerOpen: false,
    },
    avatar: {
      value: '',
      error: '',
    },
    isLoading: false,
  },
  credentials: {
    token: '',
    user: null,
  },
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initiateLogin: (state) => {
      state.loginForm.isLoading = true;
    },
    verifyPhoneNumber: (state) => {
      state.loginForm.isLoading = true;
    },
    verifyPhoneNumberSuccess: (state, action: PayloadAction<string>) => {
      state.referenceId = action.payload;
      state.loginForm.isLoading = false;
    },
    verifyPhoneNumberError: (state) => {
      state.loginForm.isLoading = false;
    },
    setLoginFormValue: (state, action: PayloadAction<KeyValue<LoginFormFields>>) => {
        state.loginForm[action.payload.key].value = action.payload.value;
        state.loginForm[action.payload.key].error = '';
    },
    setLoginFormErrors: (state, action: PayloadAction<KeyValue<LoginFormFields>>) => {
      state.loginForm[action.payload.key].error = action.payload.value;
    },
    setRegisterFormValue: (state, action: PayloadAction<KeyValue<RegisterFormFields>>) => {
      state.registerForm[action.payload.key].value = action.payload.value;
      state.registerForm[action.payload.key].error = '';
    },
    setRegisterFormErrors: (state, action: PayloadAction<KeyValue<RegisterFormFields>>) => {
      state.registerForm[action.payload.key].error = action.payload.value;
    },
    setRegisterFormIsLoading: (state, action: PayloadAction<boolean>) => {
      state.registerForm.isLoading = action.payload;
    },
    setLocation: (state, action: PayloadAction<LocationForm>) => {
      state.registerForm.location = action.payload;
    },
    saveUserLocation: (state) => {
      state.registerForm.location.isLoading = true;
    },
    openMapPicker: (state) => {
      state.registerForm.location.isMapPickerOpen = true;
    },
    closeMapPicker: (state) => {
      state.registerForm.location.isMapPickerOpen = false;
    },
    setLoginFormIsLoading: (state, action: PayloadAction<boolean>) => {
      state.loginForm.isLoading = action.payload;
    },
    verifyOtp: (state) => {
      state.loginForm.isLoading = true;
    },
    submitRegisterForm: (state) => {
      state.registerForm.isLoading = true;
    },
    resetAuthState: (state) => {
      state.loginForm = initialState.loginForm;
      state.registerForm = initialState.registerForm;
      state.referenceId = '';
      state.credentials = initialState.credentials;
    },
    setCredentials: (state, action: PayloadAction<{token: string, user: User}>) => {
      state.credentials = action.payload;
      state.registerForm.isLoading = false;
    },
    confirmLogin: () => {},
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action: RehydrateAction) => {
      // Handle rehydration explicitly
      if (action.payload?.auth) {
        return {
          ...state,
          ...action.payload.auth
        };
      }
      return state;
    });
  }
});

export const {actions, reducer, name: sliceKey} = authSlice;
