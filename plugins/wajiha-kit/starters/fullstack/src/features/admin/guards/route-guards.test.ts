import { afterEach, describe, expect, it } from 'vitest';
import { PERMS } from '../constants/permissions';
import { useAuthStore } from '../store/auth-store';
import { usePermissionStore } from '../store/permission-store';
import { requireAuth, requireGuest, requirePermission, safeReturnPath } from './route-guards';

function signIn(permissions: string[] = []): void {
  useAuthStore.getState().setSession({
    user: { id: 'u1', username: 'demo', name: 'Demo' },
    accessToken: 'token',
  });
  usePermissionStore.getState().setPermissions({ permissions, roles: [] });
}

/** The redirect TanStack Router throws, read without depending on its internal class. */
function redirectOf(run: () => void): { to?: string; search?: unknown } | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    const options = (error as { options?: { to?: string; search?: unknown } }).options;
    return options;
  }
}

afterEach(() => {
  useAuthStore.getState().clear();
});

describe('admin route guards', () => {
  it('sends a visitor without a session to the login page with a way back', () => {
    expect(redirectOf(() => requireAuth('en', '/en/admin/suppliers'))).toMatchObject({
      to: '/$locale/admin/login',
      search: { redirect: '/en/admin/suppliers' },
    });
  });

  it('lets a signed-in user through and keeps them off the login page', () => {
    signIn();
    expect(redirectOf(() => requireAuth('ar', '/ar/admin'))).toBeUndefined();
    expect(redirectOf(() => requireGuest('ar'))).toMatchObject({ to: '/$locale/admin' });
  });

  it('sends a user without the permission to the no-access page', () => {
    signIn([PERMS.supplier.read]);
    expect(redirectOf(() => requirePermission('en', PERMS.supplier.read))).toBeUndefined();
    expect(redirectOf(() => requirePermission('en', PERMS.supplier.delete))).toMatchObject({
      to: '/$locale/admin/forbidden',
    });
  });
});

describe('safeReturnPath', () => {
  it('keeps a path inside the admin', () => {
    expect(safeReturnPath('en', '/en/admin/suppliers?page=2')).toBe('/en/admin/suppliers?page=2');
    expect(safeReturnPath('ar', '/ar/admin')).toBe('/ar/admin');
  });

  it('refuses other sites, the public pages and look-alike paths', () => {
    expect(safeReturnPath('en', 'https://evil.example/en/admin')).toBe('/en/admin');
    expect(safeReturnPath('en', '//evil.example')).toBe('/en/admin');
    expect(safeReturnPath('en', '/en/about')).toBe('/en/admin');
    expect(safeReturnPath('en', '/en/administrator')).toBe('/en/admin');
    expect(safeReturnPath('en', '/en/admin/login')).toBe('/en/admin');
    expect(safeReturnPath('en', undefined)).toBe('/en/admin');
  });

  it('resolves dot-segments before checking, so they cannot climb out of the admin', () => {
    expect(safeReturnPath('en', '/en/admin/../../x')).toBe('/en/admin');
    expect(safeReturnPath('en', '/en/admin/%2e%2e/en')).toBe('/en/admin');
    expect(safeReturnPath('en', '/en/admin/suppliers/../settings')).toBe('/en/admin/settings');
    expect(safeReturnPath('en', '/en/admin\\evil')).toBe('/en/admin');
  });

  it('moves a path written for the other language into this one (the language switcher keeps ?redirect=)', () => {
    expect(safeReturnPath('ar', '/en/admin/suppliers?page=2')).toBe('/ar/admin/suppliers?page=2');
    expect(safeReturnPath('ar', '/en/administrator')).toBe('/ar/admin');
  });

  it('never returns to the login page, however it is spelled', () => {
    expect(safeReturnPath('en', '/en/admin/login?redirect=%2Fen%2Fadmin')).toBe('/en/admin');
    expect(safeReturnPath('en', '/en/admin/suppliers?next=/login')).toBe(
      '/en/admin/suppliers?next=/login',
    );
  });
});
