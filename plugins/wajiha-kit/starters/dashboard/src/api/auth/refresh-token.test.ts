import { HttpResponse, http } from 'msw';
import { toast } from 'sonner';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  adoptRefreshedTokens,
  refreshAccessToken,
} from '@/api/auth/refresh-token';
import { endpoints } from '@/constants/api';
import { env } from '@/env';
import { decodeJwt } from '@/lib/jwt';
import { useAuthStore } from '@/store/auth-store';
import { usePermissionStore } from '@/store/permission-store';
import { deferred } from '@/test/deferred';
import { makeJwt } from '@/test/fixtures/auth';
import { authApi } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import type { AccessTokenPayload } from '@/types/auth';
import {
  startSessionSync,
  stopSessionSync,
  type SessionMessage,
} from './session-sync';

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

function respondWithStatus(status: number) {
  server.use(
    http.post(authApi(endpoints.auth.refresh), () =>
      HttpResponse.json({ message: 'refresh failed' }, { status }),
    ),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  stopSessionSync();
  env.VITE_AUTH_REFRESH = 'session';
});

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
    expect(first).toEqual({ status: 'ok', token: newAccessToken });
    expect(second).toEqual({ status: 'ok', token: newAccessToken });
    expect(useAuthStore.getState().accessToken).toBe(newAccessToken);
    expect(useAuthStore.getState().refreshToken).toBe('new-refresh-token');
    expect(usePermissionStore.getState().roles).toEqual(['HR_MANAGER']);
    expect(usePermissionStore.getState().permissions).toEqual([
      'employee:write',
    ]);
  });

  it('keeps the current permissions when the refreshed token has no permission claims', async () => {
    signInWithRefreshToken();
    usePermissionStore.getState().setPermissions({
      roles: ['CLERK'],
      permissions: ['warehouse:read'],
    });
    const access = makeJwt({ roles: undefined, permissions: undefined });
    expect(decodeJwt<AccessTokenPayload>(access)?.permissions).toBeUndefined();
    server.use(
      http.post(authApi(endpoints.auth.refresh), () =>
        HttpResponse.json({ access, refresh: 'rotated' }),
      ),
    );

    await expect(refreshAccessToken()).resolves.toEqual({
      status: 'ok',
      token: access,
    });

    expect(usePermissionStore.getState().roles).toEqual(['CLERK']);
    expect(usePermissionStore.getState().permissions).toEqual([
      'warehouse:read',
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

  it('returns the newer token without a request when the failed request carried an older one', async () => {
    signInWithRefreshToken();
    const current = useAuthStore.getState().accessToken;
    let calls = 0;
    server.use(
      http.post(authApi(endpoints.auth.refresh), () => {
        calls += 1;
        return HttpResponse.json({ access: makeJwt(), refresh: 'x' });
      }),
    );

    await expect(refreshAccessToken('an-older-token')).resolves.toEqual({
      status: 'ok',
      token: current,
    });
    expect(calls).toBe(0);
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
    await expect(first).resolves.toEqual({ status: 'unavailable' });

    const third = refreshAccessToken();
    expect(third).toBe(second);
    expect(calls).toBe(2);

    resolvers[1]!();
    await expect(second).resolves.toEqual({ status: 'ok', token: newerAccess });
    await expect(third).resolves.toEqual({ status: 'ok', token: newerAccess });
    expect(calls).toBe(2);
    expect(useAuthStore.getState().refreshToken).toBe('refresh-2');
  });

  it.each([400, 401, 403])(
    'is rejected without a toast when the refresh endpoint answers %i',
    async (status) => {
      signInWithRefreshToken();
      const errorToast = vi.spyOn(toast, 'error');
      respondWithStatus(status);

      await expect(refreshAccessToken()).resolves.toEqual({
        status: 'rejected',
      });
      expect(errorToast).not.toHaveBeenCalled();
    },
  );

  it.each([500, 502, 503])(
    'is unavailable and leaves the stored tokens untouched on a %i',
    async (status) => {
      signInWithRefreshToken();
      const errorToast = vi.spyOn(toast, 'error');
      const accessBefore = useAuthStore.getState().accessToken;
      respondWithStatus(status);

      await expect(refreshAccessToken()).resolves.toEqual({
        status: 'unavailable',
      });
      expect(useAuthStore.getState().accessToken).toBe(accessBefore);
      expect(useAuthStore.getState().refreshToken).toBe('stale-refresh-token');
      expect(errorToast).not.toHaveBeenCalled();
    },
  );

  it('is unavailable and leaves the stored tokens untouched on a network failure', async () => {
    signInWithRefreshToken();
    const accessBefore = useAuthStore.getState().accessToken;
    server.use(
      http.post(authApi(endpoints.auth.refresh), () => HttpResponse.error()),
    );

    await expect(refreshAccessToken()).resolves.toEqual({
      status: 'unavailable',
    });
    expect(useAuthStore.getState().accessToken).toBe(accessBefore);
    expect(useAuthStore.getState().refreshToken).toBe('stale-refresh-token');
  });

  it('is rejected without a network call when there is no refresh token', async () => {
    let calls = 0;
    server.use(
      http.post(authApi(endpoints.auth.refresh), () => {
        calls += 1;
        return HttpResponse.json({ access: makeJwt(), refresh: 'x' });
      }),
    );

    await expect(refreshAccessToken()).resolves.toEqual({
      status: 'rejected',
    });
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

    expect(result).toEqual({ status: 'unavailable' });
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().refreshToken).toBeNull();
  });

  it('discards a refresh that resolves after a different account logs in', async () => {
    signInWithRefreshToken();
    let resolveRefresh: (() => void) | null = null;
    server.use(
      http.post(authApi(endpoints.auth.refresh), async () => {
        await new Promise<void>((resolve) => {
          resolveRefresh = resolve;
        });
        return HttpResponse.json({
          access: makeJwt({
            roles: ['USER_A_ROLE'],
            permissions: ['user-a:read'],
          }),
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
      user: { id: 'user-b', username: 'user-b', roles: [] },
      accessToken: userBAccess,
      refreshToken: 'user-b-refresh-token',
      tenantId: 'tenant-2',
    });
    usePermissionStore.getState().setPermissions({
      roles: ['USER_B_ROLE'],
      permissions: ['user-b:read'],
    });
    resolveRefresh!();

    expect(await pending).toEqual({ status: 'unavailable' });
    expect(useAuthStore.getState().accessToken).toBe(userBAccess);
    expect(useAuthStore.getState().refreshToken).toBe('user-b-refresh-token');
    expect(usePermissionStore.getState().permissions).toEqual(['user-b:read']);
  });
});

describe('refresh across tabs', () => {
  it('reuses the token another tab got while this one waited for the lock', async () => {
    signInWithRefreshToken();
    const lock = deferred();
    vi.stubGlobal('navigator', {
      ...navigator,
      locks: {
        request: async (_name: string, task: () => Promise<unknown>) => {
          await lock.promise;
          return task();
        },
      },
    });
    let calls = 0;
    server.use(
      http.post(authApi(endpoints.auth.refresh), () => {
        calls += 1;
        return HttpResponse.json({ access: makeJwt(), refresh: 'mine' });
      }),
    );
    const fromOtherTab = makeJwt({ jti: 'other-tab' });

    const pending = refreshAccessToken();
    adoptRefreshedTokens({
      type: 'refreshed',
      access: fromOtherTab,
      refresh: 'rotated-by-other-tab',
      previousRefresh: 'stale-refresh-token',
      userId: 'user-1',
    });
    lock.resolve();

    await expect(pending).resolves.toEqual({
      status: 'ok',
      token: fromOtherTab,
    });
    expect(calls).toBe(0);
    expect(useAuthStore.getState().refreshToken).toBe('rotated-by-other-tab');
  });

  it('ignores tokens from a tab on a different session', () => {
    signInWithRefreshToken();
    const before = useAuthStore.getState().accessToken;

    adoptRefreshedTokens({
      type: 'refreshed',
      access: makeJwt({ jti: 'someone-else' }),
      refresh: 'their-refresh',
      previousRefresh: 'their-old-refresh',
      userId: 'user-9',
    });

    expect(useAuthStore.getState().accessToken).toBe(before);
    expect(useAuthStore.getState().refreshToken).toBe('stale-refresh-token');
  });

  it('tells the other tabs about the rotated token', async () => {
    signInWithRefreshToken();
    startSessionSync();
    const otherTab = new BroadcastChannel('app-session');
    const received = new Promise<SessionMessage>((resolve) => {
      otherTab.addEventListener(
        'message',
        (event: MessageEvent<SessionMessage>) => {
          resolve(event.data);
        },
      );
    });
    const access = makeJwt({ sub: 'user-1' });
    server.use(
      http.post(authApi(endpoints.auth.refresh), () =>
        HttpResponse.json({ access, refresh: 'rotated' }),
      ),
    );

    await refreshAccessToken();

    await expect(received).resolves.toEqual({
      type: 'refreshed',
      access,
      refresh: 'rotated',
      previousRefresh: 'stale-refresh-token',
      userId: 'user-1',
    });
    otherTab.close();
  });
});

describe('cookie mode', () => {
  it('refreshes with credentials and no token in the body, and keeps none in the store', async () => {
    env.VITE_AUTH_REFRESH = 'cookie';
    useAuthStore.getState().setSession({
      user: { id: 'user-1', username: 'admin' },
      accessToken: makeJwt(),
      refreshToken: 'should-not-be-kept',
      tenantId: null,
    });
    expect(useAuthStore.getState().refreshToken).toBeNull();
    let body = 'not read';
    let credentials: RequestCredentials | undefined;
    const access = makeJwt({ jti: 'from-cookie' });
    server.use(
      http.post(authApi(endpoints.auth.refresh), async ({ request }) => {
        body = await request.text();
        credentials = request.credentials;
        return HttpResponse.json({ access });
      }),
    );

    await expect(refreshAccessToken()).resolves.toEqual({
      status: 'ok',
      token: access,
    });
    expect(body).toBe('');
    expect(credentials).toBe('include');
    expect(useAuthStore.getState().refreshToken).toBeNull();
  });
});
