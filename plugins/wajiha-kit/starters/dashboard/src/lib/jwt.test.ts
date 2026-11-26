import { describe, expect, it } from 'vitest';
import { makeJwt } from '@/test/fixtures/auth';
import { decodeJwt } from './jwt';

function decodeClaims(claims: Record<string, unknown>) {
  const body = btoa(JSON.stringify(claims))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
  return decodeJwt(`header.${body}.signature`);
}

describe('decodeJwt', () => {
  it('decodes the payload of a base64url token', () => {
    const token = makeJwt({ sub: 'abc', permissions: ['employee:read'] });
    const payload = decodeJwt(token);
    expect(payload?.sub).toBe('abc');
    expect(payload?.permissions).toEqual(['employee:read']);
  });

  it('drops a claim of the wrong type instead of trusting it', () => {
    const payload = decodeClaims({ sub: 'abc', roles: 'admin', exp: true });
    expect(payload?.sub).toBe('abc');
    expect(payload?.roles).toBeUndefined();
    expect(payload?.exp).toBeUndefined();
  });

  it('keeps the valid entries of a list and drops only the bad ones', () => {
    const payload = decodeClaims({
      sub: 'abc',
      permissions: ['a:read', { x: 1 }, 7, 'b:read'],
      roles: ['ADMIN', null],
    });
    expect(payload?.permissions).toEqual(['a:read', 'b:read']);
    expect(payload?.roles).toEqual(['ADMIN']);
    expect(payload?.sub).toBe('abc');
  });

  it('accepts numeric ids as text, so a numeric sub is not lost', () => {
    const payload = decodeClaims({
      sub: 42,
      tenant_id: 7,
      permissions: ['a:read'],
    });
    expect(payload?.sub).toBe('42');
    expect(payload?.tenant_id).toBe('7');
    expect(payload?.permissions).toEqual(['a:read']);
  });

  it('rejects ids that are not a string or a finite number', () => {
    const payload = decodeClaims({ sub: { id: 1 }, tenant_id: [1], jti: null });
    expect(payload?.sub).toBeUndefined();
    expect(payload?.tenant_id).toBeUndefined();
    expect(payload?.jti).toBeUndefined();
  });

  it('reads exp and iat from a number or a numeric string only', () => {
    const payload = decodeClaims({ exp: '1999999999', iat: 'soon' });
    expect(payload?.exp).toBe(1999999999);
    expect(payload?.iat).toBeUndefined();
  });

  it('keeps the string entries of the scopes map', () => {
    const payload = decodeClaims({
      scopes: { warehouse: 'read', other: ['a'], n: 3 },
    });
    expect(payload?.scopes).toEqual({ warehouse: 'read' });
    expect(decodeClaims({ scopes: ['a'] })?.scopes).toBeUndefined();
  });

  it('returns null for a malformed token', () => {
    expect(decodeJwt('not-a-jwt')).toBeNull();
    expect(decodeJwt('a.%%%.c')).toBeNull();
  });
});
