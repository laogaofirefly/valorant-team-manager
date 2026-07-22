// 认证状态管理

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, User, ApiError } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, nickname?: string) => Promise<void>;
  logout: () => void;
  verify: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.login({ username, password });
          localStorage.setItem('vct_token', data.token);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof ApiError ? error.message : '登录失败';
          set({ isLoading: false, error: message, isAuthenticated: false });
          throw error;
        }
      },

      register: async (username, email, password, nickname) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.register({ username, email, password, nickname });
          localStorage.setItem('vct_token', data.token);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof ApiError ? error.message : '注册失败';
          set({ isLoading: false, error: message, isAuthenticated: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('vct_token');
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      verify: async () => {
        const token = get().token;
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }
        try {
          const data = await authApi.verify();
          set({ user: data.user, isAuthenticated: true });
        } catch {
          localStorage.removeItem('vct_token');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'vct-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
