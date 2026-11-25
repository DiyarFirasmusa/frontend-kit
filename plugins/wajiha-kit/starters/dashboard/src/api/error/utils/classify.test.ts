import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { classifyError, getErrorRequestInfo, toAppError } from './classify';

function axiosError(
  options: {
    method?: string;
    status?: number;
    silentError?: boolean;
    silentErrorStatuses?: number[];
    correlationId?: string;
  } = {},
): AxiosError {
  const config = {
    headers: new AxiosHeaders(),
    method: options.method ?? 'get',
    url: '/api/items',
    silentError: options.silentError,
    silentErrorStatuses: options.silentErrorStatuses,
  } as InternalAxiosRequestConfig;
  const response =
    options.status === undefined
      ? undefined
      : {
          status: options.status,
          statusText: '',
          data: {},
          headers: options.correlationId
            ? { 'x-correlation-id': options.correlationId }
            : {},
          config,
        };
  return new AxiosError('failed', 'ERR', config, {}, response);
}

const NOW = new Date('2026-10-17T08:30:00Z');

describe('classifyError', () => {
  it('treats a request without a response as a network error', () => {
    expect(classifyError(axiosError())).toBe('network');
  });

  it('treats a 5xx response as a server error', () => {
    expect(classifyError(axiosError({ status: 503 }))).toBe('server');
  });

  it('treats 4xx responses and plain errors as unexpected', () => {
    expect(classifyError(axiosError({ status: 404 }))).toBe('unexpected');
    expect(classifyError(new Error('boom'))).toBe('unexpected');
  });

  it('treats a failed lazy chunk load as a network error', () => {
    expect(
      classifyError(
        new TypeError('Failed to fetch dynamically imported module: /a.js'),
      ),
    ).toBe('network');
  });

  it('treats any error as a network error while the device is offline', () => {
    const spy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    expect(classifyError(new Error('boom'))).toBe('network');
    spy.mockRestore();
  });
});

describe('toAppError', () => {
  it('turns a failed GET into a page-level network error', () => {
    expect(toAppError(axiosError(), NOW)).toEqual({
      kind: 'network',
      status: null,
      method: 'GET',
      path: '/api/items',
      correlationId: null,
      occurredAt: NOW.toISOString(),
    });
  });

  it('leaves a GET 500 to inline feedback, only a lost network takes the page', () => {
    expect(
      toAppError(axiosError({ status: 500, correlationId: 'corr-1' }), NOW),
    ).toBeNull();
  });

  it('leaves mutations, 4xx and silenced requests to inline feedback', () => {
    expect(toAppError(axiosError({ method: 'post', status: 500 }))).toBeNull();
    expect(toAppError(axiosError({ status: 422 }))).toBeNull();
    expect(
      toAppError(axiosError({ status: 500, silentError: true })),
    ).toBeNull();
    expect(
      toAppError(axiosError({ status: 500, silentErrorStatuses: [500] })),
    ).toBeNull();
    expect(toAppError(new Error('boom'))).toBeNull();
  });
});

describe('getErrorRequestInfo', () => {
  it('reads the request line of an axios error and nothing from others', () => {
    expect(getErrorRequestInfo(axiosError({ status: 502 }))).toEqual({
      status: 502,
      method: 'GET',
      path: '/api/items',
      correlationId: null,
    });
    expect(getErrorRequestInfo(new Error('boom'))).toEqual({
      status: null,
      correlationId: null,
    });
  });
});
