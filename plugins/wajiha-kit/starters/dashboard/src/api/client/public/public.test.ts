import { HttpResponse, http } from 'msw';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';
import { publicApi } from '@/api/client/public/public';
import { api, authApi } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';

describe('publicApi error interceptor', () => {
  it('toasts the extracted error message by default', async () => {
    const errorToast = vi.spyOn(toast, 'error');
    server.use(
      http.post(api('/v1/probe'), () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    );

    await expect(publicApi.post('/v1/probe')).rejects.toMatchObject({
      response: { status: 500, data: { message: 'boom' } },
    });
    expect(errorToast).toHaveBeenCalledTimes(1);
  });

  it('does not toast when error feedback is explicitly silenced, but still rejects with the response data intact', async () => {
    const errorToast = vi.spyOn(toast, 'error');
    server.use(
      http.post(api('/v1/probe'), () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    );

    await expect(
      publicApi.post('/v1/probe', undefined, { silentError: true }),
    ).rejects.toMatchObject({
      response: { status: 500, data: { message: 'boom' } },
    });
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('sends authBase:true requests to the auth base URL without a bearer token', async () => {
    let seenUrl = '';
    let seenAuth: string | null = 'unset';
    server.use(
      http.post(authApi('/v1/login-probe'), ({ request }) => {
        seenUrl = request.url;
        seenAuth = request.headers.get('authorization');
        return HttpResponse.json({ ok: true });
      }),
    );

    await publicApi.post(
      '/v1/login-probe',
      { username: 'admin', password: 'secret' },
      { authBase: true },
    );

    expect(seenUrl).toBe(authApi('/v1/login-probe'));
    expect(seenAuth).toBeNull();
  });
});
