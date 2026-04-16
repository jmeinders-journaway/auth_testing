import api from './api';

export interface SignInPayload {
  email: string;
  password: string;
}

interface SignInResponse {
  message: string;
  data: {
    accessToken: string;
    user: Record<string, unknown>;
  };
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

interface SignUpResponse {
  message: string;
  data: {
    accessToken: string;
    user: Record<string, unknown>;
  };
}

interface ProtectedResponse {
  message: string;
  data: Record<string, unknown>;
}

const apiLayer = {
  async signIn(payload: SignInPayload): Promise<SignInResponse | null> {
    try {
      const response = await api.post<SignInResponse>('/api/v1/auth/sign-in', payload);
      return response.data;
    } catch {
      return null;
    }
  },
  async signUp(payload: SignUpPayload): Promise<SignUpResponse | null> {
    try {
      const response = await api.post<SignUpResponse>('/api/v1/auth/signup', payload);
      return response.data;
    } catch {
      return null;
    }
  },
  async getProtected(): Promise<ProtectedResponse | null> {
    try {
      const response = await api.get<ProtectedResponse>('/api/v1/auth/protected');
      return response.data;
    } catch {
      return null;
    }
  }
};

export default apiLayer;
