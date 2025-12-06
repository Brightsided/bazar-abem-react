import { create } from 'zustand';
import { Usuario } from '@/types';
import { authService } from '@/services/authService';

interface AuthState {
  user: Usuario | null;
  isAuthenticated: boolean;
  setUser: (user: Usuario | null) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },
  
  initialize: () => {
    const user = authService.getCurrentUser();
    set({ user, isAuthenticated: !!user });
  },
}));
