import { describe, expect, it } from 'vitest';
import { useAuthStore } from '@/store/auth-store';
import { usePermissionStore } from '@/store/permission-store';
import type { User } from '@/types/common';

const user: User = {
  id: 'user-1',
  username: 'admin',
  roles: ['SUPERADMIN'],
};

describe('useAuthStore', () => {
  it('setSession stores the user, access token and refresh token', () => {
    useAuthStore.getState().setSession({
      user,
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      tenantId: 'tenant-1',
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.accessToken).toBe('access-1');
    expect(state.refreshToken).toBe('refresh-1');
    expect(state.tenantId).toBe('tenant-1');
  });

  it('setUser updates only the user', () => {
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('setTokens updates only the tokens, leaving the user untouched', () => {
    useAuthStore.getState().setSession({
      user,
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      tenantId: 'tenant-1',
    });
    useAuthStore.getState().setTokens('access-2', 'refresh-2');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.accessToken).toBe('access-2');
    expect(state.refreshToken).toBe('refresh-2');
  });

  it('setTenantId updates only the tenant', () => {
    useAuthStore.getState().setSession({
      user,
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      tenantId: 'tenant-1',
    });
    useAuthStore.getState().setTenantId('tenant-2');

    const state = useAuthStore.getState();
    expect(state.tenantId).toBe('tenant-2');
    expect(state.accessToken).toBe('access-1');
  });

  it('clear() resets tenantId along with the rest of the session', () => {
    useAuthStore.getState().setSession({
      user,
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      tenantId: 'tenant-1',
    });

    useAuthStore.getState().clear();

    expect(useAuthStore.getState().tenantId).toBeNull();
  });

  it('clear() resets the auth state and cross-clears the permission store', () => {
    useAuthStore.getState().setSession({
      user,
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      tenantId: 'tenant-1',
    });
    usePermissionStore.getState().setPermissions({
      roles: ['SUPERADMIN'],
      permissions: ['employee:read'],
    });

    useAuthStore.getState().clear();

    const authState = useAuthStore.getState();
    expect(authState.user).toBeNull();
    expect(authState.accessToken).toBeNull();
    expect(authState.refreshToken).toBeNull();

    const permissionState = usePermissionStore.getState();
    expect(permissionState.roles).toEqual([]);
    expect(permissionState.permissions).toEqual([]);
  });

  it('bumps sessionId on every setSession and clear() so stale async work can detect it', () => {
    const initial = useAuthStore.getState().sessionId;

    useAuthStore.getState().setSession({
      user,
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      tenantId: 'tenant-1',
    });
    const afterLogin = useAuthStore.getState().sessionId;
    expect(afterLogin).toBe(initial + 1);

    useAuthStore.getState().clear();
    expect(useAuthStore.getState().sessionId).toBe(afterLogin + 1);

    useAuthStore.getState().setTokens('access-2', 'refresh-2');
    expect(useAuthStore.getState().sessionId).toBe(afterLogin + 1);
  });
});
