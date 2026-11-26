import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import {
  displayBackendMessage,
  extractApiErrorMessage,
  resolveApiErrorMessage,
} from './api-error';

function failure(data: unknown, status = 500) {
  return new AxiosError(
    'request failed',
    'ERR_BAD_RESPONSE',
    undefined,
    undefined,
    {
      data,
      status,
      statusText: '',
      headers: {},
      config: { headers: new AxiosHeaders() },
    },
  );
}

describe('shared API error resolution', () => {
  it.each(['en', 'ar'] as const)(
    'prefers the requested backend language (%s)',
    async (language) => {
      await setTestLanguage(language);
      expect(
        resolveApiErrorMessage(
          failure({ en_error: 'Try again', ar_error: 'حاول مرة أخرى' }),
        ),
      ).toBe(language === 'ar' ? 'حاول مرة أخرى' : 'Try again');
    },
  );

  it.each([
    { message: 'common.errors.conflict' },
    { detail: 'common.errors.conflict' },
    { error_description: 'common.errors.conflict' },
    { non_field_errors: ['common.errors.conflict'] },
    { errors: { username: ['common.errors.conflict'] } },
    { details: [{ reason: 'common.errors.conflict' }] },
    { type: 'about:blank', title: 'common.errors.conflict', status: 409 },
  ])(
    'resolves supported bodies through the same translation path: %j',
    (body) => {
      expect(resolveApiErrorMessage(failure(body))).toBe(
        tt('common.errors.conflict'),
      );
    },
  );

  it('reads a problem+json detail before its generic title', () => {
    expect(
      extractApiErrorMessage({
        type: 'about:blank',
        title: 'Conflict',
        status: 409,
        detail: 'The code is already used',
      }),
    ).toBe('The code is already used');
    expect(
      extractApiErrorMessage({ title: 'Conflict', message: 'Taken' }),
    ).toBe('Taken');
  });

  it.each([null, '<html>error</html>', {}, { message: ' ' }])(
    'falls back for missing or unusable backend messages: %j',
    (body) => {
      expect(extractApiErrorMessage(body)).toBeUndefined();
      expect(resolveApiErrorMessage(failure(body, 503))).toBe(
        tt('common.errors.unavailable'),
      );
    },
  );

  it('does not expose transport/JavaScript error text', () => {
    expect(
      resolveApiErrorMessage(new Error('private implementation detail')),
    ).toBe(tt('common.errors.generic'));
    expect(resolveApiErrorMessage(new AxiosError('Network Error'))).toBe(
      tt('common.errors.generic'),
    );
    expect(resolveApiErrorMessage(null, 'View fallback')).toBe('View fallback');
  });
});

describe('known backend messages', () => {
  it('translates the data conflict message', () => {
    setTestLanguage('ar');
    expect(
      displayBackendMessage(
        'The request conflicts with existing data (e.g. duplicate or invalid reference).',
      ),
    ).toContain('يتعارض');
  });
});
