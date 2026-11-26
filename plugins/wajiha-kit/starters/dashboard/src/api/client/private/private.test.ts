import { HttpResponse, http } from 'msw';
import { toast } from 'sonner';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerSessionHooks } from '@/api/auth/session-hooks';
import { endpoints } from '@/constants/api';
import { useAuthStore } from '@/store/auth-store';
import { usePermissionStore } from '@/store/permission-store';
import { makeJwt, signIn } from '@/test/fixtures/auth';
import { api, authApi } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { privateApi } from './private';

let unregister: (() => void) | null = null;

afterEach(() => {
  unregister?.();
  unregister = null;
});

describe('privateApi', () => {
  it('sends the bearer token and Accept-Language header', async () => {
    signIn();
    let seen: Headers | undefined;
    server.use(
      http.get(api('/v1/ping'), ({ request }) => {
        seen = request.headers;
        return HttpResponse.json({ ok: true });
      }),
    );

    const { data } = await privateApi.get<{ ok: boolean }>('/v1/ping');

    expect(data.ok).toBe(true);
    expect(seen?.get('authorization')).toBe(
      `Bearer ${useAuthStore.getState().accessToken}`,
    );
    expect(seen?.get('accept-language')).toBe('ar');
  });

  it('refreshes the token once on 401 and retries the request', async () => {
    const errorToast = vi.spyOn(toast, 'error');
    signIn();
    const staleToken = useAuthStore.getState().accessToken;
    let calls = 0;
    server.use(
      http.get(api('/v1/secure'), ({ request }) => {
        calls += 1;
        const auth = request.headers.get('authorization');
        if (auth === `Bearer ${staleToken}`) {
          return HttpResponse.json({ message: 'expired' }, { status: 401 });
        }
        return HttpResponse.json({ ok: true });
      }),
      http.post(authApi(endpoints.auth.refresh), () =>
        HttpResponse.json({
          access: makeJwt({ jti: 'refreshed-token' }),
          refresh: 'refreshed-refresh-token',
        }),
      ),
    );

    const { data } = await privateApi.get<{ ok: boolean }>('/v1/secure');

    expect(data.ok).toBe(true);
    expect(calls).toBe(2);
    expect(errorToast).not.toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).not.toBe(staleToken);
  });

  it('clears the session when the refresh also fails', async () => {
    const errorToast = vi.spyOn(toast, 'error');
    signIn();
    server.use(
      http.get(api('/v1/secure'), () =>
        HttpResponse.json({ message: 'expired' }, { status: 401 }),
      ),
      http.post(authApi(endpoints.auth.refresh), () =>
        HttpResponse.json({ message: 'revoked' }, { status: 401 }),
      ),
    );

    await expect(privateApi.get('/v1/secure')).rejects.toBeDefined();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('does not clear the session or retry the refresh on a 401 marked skipAuthHandling', async () => {
    signIn();
    const token = useAuthStore.getState().accessToken;
    let refreshCalls = 0;
    server.use(
      http.get(api('/v1/logout-like'), () =>
        HttpResponse.json({ message: 'nope' }, { status: 401 }),
      ),
      http.post(authApi(endpoints.auth.refresh), () => {
        refreshCalls += 1;
        return HttpResponse.json({
          access: makeJwt({ jti: 'should-not-be-called' }),
          refresh: 'should-not-be-called',
        });
      }),
    );

    await expect(
      privateApi.get('/v1/logout-like', { skipAuthHandling: true }),
    ).rejects.toBeDefined();

    expect(refreshCalls).toBe(0);
    expect(useAuthStore.getState().accessToken).toBe(token);
  });

  it('keeps a plain 403 as a normal error toast', async () => {
    const errorToast = vi.spyOn(toast, 'error');
    signIn();
    server.use(
      http.get(api('/v1/data'), () =>
        HttpResponse.json({ message: 'Access denied' }, { status: 403 }),
      ),
    );

    await expect(privateApi.get('/v1/data')).rejects.toBeTruthy();

    expect(errorToast).toHaveBeenCalled();
  });

  it('sends authBase:true requests to the auth base and keeps the bearer token', async () => {
    signIn();
    let seenUrl = '';
    let seenAuth: string | null = null;
    server.use(
      http.post(authApi('/v1/auth-probe'), ({ request }) => {
        seenUrl = request.url;
        seenAuth = request.headers.get('authorization');
        return HttpResponse.json({ ok: true });
      }),
    );

    const { data } = await privateApi.post<{ ok: boolean }>(
      '/v1/auth-probe',
      {},
      { authBase: true },
    );

    expect(data.ok).toBe(true);
    expect(seenUrl).toBe(authApi('/v1/auth-probe'));
    expect(seenAuth).toBe(`Bearer ${useAuthStore.getState().accessToken}`);
  });

  it('keeps the session on a 401 when the request sets keepSession', async () => {
    signIn();
    const token = useAuthStore.getState().accessToken;
    let refreshCalls = 0;
    server.use(
      http.post(api('/v1/password-probe'), () =>
        HttpResponse.json({ message: 'wrong' }, { status: 401 }),
      ),
      http.post(authApi(endpoints.auth.refresh), () => {
        refreshCalls += 1;
        return HttpResponse.json({ access: 'x', refresh: 'y' });
      }),
    );

    await expect(
      privateApi.post('/v1/password-probe', {}, { keepSession: true }),
    ).rejects.toMatchObject({ response: { status: 401 } });

    expect(refreshCalls).toBe(0);
    expect(useAuthStore.getState().accessToken).toBe(token);
  });

  it('keeps the session and fails the request as a network error when the refresh server is unreachable', async () => {
    const errorToast = vi.spyOn(toast, 'error');
    const onSessionExpired = vi.fn();
    unregister = registerSessionHooks({ onSessionExpired });
    signIn({ permissions: ['warehouse:read'] });
    const before = useAuthStore.getState();
    server.use(
      http.post(api('/v1/secure'), () =>
        HttpResponse.json({ message: 'expired' }, { status: 401 }),
      ),
      http.post(authApi(endpoints.auth.refresh), () => HttpResponse.error()),
    );

    const failure: unknown = await privateApi
      .post('/v1/secure')
      .catch((error: unknown) => error);

    expect(failure).toMatchObject({ code: 'ERR_NETWORK' });
    expect(failure).not.toHaveProperty('response.status');

    expect(onSessionExpired).not.toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).toBe(before.accessToken);
    expect(useAuthStore.getState().refreshToken).toBe(before.refreshToken);
    expect(useAuthStore.getState().user).toEqual(before.user);
    expect(usePermissionStore.getState().permissions).toEqual([
      'warehouse:read',
    ]);
    expect(errorToast).toHaveBeenCalledTimes(1);
  });

  it('keeps the session when the refresh endpoint answers 503', async () => {
    const onSessionExpired = vi.fn();
    unregister = registerSessionHooks({ onSessionExpired });
    signIn();
    server.use(
      http.post(api('/v1/secure'), () =>
        HttpResponse.json({ message: 'expired' }, { status: 401 }),
      ),
      http.post(authApi(endpoints.auth.refresh), () =>
        HttpResponse.json({ message: 'down' }, { status: 503 }),
      ),
    );

    await expect(privateApi.post('/v1/secure')).rejects.toBeDefined();

    expect(onSessionExpired).not.toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).not.toBeNull();
  });

  it('refreshes once and ends the session once for two concurrent 401s', async () => {
    const onSessionExpired = vi.fn();
    unregister = registerSessionHooks({ onSessionExpired });
    signIn();
    let refreshCalls = 0;
    server.use(
      http.get(api('/v1/a'), () =>
        HttpResponse.json({ message: 'expired' }, { status: 401 }),
      ),
      http.get(api('/v1/b'), () =>
        HttpResponse.json({ message: 'expired' }, { status: 401 }),
      ),
      http.post(authApi(endpoints.auth.refresh), () => {
        refreshCalls += 1;
        return HttpResponse.json({ message: 'revoked' }, { status: 401 });
      }),
    );

    const results = await Promise.allSettled([
      privateApi.get('/v1/a'),
      privateApi.get('/v1/b'),
    ]);

    expect(results.map((r) => r.status)).toEqual(['rejected', 'rejected']);
    expect(refreshCalls).toBe(1);
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('refreshes once and retries both requests for two concurrent 401s', async () => {
    signIn();
    const stale = useAuthStore.getState().accessToken;
    let refreshCalls = 0;
    const handler = ({ request }: { request: Request }) =>
      request.headers.get('authorization') === `Bearer ${stale}`
        ? HttpResponse.json({ message: 'expired' }, { status: 401 })
        : HttpResponse.json({ ok: true });
    server.use(
      http.get(api('/v1/a'), handler),
      http.get(api('/v1/b'), handler),
      http.post(authApi(endpoints.auth.refresh), () => {
        refreshCalls += 1;
        return HttpResponse.json({
          access: makeJwt({ jti: 'fresh' }),
          refresh: 'fresh-refresh',
        });
      }),
    );

    const [a, b] = await Promise.all([
      privateApi.get<{ ok: boolean }>('/v1/a'),
      privateApi.get<{ ok: boolean }>('/v1/b'),
    ]);

    expect(a.data.ok && b.data.ok).toBe(true);
    expect(refreshCalls).toBe(1);
  });

  it('tells the session layer about a 403 and keeps the session', async () => {
    const onForbidden = vi.fn();
    const onSessionExpired = vi.fn();
    unregister = registerSessionHooks({ onForbidden, onSessionExpired });
    signIn();
    server.use(
      http.get(api('/v1/data'), () =>
        HttpResponse.json({ message: 'Access denied' }, { status: 403 }),
      ),
    );

    await expect(privateApi.get('/v1/data')).rejects.toBeTruthy();

    expect(onForbidden).toHaveBeenCalledTimes(1);
    expect(onSessionExpired).not.toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).not.toBeNull();
  });
});
