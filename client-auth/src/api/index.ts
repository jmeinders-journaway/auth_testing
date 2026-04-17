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


interface ProtectedResponse {
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
  }
};

export default apiLayer;
