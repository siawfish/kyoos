import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Asset, ContainerState, Theme, User} from './types';
import { Location } from '@/redux/auth/types';

// The initial state of the GithubRepoForm container
export const initialState: ContainerState = {
  isLoading: false,
  token: null,
  user: null,
  hasSeenOnboarding: false,
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
      callback: () => void;
    }>) => {
      if (state.user) {
        state.user.settings.theme = action.payload.theme;
      }
    },
    reverseTheme: (state) => {
      if (state.user) {
        state.user.settings.theme = state.user.settings.theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
      }
    },
    reverseGeocodeLocation: (state, action: PayloadAction<{latlng: string, callback: (loc: Location) => void}>) => {},
    updateNotifications: (state, action: PayloadAction<{
      pushNotification: boolean;
      callback: () => void;
    }>) => {
      if (state.user) {
        state.user.settings.notifications.pushNotification = action.payload.pushNotification;
      }
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
