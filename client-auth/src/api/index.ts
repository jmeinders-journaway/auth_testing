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

const apiLayer = {
  async signIn(payload: SignInPayload): Promise<SignInResponse | null> {
    try {
      const response = await api.post<SignInResponse>('/api/v1/auth/sign-in', payload);
      return response.data;
    } catch {
      return null;
    }
  }
};

export default apiLayer;
