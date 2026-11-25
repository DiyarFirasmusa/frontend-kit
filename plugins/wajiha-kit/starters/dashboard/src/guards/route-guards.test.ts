import { describe, expect, it } from 'vitest';
import { PERMS } from '@/constants/permissions';
import { signIn } from '@/test/fixtures/auth';
import {
  getHomePath,
  requireAuth,
  requireGuest,
  requirePermission,
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
    expect(redirectTarget(() => requirePermission(PERMS.warehouse.read))).toBe(
      '/403',
    );
  });

  it('requirePermission passes when the permission is present', () => {
    signIn({ permissions: [PERMS.warehouse.read] });
    expect(
      redirectTarget(() => requirePermission(PERMS.warehouse.read)),
    ).toBeUndefined();
  });

  it('getHomePath is the dashboard root', () => {
    signIn({ permissions: [PERMS.warehouse.read] });
    expect(getHomePath()).toBe('/');
  });
});
