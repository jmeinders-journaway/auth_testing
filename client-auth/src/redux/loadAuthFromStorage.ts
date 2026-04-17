import type { AuthState } from './authSlice';
import { getUserFromLocalStorage } from '../helpers/get-user-from-local-storage';

export function loadAuthFromStorage(): Omit<AuthState, 'isAuthenticated'> & { isAuthenticated: boolean } {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const isAuthenticatedRaw = localStorage.getItem('isAuthenticated');
  const hasValidAccessToken = accessToken != null && accessToken.trim().length > 0 && accessToken !== 'undefined';
  const hasValidRefreshToken =
    refreshToken != null && refreshToken.trim().length > 0 && refreshToken !== 'undefined';

  const storedIsAuthenticated =
    isAuthenticatedRaw === 'true' || isAuthenticatedRaw === '1' || isAuthenticatedRaw === 'yes';

  const isAuthenticated =
    storedIsAuthenticated &&
    hasValidAccessToken &&
    hasValidRefreshToken;

  return {
    isAuthenticated,
    accessToken: hasValidAccessToken ? accessToken : null,
    refreshToken: hasValidRefreshToken ? refreshToken : null,
    user: getUserFromLocalStorage(),
  };
}

