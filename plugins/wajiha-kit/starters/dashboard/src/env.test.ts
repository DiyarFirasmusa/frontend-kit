import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function loadEnv() {
  vi.resetModules();
  return import('@/env');
}

describe('env VITE_AUTH_BASE_URL', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('falls back to the API base URL when empty', async () => {
    vi.stubEnv('VITE_AUTH_BASE_URL', '');
    const { env, envError } = await loadEnv();
    expect(envError).toBeNull();
    expect(env.VITE_AUTH_BASE_URL).toBe('http://api.test');
  });

  it('falls back to the API base URL when unset', async () => {
    const original = process.env.VITE_AUTH_BASE_URL;
    delete process.env.VITE_AUTH_BASE_URL;
    try {
      const { env, envError } = await loadEnv();
      expect(envError).toBeNull();
      expect(env.VITE_AUTH_BASE_URL).toBe('http://api.test');
    } finally {
      if (original === undefined) {
        delete process.env.VITE_AUTH_BASE_URL;
      } else {
        process.env.VITE_AUTH_BASE_URL = original;
      }
    }
  });

  it('keeps a valid absolute auth URL and trims trailing slashes', async () => {
    vi.stubEnv('VITE_AUTH_BASE_URL', 'https://auth.example.com//');
    const { env, envError } = await loadEnv();
    expect(envError).toBeNull();
    expect(env.VITE_AUTH_BASE_URL).toBe('https://auth.example.com');
  });

  it('reports an envError for a relative auth URL', async () => {
    vi.stubEnv('VITE_AUTH_BASE_URL', '/auth');
    const { envError } = await loadEnv();
    expect(envError).toContain('VITE_AUTH_BASE_URL');
  });

  it('reports an envError for a malformed auth URL such as https:///', async () => {
    vi.stubEnv('VITE_AUTH_BASE_URL', 'https:///');
    const { envError } = await loadEnv();
    expect(envError).toContain('VITE_AUTH_BASE_URL');
  });

  it('reports an envError for a malformed API URL such as https:///', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https:///');
    const { envError } = await loadEnv();
    expect(envError).toContain('VITE_API_BASE_URL');
  });
});

describe('env VITE_AUTH_REFRESH', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to session storage so the mock demo survives a reload', async () => {
    vi.stubEnv('VITE_AUTH_REFRESH', '');
    const { env, envError } = await loadEnv();
    expect(envError).toBeNull();
    expect(env.VITE_AUTH_REFRESH).toBe('session');
  });

  it('accepts the HttpOnly cookie mode', async () => {
    vi.stubEnv('VITE_AUTH_REFRESH', 'cookie');
    const { env } = await loadEnv();
    expect(env.VITE_AUTH_REFRESH).toBe('cookie');
  });

  it('reports an unknown mode as a configuration error', async () => {
    vi.stubEnv('VITE_AUTH_REFRESH', 'localStorage');
    const { envError } = await loadEnv();
    expect(envError).toContain('VITE_AUTH_REFRESH');
  });
});
