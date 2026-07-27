import apiClient from './api';
import type { SignupInput, LoginInput, User, AuthResponse } from '@workhive/shared';

export const authService = {
  async register(input: SignupInput): Promise<AuthResponse & { user: User }> {
    const response = await apiClient.post<{ success: true; data: AuthResponse & { user: User } }>(
      '/auth/register',
      input
    );
    localStorage.setItem('access_token', response.data.data.accessToken);
    return response.data.data;
  },

  async login(input: LoginInput): Promise<AuthResponse & { user: User }> {
    const response = await apiClient.post<{ success: true; data: AuthResponse & { user: User } }>(
      '/auth/login',
      input
    );
    localStorage.setItem('access_token', response.data.data.accessToken);
    return response.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('access_token');
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<{ success: true; data: { user: User } }>(
      '/auth/me'
    );
    return response.data.data.user;
  },

  async refresh(): Promise<{ accessToken: string; user: User }> {
    const response = await apiClient.post<{ success: true; data: { accessToken: string; user: User } }>(
      '/auth/refresh'
    );
    localStorage.setItem('access_token', response.data.data.accessToken);
    return response.data.data;
  },
};
