import { http, HttpResponse } from 'msw';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';
import { endpoints } from '@/constants/api';
import { makeLoginResponse, signIn } from '@/test/fixtures/auth';
import { authApi } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { loginService } from './login.service';

const payload = { username: 'admin', password: 'secret' };

describe('loginService', () => {
  it('posts credentials to the auth base without a bearer token, toasts the backend message and returns the body', async () => {
    signIn();
    const response = makeLoginResponse();
    const success = vi.spyOn(toast, 'success');
    server.use(
      http.post(authApi(endpoints.auth.login), async ({ request }) => {
        expect(await request.json()).toEqual(payload);
        expect(request.headers.get('Authorization')).toBeNull();
        return HttpResponse.json({ ...response, message: 'Welcome' });
      }),
    );
    expect(await loginService.login(payload)).toMatchObject(response);
    expect(success).toHaveBeenCalledWith('Welcome');
  });

  it('preserves an authentication rejection', async () => {
    server.use(
      http.post(authApi(endpoints.auth.login), () =>
        HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 }),
      ),
    );
    await expect(loginService.login(payload)).rejects.toMatchObject({
      response: { status: 401 },
    });
  });
});
