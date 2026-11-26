import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { publicEnv } from '@/shared/env/public-env';
import { useToastStore } from '@/shared/store/toast-store';
import { server } from '@/test/msw-server';
import { useAuthStore } from '../store/auth-store';
import { privateApi } from './client';
import { endpoints } from './endpoints';
import { onSessionExpired } from './session-events';

const api = (path: string) => `${publicEnv.VITE_ADMIN_API_URL}${path}`;

function signIn(): void {
  useAuthStore.getState().setSession({
    user: { id: 'u1', username: 'demo', name: 'Demo' },
    accessToken: 'mock-token-admin-test',
  });
}

describe('admin API client', () => {
  it('sends the bearer token and the page language', async () => {
    signIn();
    document.documentElement.lang = 'en';
    let seen: { auth: string | null; lang: string | null } = { auth: null, lang: null };
    server.use(
      http.get(api(endpoints.overview), ({ request }) => {
        seen = {
          auth: request.headers.get('Authorization'),
          lang: request.headers.get('Accept-Language'),
        };
        return HttpResponse.json({});
      }),
    );
    await privateApi.get(endpoints.overview);
    expect(seen).toEqual({ auth: 'Bearer mock-token-admin-test', lang: 'en' });
  });

  it('ends the session on a 401 and tells the layout', async () => {
    signIn();
    let expired = false;
    const stop = onSessionExpired(() => {
      expired = true;
    });
    server.use(http.get(api(endpoints.overview), () => HttpResponse.json({}, { status: 401 })));
    await expect(privateApi.get(endpoints.overview)).rejects.toThrow();
    stop();
    expect(expired).toBe(true);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('ignores a late 401 for a request sent with an older session', async () => {
    signIn();
    let expired = 0;
    const stop = onSessionExpired(() => {
      expired += 1;
    });
    server.use(http.get(api(endpoints.overview), () => HttpResponse.json({}, { status: 401 })));
    const pending = privateApi.get(endpoints.overview);
    // The user signs out (or in again) before the answer arrives.
    useAuthStore.getState().clear();
    await expect(pending).rejects.toThrow();
    stop();
    expect(expired).toBe(0);
  });

  it('sends the token it was given for a request made while signing out', async () => {
    signIn();
    let auth: string | null = null;
    server.use(
      http.post(api(endpoints.auth.logout), ({ request }) => {
        auth = request.headers.get('Authorization');
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const pending = privateApi.post(endpoints.auth.logout, null, {
      silentError: true,
      headers: { Authorization: 'Bearer mock-token-admin-test' },
    });
    useAuthStore.getState().clear();
    await pending;
    expect(auth).toBe('Bearer mock-token-admin-test');
  });

  it('shows the backend message for a failed request, and a success message for a change', async () => {
    signIn();
    server.use(
      http.get(api(endpoints.overview), () =>
        HttpResponse.json({ message: 'Server is busy' }, { status: 503 }),
      ),
    );
    await expect(privateApi.get(endpoints.overview)).rejects.toThrow();
    await privateApi.put(endpoints.profile, { name: 'A' }, { successMessage: 'settings.saved' });
    expect(useToastStore.getState().toasts.map((toast) => toast.message)).toEqual([
      { text: 'Server is busy' },
      { key: 'settings.saved' },
    ]);
  });

  it('stays quiet when the caller handles the error itself', async () => {
    signIn();
    server.use(http.get(api(endpoints.overview), () => HttpResponse.json({}, { status: 500 })));
    await expect(privateApi.get(endpoints.overview, { silentError: true })).rejects.toThrow();
    expect(useToastStore.getState().toasts).toEqual([]);
  });
});
