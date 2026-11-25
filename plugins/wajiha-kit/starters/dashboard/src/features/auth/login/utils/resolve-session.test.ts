import { describe, expect, it } from 'vitest';
import { makeJwt } from '@/test/fixtures/auth';
import { resolveLoginSession } from './resolve-session';

describe('resolveLoginSession', () => {
  it('reads user, tenant and roles from the token when the body has only tokens and permissions', () => {
    const access = makeJwt({
      sub: 'user-9',
      tenant_id: 'tenant-9',
      roles: ['SUPERADMIN'],
    });

    expect(
      resolveLoginSession({
        access,
        refresh: 'r',
        permissions: ['employee:read'],
      }),
    ).toEqual({
      userId: 'user-9',
      tenantId: 'tenant-9',
      roles: ['SUPERADMIN'],
      permissions: ['employee:read'],
    });
  });

  it('prefers the body fields when the service sends them', () => {
    const access = makeJwt({ sub: 'from-token', roles: ['TOKEN_ROLE'] });

    expect(
      resolveLoginSession({
        access,
        refresh: 'r',
        userId: 'from-body',
        tenantId: 'tenant-body',
        roles: ['BODY_ROLE'],
        permissions: ['a:read'],
      }),
    ).toMatchObject({
      userId: 'from-body',
      tenantId: 'tenant-body',
      roles: ['BODY_ROLE'],
    });
  });

  it('falls back to empty values for an undecodable token with a bare body', () => {
    expect(resolveLoginSession({ access: 'not-a-jwt', refresh: 'r' })).toEqual({
      userId: '',
      tenantId: null,
      roles: [],
      permissions: [],
    });
  });

  it('falls back to the token permissions when the body omits them', () => {
    const access = makeJwt({ permissions: ['item:read'] });

    expect(resolveLoginSession({ access, refresh: 'r' }).permissions).toEqual([
      'item:read',
    ]);
  });
});
