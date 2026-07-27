import { create } from 'zustand';
import type { User, Role } from '@workhive/shared';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setToken: (token) => set({ token }),

  login: async (email, password) => {
    const result = await authService.login({ email, password });
    set({ user: result.user, token: result.accessToken, isAuthenticated: true, isLoading: false });
  },

  register: async (data) => {
    const result = await authService.register(data);
    set({ user: result.user, token: result.accessToken, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    try {
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
