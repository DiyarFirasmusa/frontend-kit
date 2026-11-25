import { redirect } from '@tanstack/react-router';
import type { Permission } from '@/constants/permissions';
import { useAuthStore } from '@/store/auth-store';
import { hasPermission } from '@/store/permission-store';

export function requireAuth() {
  const { accessToken, user } = useAuthStore.getState();
  if (!accessToken || !user) {
    throw redirect({ to: '/login' });
  }
}

export function getHomePath(): '/' {
  return '/';
}

export function requireGuest() {
  if (useAuthStore.getState().accessToken) {
    throw redirect({ to: getHomePath() });
  }
}

export function requirePermission(permission: Permission) {
  requireAuth();
  if (!hasPermission(permission)) {
    throw redirect({ to: '/403' });
  }
}
