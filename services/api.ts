import api from './axios';
import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { actions as appActions } from '@/redux/app/slice';
import { ApiResponse } from './types';
import { getItemFromStorage, setItemToStorage, removeItemFromStorage } from './asyncStorage';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

function toApiErrorShape(err: unknown): { error?: string; message?: string } {
  if (isAxiosError(err)) {
    return {
      error: err.response?.data?.error,
      message: err.response?.data?.message ?? err.message,
    };
  }
  if (err instanceof Error) {
    return { message: err.message };
  }
  return { message: 'Request failed' };
}

function getAuthorizationHeader(config: InternalAxiosRequestConfig): string | undefined {
  const headers = config.headers;
  if (!headers) return undefined;
  if (typeof (headers as { get?: (name: string) => unknown }).get === 'function') {
    const h = headers as { get: (name: string) => unknown };
    const v = h.get('Authorization') ?? h.get('authorization');
    return typeof v === 'string' ? v : undefined;
  }
  const record = headers as Record<string, unknown>;
  const v = record.Authorization ?? record.authorization;
  return typeof v === 'string' ? v : undefined;
}

function requestHadBearer(config: InternalAxiosRequestConfig): boolean {
  const auth = getAuthorizationHeader(config);
  return typeof auth === 'string' && auth.startsWith('Bearer ');
}

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

// Refresh token queue management
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await getItemFromStorage('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const errorResponse = {
      error: error?.response?.data?.error,
      message: error?.response?.data?.message,
    };

    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    const shouldTryRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      requestHadBearer(originalRequest);

    if (shouldTryRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (!originalRequest.headers) {
              originalRequest.headers = {} as InternalAxiosRequestConfig['headers'];
            }
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getItemFromStorage('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${baseURL}/api/users/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        await setItemToStorage('token', accessToken);
        await setItemToStorage('refreshToken', newRefreshToken);

        await dispatchSessionRefreshed(accessToken);

        processQueue(null, accessToken);
        if (!originalRequest.headers) {
          originalRequest.headers = {} as InternalAxiosRequestConfig['headers'];
        }
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        const rejection = toApiErrorShape(refreshError);
        processQueue(rejection, null);
        await removeItemFromStorage('token');
        await removeItemFromStorage('refreshToken');
        await dispatchSessionCleared();
        return Promise.reject(rejection);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(errorResponse);
  }
);

// Generic function to make API requests
function request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return api.request<ApiResponse<T>>(config).then(response => ({
    error: response?.data?.error,
    message: response?.data?.message,
    data: response?.data?.data,
  }));
}
  
// Export a reusable API client
export { api, request };
