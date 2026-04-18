import api from './axios';
import { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { ApiResponse } from './types';
import { getItemFromStorage } from './asyncStorage';
import { refreshUserSession } from './authRefresh';

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

function isRefreshEndpointRequest(config: InternalAxiosRequestConfig): boolean {
  const url = config.url ?? '';
  return url.includes('/auth/refresh');
}

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

    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(errorResponse);
    }

    if (originalRequest._retry || isRefreshEndpointRequest(originalRequest)) {
      return Promise.reject(errorResponse);
    }

    const refreshToken = await getItemFromStorage('refreshToken');
    if (!refreshToken) {
      return Promise.reject(errorResponse);
    }

    originalRequest._retry = true;

    const accessToken = await refreshUserSession();
    if (!accessToken) {
      return Promise.reject(toApiErrorShape(error));
    }

    if (!originalRequest.headers) {
      originalRequest.headers = {} as InternalAxiosRequestConfig['headers'];
    }
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return api(originalRequest);
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
