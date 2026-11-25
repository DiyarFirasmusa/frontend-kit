import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { tokenService } from '@/services/token.service';
import { makeRefreshResponse } from '@/test/fixtures/auth';
import { authApi } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';

describe('tokenService.refresh', () => {
  it('posts { refresh } to the auth base and resolves to the new token pair', async () => {
    const response = makeRefreshResponse();
    let receivedBody: unknown;
    let receivedUrl = '';
    let receivedAuthorization: string | null | undefined;
    server.use(
      http.post(authApi(endpoints.auth.refresh), async ({ request }) => {
        receivedUrl = request.url;
        receivedAuthorization = request.headers.get('Authorization');
        receivedBody = await request.json();
        return HttpResponse.json(response);
      }),
    );

    const result = await tokenService.refresh('some-refresh-token');

    expect(receivedUrl).toBe(authApi(endpoints.auth.refresh));
    expect(receivedBody).toEqual({ refresh: 'some-refresh-token' });
    expect(receivedAuthorization).toBeNull();
    expect(result).toEqual(response);
  });
});
