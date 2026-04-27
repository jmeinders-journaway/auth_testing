import api from './api';
import type { IUser } from '../types/user';

export interface SignInPayload {
  email: string;
  password: string;
}

export interface AuthSuccessResponse {
  message: string;
  data: {
    accessToken: string;
    user: IUser;
  };
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateProfilePayload {
  name: string;
}

interface ProtectedResponse {
  message: string;
}

interface UpdateProfileResponse {
  message: string;
  data: {
    user: IUser;
  };
}

interface RefreshTokenResponse {
  message: string;
  data: {
    accessToken: string;
    user: IUser;
  };
}

interface LogoutResponse {
  message: string;
}

interface ForgotPasswordResponse {
  message: string;
  data: {
    message: string;
  };
}

interface ResetPasswordResponse {
  message: string;
}

const apiLayer = {
  async signIn(payload: SignInPayload): Promise<AuthSuccessResponse | null> {
    try {
      const response = await api.post<AuthSuccessResponse>('/api/v1/auth/sign-in', payload);
      return response as unknown as AuthSuccessResponse;
    } catch {
      return null;
    }
  },
  async signUp(payload: SignUpPayload): Promise<AuthSuccessResponse | null> {
    try {
      const response = await api.post<AuthSuccessResponse>('/api/v1/auth/signup', payload);
      return response as unknown as AuthSuccessResponse;
    } catch {
      return null;
    }
  },
  async getProtected(): Promise<ProtectedResponse | null> {
    try {
      const response = await api.get<ProtectedResponse>('/api/v1/auth/protected');
      return response as unknown as ProtectedResponse;
    } catch {
      return null;
    }
  },
  async refreshToken(): Promise<RefreshTokenResponse | null> {
    try {
      const response = await api.post<RefreshTokenResponse>('/api/v1/auth/refresh-token');
      return response as unknown as RefreshTokenResponse;
    } catch {
      return null;
    }
  },
  async logout(): Promise<LogoutResponse | null> {
    try {
      const response = await api.post<LogoutResponse>('/api/v1/auth/logout');
      return response as unknown as LogoutResponse;
    } catch {
      return null;
    }
  },
  async updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse | null> {
    try {
      const response = await api.patch<UpdateProfileResponse>('/api/v1/auth/me', payload);
      return response as unknown as UpdateProfileResponse;
    } catch {
      return null;
    }
  },
  async forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse | null> {
    try {
      const response = await api.post<ForgotPasswordResponse>('/api/v1/auth/forgot-password', payload);
      return response as unknown as ForgotPasswordResponse;
    } catch {
      return null;
    }
  },
  async resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse | null> {
    try {
      const response = await api.post<ResetPasswordResponse>('/api/v1/auth/reset-password', payload);
      return response as unknown as ResetPasswordResponse;
    } catch {
      return null;
    }
  }
};

export default apiLayer;
