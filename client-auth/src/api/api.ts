import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050'
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    // Handle API errors in one centralized place.
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

export default api;
