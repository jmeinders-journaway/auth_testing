import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { emptyUser, type IUser } from '../types/user';

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: IUser;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  user: emptyUser,
};

function pickString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeUser(
  rawUser: Partial<IUser> & {
    avatar?: string | null;
    type?: string | null;
  },
): IUser {
  const name = pickString(rawUser.name);
  const email = pickString(rawUser.email);
  const avatarUrl = pickString(rawUser.avatarUrl) ?? pickString(rawUser.avatar);
  const userType = pickString(rawUser.userType) ?? pickString(rawUser.type);

  return {
    name: name ?? emptyUser.name,
    email: email ?? emptyUser.email,
    avatarUrl: avatarUrl ?? emptyUser.avatarUrl,
    userType: userType ?? emptyUser.userType,
  };
}

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setAuth(
      state,
      action: PayloadAction<{
        accessToken: string;
        user: IUser;
      }>,
    ) {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.user = normalizeUser(action.payload.user ?? {});
    },
    clearAuth(state) {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = emptyUser;
    },
    setUser(state, action: PayloadAction<Partial<IUser>>) {
      // Allows updating only parts of the profile later (optional usage).
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { setAuth, clearAuth, setUser } = authSlice.actions;
export default authSlice.reducer;

