import { configureStore } from '@reduxjs/toolkit';
import authReducer, { initialAuthState } from './authSlice';
import { loadAuthFromStorage } from './loadAuthFromStorage';

const preloadedAuth = {
  ...initialAuthState,
  ...loadAuthFromStorage(),
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: preloadedAuth,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

