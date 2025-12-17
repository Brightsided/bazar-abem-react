import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Usuario } from '@/types';
import { authService } from '@/services/authService';

interface AuthState {
  user: Usuario | null;
  isAuthenticated: boolean;
  token: string | null;
  setUser: (user: Usuario | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => set({ token }),
      
      logout: () => {
        authService.logout();
        set({ user: null, isAuthenticated: false, token: null });
      },
      
      initialize: () => {
        const user = authService.getCurrentUser();
        const token = localStorage.getItem('token');
        set({ user, isAuthenticated: !!user, token });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
);
