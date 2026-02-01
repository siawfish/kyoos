import api from './axios';
import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from './types';
import { getItemFromStorage, setItemToStorage, removeItemFromStorage } from './asyncStorage';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

// Refresh token queue management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

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
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
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

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear tokens on refresh failure
        await removeItemFromStorage('token');
        await removeItemFromStorage('refreshToken');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const errorResponse = {
      error: error?.response?.data?.error,
      message: error?.response?.data?.message,
    };
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
