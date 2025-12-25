import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ContainerState } from '@/redux/settings/types';
import { KeyValue } from '@/redux/app/types';
import { RegisterFormFields } from '@/redux/auth/types';

// The initial state of the GithubRepoForm container
export const initialState: ContainerState = {
  profileForm: {
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
    avatar: {
      value: '',
      error: '',
    },
    gender: {
      value: '',
      error: '',
    },
    location: {
      address: '',
      lat: 0,
      lng: 0,
    },
    isLoading: false,
  },
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setProfileFormValue: (state, action: PayloadAction<KeyValue<RegisterFormFields>>) => {
      state.profileForm[action.payload.key].value = action.payload.value;
      state.profileForm[action.payload.key].error = '';
    },
    setProfileFormErrors: (state, action: PayloadAction<KeyValue<RegisterFormFields>>) => {
      state.profileForm[action.payload.key].error = action.payload.value;
    },
    setProfileFormIsLoading: (state, action: PayloadAction<boolean>) => {
      state.profileForm.isLoading = action.payload;
    },
    submitProfileForm: (state) => {
      state.profileForm.isLoading = true;
    },
  },
});

export const {actions, reducer, name: sliceKey} = settingsSlice;
