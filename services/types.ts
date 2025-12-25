export interface ApiResponse<T>{
  error?: string;
  data?: T;
  message?: string;
}

