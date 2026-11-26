import { describe, expect, it } from 'vitest';
import { readPublicEnv } from './public-env';

describe('readPublicEnv', () => {
  it('reads the public values', () => {
    expect(
      readPublicEnv({
        VITE_SITE_URL: 'https://example.com',
        VITE_ALLOW_INDEXING: 'true',
        VITE_ADMIN_API_URL: 'https://api.example.com/v1',
        VITE_ADMIN_API_MOCK: 'true',
      }),
    ).toEqual({
      VITE_SITE_URL: 'https://example.com',
      VITE_ALLOW_INDEXING: true,
      VITE_ADMIN_API_URL: 'https://api.example.com/v1',
      VITE_ADMIN_API_MOCK: true,
    });
  });

  it('falls back to safe defaults: local origin and no indexing', () => {
    const defaults = {
      VITE_SITE_URL: 'http://localhost:5190',
      VITE_ALLOW_INDEXING: false,
      VITE_ADMIN_API_URL: '/api',
      VITE_ADMIN_API_MOCK: false,
    };
    expect(readPublicEnv({})).toEqual(defaults);
    expect(
      readPublicEnv({
        VITE_SITE_URL: 'https://example.com/',
        VITE_ALLOW_INDEXING: 'yes',
        VITE_ADMIN_API_MOCK: 'yes',
      }),
    ).toEqual(defaults);
  });
});
