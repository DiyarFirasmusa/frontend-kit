import { describe, expect, it } from 'vitest';
import { makeJwt } from '@/test/fixtures/auth';
import { decodeJwt } from './jwt';

describe('decodeJwt', () => {
  it('decodes the payload of a base64url token', () => {
    const token = makeJwt({ sub: 'abc', permissions: ['employee:read'] });
    const payload = decodeJwt(token);
    expect(payload?.sub).toBe('abc');
    expect(payload?.permissions).toEqual(['employee:read']);
  });

  it('drops a claim of the wrong type instead of trusting it', () => {
    const claims = { sub: 'abc', roles: 'admin', permissions: [1, 'x'] };
    const body = btoa(JSON.stringify(claims))
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replaceAll('=', '');
    const payload = decodeJwt(`header.${body}.signature`);
    expect(payload?.sub).toBe('abc');
    expect(payload?.roles).toBeUndefined();
    expect(payload?.permissions).toBeUndefined();
  });

  it('returns null for a malformed token', () => {
    expect(decodeJwt('not-a-jwt')).toBeNull();
    expect(decodeJwt('a.%%%.c')).toBeNull();
  });
});
