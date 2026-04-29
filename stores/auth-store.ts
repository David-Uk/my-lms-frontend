'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { decodeToken, setToken, removeToken, isTokenExpired } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  checkAuth: () => boolean;
  getUserRole: () => UserRole | null;
  hasRole: (roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: (token: string, user: User) => {
        setToken(token);
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: async () => {
        await removeToken();
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: (user: User) => {
        set({ user });
      },

      checkAuth: () => {
        const { token } = get();
        if (!token) return false;

        if (isTokenExpired(token)) {
          get().logout();
          return false;
        }

        return true;
      },

      getUserRole: () => {
        const { token } = get();
        if (!token) return null;

        const decoded = decodeToken(token);
        return decoded?.role || null;
      },

      hasRole: (roles: UserRole[]) => {
        const userRole = get().getUserRole();
        if (!userRole) return false;
        return roles.includes(userRole);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
          if (state.token && isTokenExpired(state.token)) {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            removeToken();
          }
        }
      },
    }
  )
);

// Auth hooks
export function useAuth() {
  return useAuthStore();
}

export function useUserRole(): UserRole | null {
  return useAuthStore((state) => state.getUserRole());
}

export function useIsAdmin(): boolean {
  return useAuthStore((state) => {
    const role = state.getUserRole();
    return role === 'admin' || role === 'superadmin';
  });
}

export function useIsSuperAdmin(): boolean {
  return useAuthStore((state) => state.getUserRole() === 'superadmin');
}

export function useIsTutor(): boolean {
  return useAuthStore((state) => {
    const role = state.getUserRole();
    return role === 'tutor' || role === 'admin' || role === 'superadmin';
  });
}

export function useIsLearner(): boolean {
  return useAuthStore((state) => state.getUserRole() === 'learner');
}

export function useCanManageUsers(): boolean {
  return useAuthStore((state) => {
    const role = state.getUserRole();
    return role === 'admin' || role === 'superadmin';
  });
}

export function useCanManageCourses(): boolean {
  return useAuthStore((state) => {
    const role = state.getUserRole();
    return role === 'admin' || role === 'superadmin';
  });
}
