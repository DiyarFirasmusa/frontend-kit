import { describe, expect, it } from 'vitest';
import { PERMS } from '@/constants/permissions';
import { signIn } from '@/test/fixtures/auth';
import {
  getHomePath,
  requireAuth,
  requireGuest,
  requirePermission,
  safeRedirect,
} from './route-guards';

function redirectTarget(fn: () => void): string | undefined {
  try {
    fn();
    return undefined;
  } catch (error) {
    return (error as { options?: { to?: string } }).options?.to;
  }
}

describe('route guards', () => {
  it('requireAuth redirects a guest to /login', () => {
    expect(redirectTarget(requireAuth)).toBe('/login');
  });

  it('requireAuth lets a signed-in user through', () => {
    signIn();
    expect(redirectTarget(requireAuth)).toBeUndefined();
  });

  it('requireGuest redirects a signed-in user to /', () => {
    signIn();
    expect(redirectTarget(requireGuest)).toBe('/');
  });

  it('requirePermission redirects to /403 when the permission is missing', () => {
    signIn({ permissions: [] });
    expect(redirectTarget(() => requirePermission(PERMS.warehouse.view))).toBe(
      '/403',
    );
  });

  it('requirePermission passes when the permission is present', () => {
    signIn({ permissions: [PERMS.warehouse.view] });
    expect(
      redirectTarget(() => requirePermission(PERMS.warehouse.view)),
    ).toBeUndefined();
  });

  it('getHomePath is the dashboard root', () => {
    signIn({ permissions: [PERMS.warehouse.view] });
    expect(getHomePath()).toBe('/');
  });

  it('requireAuth sends the current location along as ?redirect', () => {
    try {
      requireAuth({ href: '/suppliers?q=steel' });
      expect.unreachable();
    } catch (error) {
      expect(error).toMatchObject({
        options: { to: '/login', search: { redirect: '/suppliers?q=steel' } },
      });
    }
  });
});

describe('safeRedirect', () => {
  it.each([
    ['/suppliers', '/suppliers'],
    ['/suppliers?q=steel#top', '/suppliers?q=steel#top'],
    ['/warehouses/w-1', '/warehouses/w-1'],
  ])('keeps the same-app path %s', (value, expected) => {
    expect(safeRedirect(value)).toBe(expected);
  });

  it.each([
    undefined,
    42,
    '',
    'suppliers',
    '//evil.example',
    '/\\evil.example',
    '/\t/evil.example',
    'https://evil.example',
    'javascript:alert(1)',
    '/login',
    '/login?redirect=/x',
    '/login/',
  ])('turns %j into the home path', (value) => {
    expect(safeRedirect(value)).toBe('/');
  });
});
