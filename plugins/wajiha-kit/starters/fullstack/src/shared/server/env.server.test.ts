import { describe, expect, it } from 'vitest';
import { getServerEnv } from './env.server';

describe('getServerEnv', () => {
  it('reads the server values with their defaults', () => {
    expect(getServerEnv({})).toEqual({ CSP_MODE: 'enforce', CONTACT_WEBHOOK_URL: undefined });
    expect(getServerEnv({ CONTACT_WEBHOOK_URL: 'https://hooks.example.test/x' })).toEqual({
      CSP_MODE: 'enforce',
      CONTACT_WEBHOOK_URL: 'https://hooks.example.test/x',
    });
  });

  it('throws on a bad value instead of dropping the other values', () => {
    expect(() =>
      getServerEnv({ CSP_MODE: 'Enforce', CONTACT_WEBHOOK_URL: 'https://hooks.example.test/x' }),
    ).toThrow(/CSP_MODE/);
  });
});
