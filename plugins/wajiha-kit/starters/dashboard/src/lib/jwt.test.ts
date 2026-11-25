import { describe, expect, it } from 'vitest';
import { makeJwt } from '@/test/fixtures/auth';
import type { AccessTokenPayload } from '@/types/auth';
import { decodeJwt } from './jwt';

describe('decodeJwt', () => {
  it('decodes the payload of a base64url token', () => {
    const token = makeJwt({ sub: 'abc', permissions: ['employee:read'] });
    const payload = decodeJwt<AccessTokenPayload>(token);
    expect(payload?.sub).toBe('abc');
    expect(payload?.permissions).toEqual(['employee:read']);
  });

  it('returns null for a malformed token', () => {
    expect(decodeJwt('not-a-jwt')).toBeNull();
    expect(decodeJwt('a.%%%.c')).toBeNull();
  });
});
