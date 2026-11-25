import { AxiosError } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { rejectApiError } from './interceptors';

describe('API diagnostic logging', () => {
  it.each([false, true])('logs only in development (DEV=%s)', (development) => {
    vi.stubEnv('DEV', development);
    const logger = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new AxiosError('Network unavailable');
    try {
      expect(() => rejectApiError(error)).toThrow(error);
      expect(logger).toHaveBeenCalledTimes(development ? 1 : 0);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
