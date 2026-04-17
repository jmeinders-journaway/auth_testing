import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import { clearAuth } from '../redux/authSlice';
import { store } from '../redux/store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050'
});

const PUBLIC_AUTH_ROUTES = ['/api/v1/auth/sign-in', '/api/v1/auth/signup'];
const PUBLIC_CLIENT_PATHS = ['/sign-in', '/sign-up'];

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Request interceptor runs before every API request is sent.
    // Skip attaching token for public auth routes.
    const requestUrl = config.url || '';
    const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some((route) => requestUrl.includes(route));
    // location.pathname is a browser global that tells us current client route.
    const currentPathName = window.location.pathname;
    const isPublicClientPath = PUBLIC_CLIENT_PATHS.includes(currentPathName);
    if (isPublicAuthRoute || isPublicClientPath) {
      return config;
    }

    // Attach bearer token to protected requests only.
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
    return response.data;
  },
  (error: AxiosError<{ message?: string }>) => {
    if (error.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      store.dispatch(clearAuth());
      import('../main').then(({ router }) => router.navigate('/sign-in'));
      return Promise.reject(error);
    }
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

export default api;
