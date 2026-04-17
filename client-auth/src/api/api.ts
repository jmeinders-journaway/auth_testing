import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import { clearAuth } from '../redux/authSlice';
import { store } from '../redux/store';

//creates Axios instance (library for making http request)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050'
});
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050'
});

const PUBLIC_AUTH_ROUTES = ['/api/v1/auth/sign-in', '/api/v1/auth/signup', '/api/v1/auth/refresh-token'];
const PUBLIC_CLIENT_PATHS = ['/sign-in', '/sign-up'];
const TOKEN_EXPIRED_CODE = 'TOKEN_EXPIRED';

interface ErrorResponse {
  code?: string;
  message?: string;
}

interface RefreshTokenResponse {
  data: {
    accessToken: string;
  };
}

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

function clearLocalAuthStorage() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('isAuthenticated');
}

function redirectToSignIn() {
  clearLocalAuthStorage();
  store.dispatch(clearAuth());
  import('../main').then(({ router }) => router.navigate('/sign-in'));
}

/**
 * REQUEST INTERCEPTOR
 *
 * Runs BEFORE every API request is sent to the server
 *
 * Responsibilities:
 * 1. Determine if the request needs authentication
 * 2. Skip token attachment for public routes
 * 3. Attach JWT token to Authorization header for protected routes
 *
 * Flow:
 * - Check if it's a public backend route OR public client page
 * - If yes → send request without token
 * - If no → get token from localStorage and add as Bearer token
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const requestUrl = config.url || '';
    const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some((route) => requestUrl.includes(route));
    const currentPathName = window.location.pathname;
    const isPublicClientPath = PUBLIC_CLIENT_PATHS.includes(currentPathName);
    if (isPublicAuthRoute || isPublicClientPath) {
      return config;
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
/**
 * RESPONSE INTERCEPTOR
 *
 * Runs AFTER every API response is received from the server
 *
 * Responsibilities:
 * 1. Extract data from successful responses
 * 2. Handle authentication errors (401 Unauthorized)
 * 3. Display user-friendly error messages
 * 4. Automatically redirect to login when token expires
 */
api.interceptors.response.use(
    //SUCCESS CASE
  (response) => {
    return response.data;
  },
    /**
     * ERROR CASE 1: Authentication Error (401 Unauthorized)
     *
     * Triggers when:
     * - JWT token has expired (1 hour lifetime)
     * - Token is malformed or invalid
     * - User logged out on another device
     *
     * Automatic recovery flow:
     * 1. Clear all auth data from localStorage
     * 2. Clear Redux auth state
     * 3. Redirect to sign-in page
     * 4. User must re-authenticate
     *
     * Note: No toast error shown to avoid confusion
     * (silent redirect is better UX)
     */
  async (error: AxiosError<ErrorResponse>) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.code;
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;

    if (
      status === 401 &&
      errorCode === TOKEN_EXPIRED_CODE &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        redirectToSignIn();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await refreshClient.post<RefreshTokenResponse>(
          '/api/v1/auth/refresh-token',
          {refreshToken}
        );

        const newAccessToken = refreshResponse.data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        redirectToSignIn();
        return Promise.reject(refreshError);
      }
    }

    if (status === 401) {
      redirectToSignIn();
      return Promise.reject(error);
    }
      /**
       * ERROR CASE 2: Other HTTP Errors (400, 403, 404, 500, etc.)
       *
       * Extract error message from response if available
       * Fallback to generic message if no specific message
       * Display toast notification for user feedback
       */
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

export default api;
