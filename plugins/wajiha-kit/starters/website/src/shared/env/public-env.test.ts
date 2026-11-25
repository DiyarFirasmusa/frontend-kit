import { describe, expect, it } from 'vitest';
import { readPublicEnv } from './public-env';

describe('readPublicEnv', () => {
  it('reads the two public values', () => {
    expect(
      readPublicEnv({ VITE_SITE_URL: 'https://example.com', VITE_ALLOW_INDEXING: 'true' }),
    ).toEqual({ VITE_SITE_URL: 'https://example.com', VITE_ALLOW_INDEXING: true });
  });

  it('falls back to safe defaults: local origin and no indexing', () => {
    expect(readPublicEnv({})).toEqual({
      VITE_SITE_URL: 'http://localhost:5190',
      VITE_ALLOW_INDEXING: false,
    });
    expect(
      readPublicEnv({ VITE_SITE_URL: 'https://example.com/', VITE_ALLOW_INDEXING: 'yes' }),
    ).toEqual({ VITE_SITE_URL: 'http://localhost:5190', VITE_ALLOW_INDEXING: false });
  });
});
