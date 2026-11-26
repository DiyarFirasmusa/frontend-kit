import { HttpResponse, delay, http } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { startSessionSync, stopSessionSync } from '@/api/auth/session-sync';
import { endpoints } from '@/constants/api';
import { useAuthStore } from '@/store/auth-store';
import { signIn } from '@/test/fixtures/auth';
import { authApi } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { act, renderWithRouter, waitFor } from '@/test/render';
import { useLogout } from './use-logout';

function LogoutProbe({
  latest,
}: {
  latest: { current: ReturnType<typeof useLogout> | null };
}) {
  latest.current = useLogout();
  return null;
}

async function mountProbe() {
  const latest: { current: ReturnType<typeof useLogout> | null } = {
    current: null,
  };
  await renderWithRouter(<LogoutProbe latest={latest} />, { path: '/' });
  return latest;
}

afterEach(() => {
  stopSessionSync();
});

describe('useLogout', () => {
  it('clears the local session without waiting for the logout request to settle', async () => {
    signIn();
    server.use(
      http.post(authApi(endpoints.auth.logout), async () => {
        // Never resolves within the test — proves the local sign-out does
        // not block on it.
        await delay('infinite');
        return new HttpResponse(null, { status: 200 });
      }),
    );

    const latest = await mountProbe();

    await act(async () => {
      await latest.current!();
    });

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().refreshToken).toBeNull();
  });

  it('still calls the logout endpoint with the refresh token in the background', async () => {
    signIn();
    const accessToken = useAuthStore.getState().accessToken;
    let receivedBody: unknown;
    let receivedAuthorization: string | null = null;
    server.use(
      http.post(authApi(endpoints.auth.logout), async ({ request }) => {
        receivedBody = await request.json();
        receivedAuthorization = request.headers.get('Authorization');
        return new HttpResponse(null, { status: 200 });
      }),
    );

    const latest = await mountProbe();

    await act(async () => {
      await latest.current!();
    });

    await waitFor(() => {
      expect(receivedBody).toEqual({ refresh: 'refresh-token' });
    });
    expect(receivedAuthorization).toBe(`Bearer ${accessToken}`);
  });

  it('still clears the local session when the logout call fails', async () => {
    signIn();
    server.use(
      http.post(authApi(endpoints.auth.logout), () => HttpResponse.error()),
    );

    const latest = await mountProbe();

    await act(async () => {
      await latest.current!();
    });

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().refreshToken).toBeNull();
  });

  it('signs the other tabs out too', async () => {
    signIn();
    startSessionSync();
    const otherTab = new BroadcastChannel('app-session');
    const received = new Promise<unknown>((resolve) => {
      otherTab.addEventListener('message', (event: MessageEvent<unknown>) => {
        resolve(event.data);
      });
    });
    const latest = await mountProbe();

    await act(async () => {
      await latest.current!();
    });

    await expect(received).resolves.toEqual({ type: 'signed-out' });
    otherTab.close();
  });
});
