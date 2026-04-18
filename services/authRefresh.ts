import axios from 'axios';
import { getItemFromStorage, setItemToStorage, removeItemFromStorage } from './asyncStorage';
import { actions as appActions } from '@/redux/app/slice';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

async function dispatchSessionRefreshed(accessToken: string) {
  try {
    const { store } = await import('@/store');
    store.dispatch(appActions.setIsAuthenticated(accessToken));
  } catch {
    // Store may not be initialized yet
  }
}

async function dispatchSessionCleared() {
  try {
    const { store } = await import('@/store');
    store.dispatch(appActions.resetAppState());
  } catch {
    // Store may not be initialized yet
  }
}

let isRefreshing = false;
const failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue.length = 0;
}

/**
 * Refresh user access + refresh tokens. Single-flight: concurrent callers (HTTP 401 + socket) share one request.
 * Returns new access token, or null if no refresh token or refresh failed (storage cleared on failure).
 */
export async function refreshUserSession(): Promise<string | null> {
  const refreshToken = await getItemFromStorage('refreshToken');
  if (!refreshToken) {
    return null;
  }

  if (isRefreshing) {
    try {
      const token = await new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
      return token;
    } catch {
      return null;
    }
  }

  isRefreshing = true;
  try {
    const response = await axios.post(`${baseURL}/api/users/auth/refresh`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    await setItemToStorage('token', accessToken);
    await setItemToStorage('refreshToken', newRefreshToken);

    await dispatchSessionRefreshed(accessToken);

    processQueue(null, accessToken);
    return accessToken;
  } catch (refreshError) {
    processQueue(refreshError, null);
    await removeItemFromStorage('token');
    await removeItemFromStorage('refreshToken');
    await dispatchSessionCleared();
    return null;
  } finally {
    isRefreshing = false;
  }
}
