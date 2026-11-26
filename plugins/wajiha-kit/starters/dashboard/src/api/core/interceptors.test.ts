import { AxiosHeaders } from 'axios';
import { HttpResponse, http } from 'msw';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';
import { privateApi } from '@/api/client/private/private';
import { publicApi } from '@/api/client/public/public';
import { env } from '@/env';
import { setTestLanguage, tt } from '@/test/i18n';
import { api, authApi } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import {
  apiConfig,
  DEFAULT_REQUEST_TIMEOUT_MS,
  FILE_TRANSFER_TIMEOUT_MS,
} from './config';
import { prepareApiRequest } from './interceptors';

type PrepareInput = Parameters<typeof prepareApiRequest>[0];

const makeConfig = (
  overrides: Partial<{
    baseURL: string;
    authBase: boolean;
    responseType: 'blob' | 'arraybuffer' | 'json';
    data: unknown;
    timeout: number;
  }> = {},
) => ({ headers: new AxiosHeaders(), ...overrides }) as PrepareInput;

describe.each([
  { name: 'public', client: publicApi },
  { name: 'private', client: privateApi },
])('$name API feedback', ({ client }) => {
  it.each(['en', 'ar'] as const)(
    'toasts the shared localized error once, even for silent success (%s)',
    async (language) => {
      await setTestLanguage(language);
      const errorToast = vi.spyOn(toast, 'error');
      server.use(
        http.post(api('/probe'), () =>
          HttpResponse.json(
            { message: 'common.errors.conflict' },
            { status: 409 },
          ),
        ),
      );
      await expect(
        client.post('/probe', {}, { silent: true }),
      ).rejects.toMatchObject({ response: { status: 409 } });
      expect(errorToast).toHaveBeenCalledExactlyOnceWith(
        tt('common.errors.conflict'),
      );
    },
  );

  it.each([400, 403, 404, 422, 500, 503])(
    'falls back for an empty HTTP %i response',
    async (status) => {
      const errorToast = vi.spyOn(toast, 'error');
      server.use(
        http.post(api('/probe'), () => new HttpResponse(null, { status })),
      );
      await expect(client.post('/probe')).rejects.toMatchObject({
        response: { status },
      });
      expect(errorToast).toHaveBeenCalledTimes(1);
    },
  );

  it('shows the generic fallback on network failure', async () => {
    const errorToast = vi.spyOn(toast, 'error');
    server.use(http.post(api('/probe'), () => HttpResponse.error()));
    await expect(client.post('/probe')).rejects.toBeDefined();
    expect(errorToast).toHaveBeenCalledExactlyOnceWith(
      tt('common.errors.generic'),
    );
  });

  it('does not report cancellation as failure', async () => {
    const errorToast = vi.spyOn(toast, 'error');
    const controller = new AbortController();
    controller.abort();
    await expect(
      client.get('/probe', { signal: controller.signal }),
    ).rejects.toMatchObject({ code: 'ERR_CANCELED' });
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('toasts once before unwrapping an envelope', async () => {
    const successToast = vi.spyOn(toast, 'success');
    server.use(
      http.post(api('/probe'), () =>
        HttpResponse.json({
          success: true,
          message: 'common.done',
          data: { id: '1' },
        }),
      ),
    );
    const response = await client.post('/probe');
    expect(response.data).toEqual({ id: '1' });
    expect(successToast).toHaveBeenCalledExactlyOnceWith(tt('common.done'));
  });

  it('rejects a success:false envelope with the backend message and one error toast', async () => {
    const successToast = vi.spyOn(toast, 'success');
    const errorToast = vi.spyOn(toast, 'error');
    server.use(
      http.post(api('/probe'), () =>
        HttpResponse.json({
          success: false,
          message: 'Stock is locked',
          data: null,
        }),
      ),
    );
    await expect(client.post('/probe')).rejects.toMatchObject({
      isAxiosError: true,
      message: 'Stock is locked',
      response: { status: 200 },
    });
    expect(errorToast).toHaveBeenCalledExactlyOnceWith('Stock is locked');
    expect(successToast).not.toHaveBeenCalled();
  });

  it('keeps a success:false envelope quiet when the request is silentError', async () => {
    const errorToast = vi.spyOn(toast, 'error');
    server.use(
      http.get(api('/probe'), () =>
        HttpResponse.json({ success: false, message: 'nope', data: null }),
      ),
    );
    await expect(
      client.get('/probe', { silentError: true }),
    ).rejects.toMatchObject({ message: 'nope' });
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('prefers backend success text ahead of the fallback, and honours silent', async () => {
    const successToast = vi.spyOn(toast, 'success');
    server.use(
      http.post(api('/probe'), () =>
        HttpResponse.json({ message: 'Saved by backend' }),
      ),
    );
    await client.post('/probe', {}, { successMessage: 'common.done' });
    expect(successToast).toHaveBeenCalledExactlyOnceWith('Saved by backend');

    successToast.mockClear();
    await client.post('/probe', {}, { silent: true });
    expect(successToast).not.toHaveBeenCalled();
  });

  it('can explicitly suppress background errors without swallowing rejection', async () => {
    const errorToast = vi.spyOn(toast, 'error');
    server.use(
      http.post(api('/probe'), () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    );
    await expect(
      client.post('/probe', {}, { silentError: true }),
    ).rejects.toMatchObject({ response: { data: { message: 'boom' } } });
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('silences error feedback only for statuses listed in silentErrorStatuses', async () => {
    const errorToast = vi.spyOn(toast, 'error');
    server.use(
      http.get(api('/probe'), () => new HttpResponse(null, { status: 404 })),
    );
    await expect(
      client.get('/probe', { silentErrorStatuses: [404] }),
    ).rejects.toMatchObject({ response: { status: 404 } });
    expect(errorToast).not.toHaveBeenCalled();
  });

  it('still toasts a status missing from silentErrorStatuses', async () => {
    const errorToast = vi.spyOn(toast, 'error');
    server.use(
      http.get(api('/probe'), () => new HttpResponse(null, { status: 409 })),
    );
    await expect(
      client.get('/probe', { silentErrorStatuses: [404] }),
    ).rejects.toMatchObject({ response: { status: 409 } });
    expect(errorToast).toHaveBeenCalledTimes(1);
  });

  it('supports a fallback for a successful empty response', async () => {
    const successToast = vi.spyOn(toast, 'success');
    server.use(
      http.post(api('/probe'), () => new HttpResponse(null, { status: 204 })),
    );
    await client.post('/probe', {}, { successMessage: 'common.done' });
    expect(successToast).toHaveBeenCalledExactlyOnceWith(tt('common.done'));
  });

  it('does not toast success for reads', async () => {
    const successToast = vi.spyOn(toast, 'success');
    server.use(
      http.get(api('/probe'), () => HttpResponse.json({ message: 'Loaded' })),
    );
    await client.get('/probe');
    expect(successToast).not.toHaveBeenCalled();
  });
});

describe('prepareApiRequest', () => {
  it('asks for application/json by default and leaves blob downloads alone', () => {
    expect(prepareApiRequest(makeConfig()).headers.Accept).toBe(
      'application/json',
    );
    expect(
      prepareApiRequest(makeConfig({ responseType: 'blob' })).headers.Accept,
    ).not.toBe('application/json');
  });

  it.each(['blob', 'arraybuffer'] as const)(
    'leaves Accept alone for a %s download',
    (responseType) => {
      expect(
        prepareApiRequest(makeConfig({ responseType })).headers.Accept,
      ).not.toBe('application/json');
    },
  );

  it('applies the default timeout to ordinary JSON requests', () => {
    const prepared = prepareApiRequest(
      makeConfig({ timeout: DEFAULT_REQUEST_TIMEOUT_MS }),
    );
    expect(prepared.timeout).toBe(DEFAULT_REQUEST_TIMEOUT_MS);
  });

  it.each([
    { label: 'FormData upload', overrides: { data: new FormData() } },
    { label: 'blob download', overrides: { responseType: 'blob' as const } },
    {
      label: 'arraybuffer download',
      overrides: { responseType: 'arraybuffer' as const },
    },
  ])('extends the default timeout for a $label', ({ overrides }) => {
    const prepared = prepareApiRequest(
      makeConfig({ ...overrides, timeout: DEFAULT_REQUEST_TIMEOUT_MS }),
    );
    expect(prepared.timeout).toBe(FILE_TRANSFER_TIMEOUT_MS);
  });

  it('respects a timeout the caller set explicitly on a file transfer', () => {
    const prepared = prepareApiRequest(
      makeConfig({ data: new FormData(), timeout: 5_000 }),
    );
    expect(prepared.timeout).toBe(5_000);
  });
});

describe('prepareApiRequest auth base URL', () => {
  it('routes an authBase:true request to the auth base URL and drops the flag', () => {
    const prepared = prepareApiRequest(
      makeConfig({ baseURL: env.VITE_API_BASE_URL, authBase: true }),
    );
    expect(prepared.baseURL).toBe(env.VITE_AUTH_BASE_URL);
    expect(prepared.authBase).toBeUndefined();
  });

  it('keeps the API base URL for a request without the auth flag', () => {
    const prepared = prepareApiRequest(
      makeConfig({ baseURL: apiConfig.baseURL }),
    );
    expect(prepared.baseURL).toBe(env.VITE_API_BASE_URL);
  });

  it('reads the auth base URL from the test env', () => {
    expect(env.VITE_AUTH_BASE_URL).toBe(authApi(''));
  });
});
