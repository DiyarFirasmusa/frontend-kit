import { HttpResponse, http } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerSessionHooks } from '@/api/auth/session-hooks';
import { stopSessionSync } from '@/api/auth/session-sync';
import { endpoints } from '@/constants/api';
import { qk } from '@/constants/query-keys';
import { queryClient } from '@/lib/query-client';
import { AUTH_STORAGE_KEY, useAuthStore } from '@/store/auth-store';
import { usePermissionStore } from '@/store/permission-store';
import { makeJwt, signIn } from '@/test/fixtures/auth';
import { api, authApi } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import type { MeResponse } from '@/types/api/me';
import { bootstrapSession } from './bootstrap-session';

/** What a reload does to the stores: memory is gone, sessionStorage stays. */
async function simulateReload(): Promise<void> {
  // Resetting the store writes through to storage, so put the saved copy back.
  const saved = sessionStorage.getItem(AUTH_STORAGE_KEY);
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    tenantId: null,
  });
  usePermissionStore.getState().clear();
  if (saved !== null) {
    sessionStorage.setItem(AUTH_STORAGE_KEY, saved);
  }
  await useAuthStore.persist.rehydrate();
}

function storedSession(): Record<string, unknown> {
  const raw = sessionStorage.getItem(AUTH_STORAGE_KEY) ?? '{}';
  const parsed: { state?: Record<string, unknown> } = JSON.parse(raw);
  return parsed.state ?? {};
}

let unregister: (() => void) | null = null;

afterEach(() => {
  unregister?.();
  unregister = null;
  stopSessionSync();
  queryClient.clear();
});

describe('session storage', () => {
  it('keeps the refresh token, user and tenant in sessionStorage, never the access token', () => {
    signIn({ permissions: ['warehouse:read'] });

    const stored = storedSession();
    expect(stored).toEqual({
      user: useAuthStore.getState().user,
      refreshToken: 'refresh-token',
      tenantId: 'tenant-1',
    });
    expect(JSON.stringify(stored)).not.toContain(
      useAuthStore.getState().accessToken,
    );
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});

describe('bootstrapSession', () => {
  it('signs the user back in after a reload with one refresh', async () => {
    signIn();
    await simulateReload();
    expect(useAuthStore.getState().accessToken).toBeNull();
    let calls = 0;
    const access = makeJwt({ permissions: ['warehouse:read'], roles: [] });
    server.use(
      http.post(authApi(endpoints.auth.refresh), () => {
        calls += 1;
        return HttpResponse.json({ access, refresh: 'rotated' });
      }),
    );

    await bootstrapSession();

    expect(calls).toBe(1);
    expect(useAuthStore.getState().accessToken).toBe(access);
    expect(useAuthStore.getState().user?.username).toBe('admin');
    expect(usePermissionStore.getState().permissions).toEqual([
      'warehouse:read',
    ]);
    expect(storedSession()).toMatchObject({ refreshToken: 'rotated' });
  });

  it('loads permissions from /me when the refreshed token has none', async () => {
    signIn();
    await simulateReload();
    const access = makeJwt({ roles: undefined, permissions: undefined });
    let meCalls = 0;
    server.use(
      http.post(authApi(endpoints.auth.refresh), () =>
        HttpResponse.json({ access, refresh: 'rotated' }),
      ),
      http.get(api(endpoints.auth.me), () => {
        meCalls += 1;
        return HttpResponse.json({
          roles: ['CLERK'],
          permissions: ['supplier:read'],
        } satisfies Partial<MeResponse>);
      }),
    );

    await bootstrapSession();

    expect(meCalls).toBe(1);
    expect(usePermissionStore.getState().roles).toEqual(['CLERK']);
    expect(usePermissionStore.getState().permissions).toEqual([
      'supplier:read',
    ]);
    expect(queryClient.getQueryData(qk.me.all)).toMatchObject({
      roles: ['CLERK'],
    });
  });

  it('does not call the backend when no refresh token was stored', async () => {
    let calls = 0;
    server.use(
      http.post(authApi(endpoints.auth.refresh), () => {
        calls += 1;
        return HttpResponse.json({ access: makeJwt(), refresh: 'x' });
      }),
    );

    await bootstrapSession();

    expect(calls).toBe(0);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('forgets the stored session when the refresh token is rejected', async () => {
    signIn();
    await simulateReload();
    server.use(
      http.post(authApi(endpoints.auth.refresh), () =>
        HttpResponse.json({ message: 'revoked' }, { status: 401 }),
      ),
    );

    await bootstrapSession();

    expect(useAuthStore.getState().user).toBeNull();
    expect(storedSession()).toMatchObject({ refreshToken: null, user: null });
  });

  it('keeps the stored refresh token when the backend is unreachable', async () => {
    signIn();
    await simulateReload();
    server.use(
      http.post(authApi(endpoints.auth.refresh), () => HttpResponse.error()),
    );

    await bootstrapSession();

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().refreshToken).toBe('refresh-token');
  });

  it('removes tokens an older build left in localStorage', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, '{"state":{"accessToken":"old"}}');
    localStorage.setItem('app-permissions', '{"state":{}}');

    await bootstrapSession();

    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem('app-permissions')).toBeNull();
  });

  it('ends the session when another tab signs out', async () => {
    const onSessionExpired = vi.fn();
    unregister = registerSessionHooks({ onSessionExpired });
    signIn();
    server.use(
      http.post(authApi(endpoints.auth.refresh), () =>
        HttpResponse.json({ access: makeJwt(), refresh: 'rotated' }),
      ),
    );
    await bootstrapSession();

    const otherTab = new BroadcastChannel('app-session');
    otherTab.postMessage({ type: 'signed-out' });
    await vi.waitFor(() => {
      expect(onSessionExpired).toHaveBeenCalledTimes(1);
    });
    otherTab.close();

    expect(useAuthStore.getState().user).toBeNull();
  });
});
