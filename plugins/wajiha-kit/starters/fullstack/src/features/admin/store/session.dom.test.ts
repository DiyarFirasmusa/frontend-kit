import { describe, expect, it } from 'vitest';
import { SUPER_ROLE } from '../constants/permissions';
import type { LoginResponse } from '../types/api';
import { useAuthStore } from './auth-store';
import { usePermissionStore } from './permission-store';
import { endSession, startSession } from './session';

const LOGIN: LoginResponse = {
  accessToken: 'token-1',
  user: { id: 'u1', username: 'sara', name: 'Sara' },
  roles: [SUPER_ROLE],
  permissions: ['supplier:read'],
};

describe('the admin session', () => {
  it('startSession stores the user, the token and the rights together', () => {
    startSession(LOGIN);
    expect(useAuthStore.getState()).toMatchObject({ user: LOGIN.user, accessToken: 'token-1' });
    expect(usePermissionStore.getState()).toMatchObject({
      roles: [SUPER_ROLE],
      permissions: ['supplier:read'],
    });
  });

  it('endSession forgets all of it, the rights too', () => {
    startSession(LOGIN);
    endSession();
    expect(useAuthStore.getState()).toMatchObject({ user: null, accessToken: null });
    expect(usePermissionStore.getState()).toMatchObject({ roles: [], permissions: [] });
  });

  it('sets the rights before anything reacting to the new user can look at them', () => {
    const seen: string[][] = [];
    const stop = useAuthStore.subscribe((state) => {
      if (state.user !== null) {
        seen.push(usePermissionStore.getState().permissions);
      }
    });
    startSession(LOGIN);
    stop();
    expect(seen).toEqual([['supplier:read']]);
  });

  it('persists both stores under a version, so a changed shape drops old tabs instead of mixing', () => {
    startSession(LOGIN);
    const auth: unknown = JSON.parse(window.sessionStorage.getItem('admin-auth') ?? '{}');
    const rights: unknown = JSON.parse(window.sessionStorage.getItem('admin-permissions') ?? '{}');
    expect(auth).toMatchObject({ version: 1 });
    expect(rights).toMatchObject({ version: 1 });
  });
});
