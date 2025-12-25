import api from './axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from './types';
import { getItemFromStorage } from './asyncStorage';

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    // You can modify the config before the request is sent
    const token = await getItemFromStorage('token'); // Example: Add auth token
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
  (error) => {
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
