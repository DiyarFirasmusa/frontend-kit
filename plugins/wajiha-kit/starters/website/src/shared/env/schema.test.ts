import { describe, expect, it } from 'vitest';
import {
  ENV_KEYS,
  validateEnv,
  validateProductionEnv,
  validateServerEnv,
  WEBHOOK_REQUIRED,
} from './schema';

describe('validateEnv', () => {
  it('accepts an empty environment and fills safe defaults', () => {
    const result = validateEnv({});
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.VITE_SITE_URL).toBe('http://localhost:5190');
      expect(result.value.VITE_ALLOW_INDEXING).toBe(false);
      expect(result.value.CSP_MODE).toBe('enforce');
      expect(result.value.CONTACT_WEBHOOK_URL).toBeUndefined();
    }
  });

  it('treats empty strings (as written in .env.example) as unset', () => {
    const result = validateEnv({ CONTACT_WEBHOOK_URL: '', VITE_SITE_URL: '' });
    expect(result.ok).toBe(true);
  });

  it('parses the indexing switch as a boolean', () => {
    const result = validateEnv({ VITE_ALLOW_INDEXING: 'true' });
    expect(result.ok && result.value.VITE_ALLOW_INDEXING).toBe(true);
  });

  it('rejects a site URL with a path or a trailing slash', () => {
    expect(validateEnv({ VITE_SITE_URL: 'https://example.com/' }).ok).toBe(false);
    expect(validateEnv({ VITE_SITE_URL: 'https://example.com/en' }).ok).toBe(false);
    expect(validateEnv({ VITE_SITE_URL: 'not a url' }).ok).toBe(false);
    expect(validateEnv({ VITE_SITE_URL: 'https://example.com' }).ok).toBe(true);
  });

  it('reports every problem at once', () => {
    const result = validateEnv({
      VITE_SITE_URL: 'nope',
      VITE_ALLOW_INDEXING: 'yes',
      CSP_MODE: 'off',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.problems).toHaveLength(3);
    }
  });

  it('rejects an unknown CSP mode', () => {
    expect(validateEnv({ CSP_MODE: 'report-only' }).ok).toBe(true);
    expect(validateEnv({ CSP_MODE: 'disabled' }).ok).toBe(false);
  });
});

describe('validateProductionEnv', () => {
  it('requires the site URL for a production build', () => {
    expect(validateProductionEnv({})).toHaveLength(1);
    expect(validateProductionEnv({ VITE_SITE_URL: ' ' })).toHaveLength(1);
    expect(validateProductionEnv({ VITE_SITE_URL: 'https://example.com' })).toHaveLength(0);
  });
});

describe('validateServerEnv', () => {
  const staging = { productionSite: false };
  const real = { productionSite: true };

  it('allows demo mode (no webhook) only on a site that is not the real one', () => {
    expect(validateServerEnv({}, staging)).toEqual([]);
    expect(validateServerEnv({ CONTACT_WEBHOOK_URL: '' }, real)).toEqual([WEBHOOK_REQUIRED]);
    expect(
      validateServerEnv({ CONTACT_WEBHOOK_URL: 'https://hooks.example.test/x' }, real),
    ).toEqual([]);
  });

  it('reports a bad value instead of quietly replacing it', () => {
    const problems = validateServerEnv(
      { CSP_MODE: 'Enforce', CONTACT_WEBHOOK_URL: 'https://hooks.example.test/x' },
      real,
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/^CSP_MODE:/);
    expect(validateServerEnv({ CONTACT_WEBHOOK_URL: 'not a url' }, staging)).toHaveLength(1);
  });
});

describe('ENV_KEYS', () => {
  it('lists every public and server key', () => {
    expect(ENV_KEYS).toEqual(
      expect.arrayContaining([
        'VITE_SITE_URL',
        'VITE_ALLOW_INDEXING',
        'CSP_MODE',
        'CONTACT_WEBHOOK_URL',
      ]),
    );
  });

  it('keeps secrets out of the browser: server keys never start with VITE_', () => {
    const serverKeys = ENV_KEYS.filter((key) => !key.startsWith('VITE_'));
    expect(serverKeys).toEqual(['CSP_MODE', 'CONTACT_WEBHOOK_URL']);
  });
});
