import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { applyApiFieldErrors, getApiFieldErrors } from './field-errors';

function responseError(data: unknown): AxiosError {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, null, {
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data,
  });
}

describe('getApiFieldErrors', () => {
  it('reads the problem+json errors map', () => {
    expect(
      getApiFieldErrors(
        responseError({
          detail: 'x',
          errors: { code: ['taken'], name: 'empty' },
        }),
      ),
    ).toEqual({ code: ['taken'], name: ['empty'] });
  });

  it('reads the Spring list of field errors, dotted paths included', () => {
    expect(
      getApiFieldErrors(
        responseError({
          errors: [
            { field: 'variants.1.sku', message: 'duplicate' },
            { field: 'code', defaultMessage: 'taken' },
          ],
        }),
      ),
    ).toEqual({ 'variants.1.sku': ['duplicate'], code: ['taken'] });
  });

  it('returns nothing for other errors', () => {
    expect(getApiFieldErrors(new Error('boom'))).toEqual({});
    expect(getApiFieldErrors(responseError('plain text'))).toEqual({});
  });
});

describe('applyApiFieldErrors', () => {
  it('sets only the fields the form has and focuses the first', () => {
    const setError = vi.fn();
    const applied = applyApiFieldErrors(
      responseError({ errors: { code: ['taken'], hidden: ['x'] } }),
      setError,
      ['name', 'code'],
    );
    expect(applied).toBe(true);
    expect(setError).toHaveBeenCalledOnce();
    expect(setError).toHaveBeenCalledWith(
      'code',
      { type: 'server', message: 'taken' },
      { shouldFocus: true },
    );
  });
});
