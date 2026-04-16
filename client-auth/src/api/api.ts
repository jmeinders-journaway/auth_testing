import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050'
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Request interceptor runs before every API request is sent.
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // Response interceptor can transform or normalize successful responses.
    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    // Centralized error handling for all API calls.
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

export default api;
