'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUserRole } from '@/stores/auth-store';
import { UserRole } from '@/types';

export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isAuthenticated, isLoading };
}

export function useRequireRole(allowedRoles: UserRole[], redirectTo: string = '/dashboard') {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();
  const hasAllowedRole = hasRole(allowedRoles);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!hasAllowedRole) {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, hasAllowedRole, redirectTo, router]);

  return { isAuthenticated, isLoading, hasAllowedRole };
}

export function useRedirectIfAuth(redirectTo: string = '/dashboard') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isAuthenticated, isLoading };
}

export function useRoleDashboard(): string {
  const role = useUserRole();

  switch (role) {
    case 'superadmin':
      return '/superadmin/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'tutor':
      return '/tutor/dashboard';
    case 'learner':
      return '/learner/dashboard';
    default:
      return '/login';
  }
}
