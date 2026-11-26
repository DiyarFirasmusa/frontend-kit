import type { LoginResponse } from '../types/api';
import { useAuthStore } from './auth-store';
import { usePermissionStore } from './permission-store';

/**
 * The admin session is two persisted stores that always change together: who is signed in with the token
 * (auth-store) and what they may do (permission-store). These two functions are the ONLY writers; call
 * them instead of either store's setters, so the halves can never disagree.
 */

/** Stores a login answer: the rights first, then the user, so anything reacting to the user sees both. */
export function startSession(response: LoginResponse): void {
  usePermissionStore.getState().setPermissions({
    roles: response.roles,
    permissions: response.permissions,
  });
  useAuthStore.getState().setSession({ user: response.user, accessToken: response.accessToken });
}

/** Forgets the user, the token and the rights (auth-store clears the permission store too). */
export function endSession(): void {
  useAuthStore.getState().clear();
}
