import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { authService } from '@/services/auth.service';
import { authApi } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';

describe('authService.logout', () => {
  it('posts { refresh } to the auth base with the explicit Bearer token', async () => {
    let receivedUrl = '';
    let receivedBody: unknown;
    let receivedAuthorization: string | null = null;
    server.use(
      http.post(authApi(endpoints.auth.logout), async ({ request }) => {
        receivedUrl = request.url;
        receivedAuthorization = request.headers.get('Authorization');
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 200 });
      }),
    );

    await authService.logout('refresh-token', 'access-token');

    expect(receivedUrl).toBe(authApi(endpoints.auth.logout));
    expect(receivedAuthorization).toBe('Bearer access-token');
    expect(receivedBody).toEqual({ refresh: 'refresh-token' });
  });
});

describe('authService.logout without an explicit token', () => {
  it('sends no Authorization header when accessToken is omitted', async () => {
    let receivedAuthorization: string | null = 'unset';
    let receivedBody: unknown;
    server.use(
      http.post(authApi(endpoints.auth.logout), async ({ request }) => {
        receivedAuthorization = request.headers.get('Authorization');
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 200 });
      }),
    );

    await authService.logout('refresh-token');

    expect(receivedAuthorization).toBeNull();
    expect(receivedBody).toEqual({ refresh: 'refresh-token' });
  });
});

describe('authService.changePassword', () => {
  it('posts current_password and new_password to the auth base', async () => {
    let receivedUrl = '';
    let receivedBody: unknown;
    server.use(
      http.post(authApi(endpoints.auth.changePassword), async ({ request }) => {
        receivedUrl = request.url;
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 200 });
      }),
    );

    await authService.changePassword({
      current_password: 'old-secret',
      new_password: 'new-secret',
    });

    expect(receivedUrl).toBe(authApi(endpoints.auth.changePassword));
    expect(receivedBody).toEqual({
      current_password: 'old-secret',
      new_password: 'new-secret',
    });
  });
});
