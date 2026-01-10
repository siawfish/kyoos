import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Asset, AppState, Theme, User, StoreName, LocationForm} from './types';

// The initial state of the GithubRepoForm container
export const initialState: AppState = {
  isLoading: false,
  token: null,
  user: null,
  hasSeenOnboarding: false,
  isUpdatingTheme: false,
  isUpdatingNotifications: false,
  location: {
    lat: 0,
    lng: 0,
    address: '',
    error: '',
    isLoading: false,
    isMapPickerOpen: false,
  },
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setHasSeenOnboarding: (state, action: PayloadAction<boolean>) => {
      state.hasSeenOnboarding = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    getUser: (state) => {},
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setIsUploadingAsset: (state, action: PayloadAction<{
      formData: FormData;
      callback: (asset: Asset[]) => void;
      notify?: boolean;
    }>) => {
    },
    setIsAuthenticated: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    updateTheme: (state, action: PayloadAction<{
      theme: Theme;
    }>) => {
      state.isUpdatingTheme = true;
      if (state.user) {
        state.user.settings.theme = action.payload.theme;
      }
    },
    updateThemeCompleted: (state) => {
      state.isUpdatingTheme = false;
    },
    reverseTheme: (state) => {
      state.isUpdatingTheme = false;
      if (state.user) {
        state.user.settings.theme = state.user.settings.theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
      }
    },
    reverseGeocodeLocation: (state, action: PayloadAction<{latlng: string, store?: StoreName}>) => {},
    updateNotifications: (state, action: PayloadAction<{
      pushNotification: boolean;
    }>) => {
      state.isUpdatingNotifications = true;
      if (state.user) {
        state.user.settings.notifications.pushNotification = action.payload.pushNotification;
      }
    },
    registerPushToken: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.settings.notifications.pushToken = action.payload;
      }
    },
    updateNotificationsCompleted: (state) => {
      state.isUpdatingNotifications = false;
    },
    setLocation: (state, action: PayloadAction<LocationForm>) => {
      state.location = action.payload;
    },
    setLocationError: (state, action: PayloadAction<string>) => {
      state.location.error = action.payload;
    },
    clearLocationError: (state) => {
      state.location.error = '';
    },
    saveUserLocation: (state) => {
      state.location.isLoading = true;
    },
    openMapPicker: (state) => {
      state.location.isMapPickerOpen = true;
    },
    closeMapPicker: (state) => {
      state.location.isMapPickerOpen = false;
    },
    reverseNotifications: (state) => {
      if (state.user) {
        state.user.settings.notifications.pushNotification = !state.user.settings.notifications.pushNotification;
      }
    },
    logout: () => {},
    resetAppState: () => {
      return initialState;
    },
  },
});

export const {actions, reducer, name: sliceKey} = appSlice;
