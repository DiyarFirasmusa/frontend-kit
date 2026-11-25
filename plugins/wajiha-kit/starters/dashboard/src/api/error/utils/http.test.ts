import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { getErrorData, getErrorStatus, isNotFoundError } from './http';

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

describe('http error helpers', () => {
  it('returns undefined status/data for non-Axios errors', () => {
    expect(getErrorStatus(new Error('x'))).toBeUndefined();
    expect(getErrorData(new Error('x'))).toBeUndefined();
    expect(isNotFoundError(new Error('x'))).toBe(false);
    expect(getErrorStatus(null)).toBeUndefined();
  });

  it('reads status and data from Axios errors', () => {
    const error = failure({ message: 'gone' }, 404);
    expect(getErrorStatus(error)).toBe(404);
    expect(getErrorData(error)).toEqual({ message: 'gone' });
    expect(isNotFoundError(error)).toBe(true);
  });

  it('isNotFoundError is false for other statuses', () => {
    expect(isNotFoundError(failure({}, 409))).toBe(false);
    expect(isNotFoundError(failure({}, 500))).toBe(false);
  });
});
