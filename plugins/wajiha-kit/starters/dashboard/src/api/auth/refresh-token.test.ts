import { HttpResponse, http } from 'msw';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';
import { refreshAccessToken } from '@/api/auth/refresh-token';
import { endpoints } from '@/constants/api';
import { decodeJwt } from '@/lib/jwt';
import { useAuthStore } from '@/store/auth-store';
import { usePermissionStore } from '@/store/permission-store';
import { makeJwt } from '@/test/fixtures/auth';
import { authApi } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import type { AccessTokenPayload } from '@/types/auth';

function signInWithRefreshToken(tenantId = 'tenant-1') {
  useAuthStore.getState().setSession({
    user: {
      id: 'user-1',
      username: 'admin',
      roles: [],
    },
    accessToken: makeJwt(),
    refreshToken: 'stale-refresh-token',
    tenantId,
  });
}

describe('refreshAccessToken', () => {
  it('single-flights concurrent calls into exactly one network request and re-derives permissions from the new JWT', async () => {
    signInWithRefreshToken();
    let calls = 0;
    const newAccessToken = makeJwt({
      roles: ['HR_MANAGER'],
      permissions: ['employee:write'],
    });
    server.use(
      http.post(authApi(endpoints.auth.refresh), () => {
        calls += 1;
        return HttpResponse.json({
          access: newAccessToken,
          refresh: 'new-refresh-token',
        });
      }),
    );

    const [first, second] = await Promise.all([
      refreshAccessToken(),
      refreshAccessToken(),
    ]);

    expect(calls).toBe(1);
    expect(first).toBe(newAccessToken);
    expect(second).toBe(newAccessToken);
    expect(useAuthStore.getState().accessToken).toBe(newAccessToken);
    expect(useAuthStore.getState().refreshToken).toBe('new-refresh-token');
    expect(usePermissionStore.getState().roles).toEqual(['HR_MANAGER']);
    expect(usePermissionStore.getState().permissions).toEqual([
      'employee:write',
    ]);
  });

  it('stores the tenant_id claim from the refreshed JWT as the session tenant', async () => {
    signInWithRefreshToken();
    const newAccessToken = makeJwt({ tenant_id: 'tenant-9' });
    server.use(
      http.post(authApi(endpoints.auth.refresh), () =>
        HttpResponse.json({ access: newAccessToken, refresh: 'rotated' }),
      ),
    );

    await refreshAccessToken();

    expect(useAuthStore.getState().tenantId).toBe('tenant-9');
  });

  it('keeps the existing session tenant when the refreshed JWT has no tenant_id claim', async () => {
    signInWithRefreshToken('tenant-keep');
    const access = makeJwt();
    expect(decodeJwt<AccessTokenPayload>(access)?.tenant_id).toBeUndefined();
    server.use(
      http.post(authApi(endpoints.auth.refresh), () =>
        HttpResponse.json({ access, refresh: 'rotated' }),
      ),
    );

    await refreshAccessToken();

    expect(useAuthStore.getState().tenantId).toBe('tenant-keep');
  });

  it('does not let an older refresh that settles late clear the newer in-flight refresh', async () => {
    signInWithRefreshToken();
    const resolvers: Array<() => void> = [];
    let calls = 0;
    const newerAccess = makeJwt({
      roles: ['NEWER_ROLE'],
      permissions: ['newer:read'],
    });
    server.use(
      http.post(authApi(endpoints.auth.refresh), async () => {
        calls += 1;
        await new Promise<void>((resolve) => {
          resolvers.push(resolve);
        });
        return HttpResponse.json({
          access: calls === 1 ? makeJwt() : newerAccess,
          refresh: `refresh-${calls}`,
        });
      }),
    );

    const first = refreshAccessToken();
    await vi.waitUntil(() => resolvers.length === 1);

    useAuthStore.getState().clear();
    useAuthStore.getState().setSession({
      user: { id: 'user-2', username: 'user-2', roles: [] },
      accessToken: makeJwt(),
      refreshToken: 'session-2-refresh',
      tenantId: 'tenant-2',
    });
    const second = refreshAccessToken();
    await vi.waitUntil(() => resolvers.length === 2);

    resolvers[0]!();
    await expect(first).resolves.toBeNull();

    const third = refreshAccessToken();
    expect(third).toBe(second);
    expect(calls).toBe(2);

    resolvers[1]!();
    await expect(second).resolves.toBe(newerAccess);
    await expect(third).resolves.toBe(newerAccess);
    expect(calls).toBe(2);
    expect(useAuthStore.getState().refreshToken).toBe('refresh-2');
  });

  it('resolves null and does not toast when the IAM rejects the refresh token (401)', async () => {
    signInWithRefreshToken();
    const errorToast = vi.spyOn(toast, 'error');
    server.use(
      http.post(authApi(endpoints.auth.refresh), () =>
        HttpResponse.json(
          { message: 'Refresh token is revoked' },
          { status: 401 },
        ),
      ),
    );

    const result = await refreshAccessToken();

    expect(result).toBeNull();
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('resolves null and leaves the stored tokens untouched on a 5xx from the IAM', async () => {
    signInWithRefreshToken();
    const errorToast = vi.spyOn(toast, 'error');
    const accessBefore = useAuthStore.getState().accessToken;
    server.use(
      http.post(authApi(endpoints.auth.refresh), () =>
        HttpResponse.json({ message: 'upstream down' }, { status: 500 }),
      ),
    );

    await expect(refreshAccessToken()).resolves.toBeNull();

    expect(useAuthStore.getState().accessToken).toBe(accessBefore);
    expect(useAuthStore.getState().refreshToken).toBe('stale-refresh-token');
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('resolves null and leaves the stored tokens untouched on a network failure', async () => {
    signInWithRefreshToken();
    const accessBefore = useAuthStore.getState().accessToken;
    server.use(
      http.post(authApi(endpoints.auth.refresh), () => HttpResponse.error()),
    );

    await expect(refreshAccessToken()).resolves.toBeNull();

    expect(useAuthStore.getState().accessToken).toBe(accessBefore);
    expect(useAuthStore.getState().refreshToken).toBe('stale-refresh-token');
  });

  it('resolves null without a network call when there is no refresh token', async () => {
    let calls = 0;
    server.use(
      http.post(authApi(endpoints.auth.refresh), () => {
        calls += 1;
        return HttpResponse.json({ access: makeJwt(), refresh: 'x' });
      }),
    );

    const result = await refreshAccessToken();

    expect(result).toBeNull();
    expect(calls).toBe(0);
  });

  it('discards a refresh that resolves after logout instead of reviving the session', async () => {
    signInWithRefreshToken();
    let resolveRefresh: (() => void) | null = null;
    server.use(
      http.post(authApi(endpoints.auth.refresh), async () => {
        await new Promise<void>((resolve) => {
          resolveRefresh = resolve;
        });
        return HttpResponse.json({
          access: makeJwt(),
          refresh: 'refresh-that-arrives-too-late',
        });
      }),
    );

    const pending = refreshAccessToken();
    await vi.waitUntil(() => resolveRefresh !== null);

    useAuthStore.getState().clear();
    resolveRefresh!();
    const result = await pending;

    expect(result).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().refreshToken).toBeNull();
  });

  it('discards a refresh that resolves after a different account logs in', async () => {
    signInWithRefreshToken();
    let resolveRefresh: (() => void) | null = null;
    const staleAccess = makeJwt({
      roles: ['USER_A_ROLE'],
      permissions: ['user-a:read'],
    });
    server.use(
      http.post(authApi(endpoints.auth.refresh), async () => {
        await new Promise<void>((resolve) => {
          resolveRefresh = resolve;
        });
        return HttpResponse.json({
          access: staleAccess,
          refresh: 'user-a-refresh-too-late',
        });
      }),
    );

    const pending = refreshAccessToken();
    await vi.waitUntil(() => resolveRefresh !== null);

    const userBAccess = makeJwt({
      roles: ['USER_B_ROLE'],
      permissions: ['user-b:read'],
    });
    useAuthStore.getState().setSession({
      user: {
        id: 'user-b',
        username: 'user-b',
        roles: [],
      },
      accessToken: userBAccess,
      refreshToken: 'user-b-refresh-token',
      tenantId: 'tenant-2',
    });
    usePermissionStore.getState().setPermissions({
      roles: ['USER_B_ROLE'],
      permissions: ['user-b:read'],
    });
    resolveRefresh!();
    const result = await pending;

    expect(result).toBeNull();
    expect(useAuthStore.getState().accessToken).toBe(userBAccess);
    expect(useAuthStore.getState().refreshToken).toBe('user-b-refresh-token');
    expect(usePermissionStore.getState().permissions).toEqual(['user-b:read']);
  });
});
