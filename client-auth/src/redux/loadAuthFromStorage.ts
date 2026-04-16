import type { AuthState } from './authSlice';
import { getUserFromLocalStorage } from '../helpers/get-user-from-local-storage';

export function loadAuthFromStorage(): Omit<AuthState, 'isAuthenticated'> & { isAuthenticated: boolean } {
  const accessToken = localStorage.getItem('accessToken');
  const isAuthenticatedRaw = localStorage.getItem('isAuthenticated');

  const storedIsAuthenticated =
    isAuthenticatedRaw === 'true' || isAuthenticatedRaw === '1' || isAuthenticatedRaw === 'yes';

  const isAuthenticated =
    storedIsAuthenticated && accessToken != null && accessToken.trim().length > 0;

  return {
    isAuthenticated,
    accessToken: accessToken ?? null,
    user: getUserFromLocalStorage(),
  };
}

