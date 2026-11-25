import { HttpResponse, http } from 'msw';
import { endpoints } from '@/constants/api';
import { type MeResponse } from '@/types/api/me';
import { type WorkspaceResponse } from '@/types/api/workspace';
import {
  type AccessTokenPayload,
  type LoginPayload,
  type LoginResponse,
  type RefreshResponse,
} from '@/types/auth';
/** Login, refresh, current user. */
import { api, authApi, ok, readJson, wait } from '../core';
import { ALL_PERMISSIONS, ROLES, TENANT_ID, newId } from '../seed/base';
import { workspace } from '../seed/misc';
import { ME_USER_ID, me } from '../seed/people';

// Auth
// ---------------------------------------------------------------------------

let currentUsername = 'admin';

function base64Url(value: string): string {
  return btoa(value)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}

/** Unsigned JWT the app decodes with `decodeJwt` (ASCII-only payload). */
function makeJwt(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AccessTokenPayload = {
    token_type: 'access',
    sub: ME_USER_ID,
    tenant_id: TENANT_ID,
    roles: ROLES,
    permissions: ALL_PERMISSIONS,
    iat: now,
    exp: now + 30 * 24 * 3600,
    jti: newId(),
  };
  const header = base64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  return `${header}.${base64Url(JSON.stringify(payload))}.mock-signature`;
}

export const authHandlers = [
  // ----- Auth (auth service base) -----
  http.post(authApi(endpoints.auth.login), async ({ request }) => {
    const body = await readJson<Partial<LoginPayload>>(request);
    currentUsername = body.username?.trim() || 'admin';
    const response: LoginResponse = {
      access: makeJwt(),
      refresh: `mock-refresh-${newId()}`,
      userId: ME_USER_ID,
      tenantId: TENANT_ID,
      roles: ROLES,
      permissions: ALL_PERMISSIONS,
    };
    return ok(response);
  }),

  http.post(authApi(endpoints.auth.refresh), async () => {
    const response: RefreshResponse = {
      access: makeJwt(),
      refresh: `mock-refresh-${newId()}`,
    };
    return ok(response);
  }),

  http.post(authApi(endpoints.auth.logout), async () => {
    await wait();
    return new HttpResponse(null, { status: 200 });
  }),

  http.post(authApi(endpoints.auth.changePassword), async () => {
    await wait();
    return new HttpResponse(null, { status: 200 });
  }),

  // ----- Current user and tenant config -----
  http.get(api(endpoints.auth.me), async () => {
    const response: MeResponse = { ...me, username: currentUsername };
    return ok(response);
  }),

  http.get(api(endpoints.workspace.detail), async () => {
    const response: WorkspaceResponse = { ...workspace };
    return ok(response);
  }),
];
