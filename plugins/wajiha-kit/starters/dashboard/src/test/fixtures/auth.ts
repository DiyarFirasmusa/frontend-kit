import { useAuthStore } from '@/store/auth-store';
import { usePermissionStore } from '@/store/permission-store';
import type {
  AccessTokenPayload,
  LoginResponse,
  RefreshResponse,
} from '@/types/auth';
import type { User } from '@/types/common';

function base64Url(value: string): string {
  return btoa(value)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}

/** Tenant id returned by the fixture login response. */
export const TEST_TENANT_ID = 'tenant-1';

/**
 * Build an unsigned JWT whose payload the app can decode with `decodeJwt`.
 * No `tenant_id` claim is set by default; pass one explicitly when a test needs it.
 */
export function makeJwt(payload: Partial<AccessTokenPayload> = {}): string {
  const header = base64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = base64Url(
    JSON.stringify({
      token_type: 'access',
      sub: 'user-1',
      roles: ['SUPERADMIN'],
      permissions: ['employee:read'],
      ...payload,
    }),
  );
  return `${header}.${body}.signature`;
}

export function makeLoginResponse(
  overrides: Partial<LoginResponse> = {},
): LoginResponse {
  return {
    access: makeJwt(),
    refresh: 'refresh-token',
    userId: 'user-1',
    tenantId: TEST_TENANT_ID,
    roles: ['SUPERADMIN'],
    permissions: ['employee:read'],
    ...overrides,
  };
}

export function makeRefreshResponse(): RefreshResponse {
  return {
    access: makeJwt(),
    refresh: 'refresh-token',
  };
}

const testUser: User = {
  id: 'user-1',
  username: 'admin',
  roles: ['SUPERADMIN'],
};

/** Put a signed-in session into the stores (for guarded components). */
export function signIn(
  options: { permissions?: string[]; roles?: string[] } = {},
): void {
  const roles = options.roles ?? ['INVENTORY_USER'];
  const permissions = options.permissions ?? ['employee:read'];

  useAuthStore.getState().setSession({
    user: { ...testUser, roles },
    accessToken: makeJwt({ roles, permissions }),
    refreshToken: 'refresh-token',
    tenantId: TEST_TENANT_ID,
  });
  usePermissionStore.getState().setPermissions({ roles, permissions });
}
