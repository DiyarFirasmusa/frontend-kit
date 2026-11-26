import { createRoute, type AnyRoute } from '@tanstack/react-router';
import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderRoutes } from '@/test/render-router';
import { emitSessionExpired } from '../api/session-events';
import { AdminRoot } from './admin-root';

/** A tiny admin: the real layout (AdminRoot), a page and the login page, with the login's search rules. */
function adminRoutes(root: AnyRoute) {
  const admin = createRoute({
    getParentRoute: () => root,
    path: '/$locale/admin',
    component: () => <AdminRoot locale="en" />,
  });
  const suppliers = createRoute({
    getParentRoute: () => admin,
    path: 'suppliers',
    validateSearch: (raw: Record<string, unknown>) =>
      typeof raw['page'] === 'string' || typeof raw['page'] === 'number'
        ? { page: Number(raw['page']) }
        : {},
    component: () => <p>suppliers page</p>,
  });
  const login = createRoute({
    getParentRoute: () => admin,
    path: 'login',
    validateSearch: (raw: Record<string, unknown>) => ({
      ...(typeof raw['redirect'] === 'string' ? { redirect: raw['redirect'] } : {}),
      ...(typeof raw['reason'] === 'string' ? { reason: raw['reason'] } : {}),
    }),
    component: () => <p>login page</p>,
  });
  return [admin.addChildren([suppliers, login])];
}

describe('<AdminRoot> session expiry', () => {
  it('sends the user to login with the page they were on and a reason', async () => {
    const { router } = await renderRoutes(adminRoutes, { url: '/en/admin/suppliers?page=2' });
    await act(async () => {
      emitSessionExpired();
      await router.invalidate();
    });
    const { pathname, search } = router.state.location;
    expect(pathname).toBe('/en/admin/login');
    expect(search).toEqual({ redirect: '/en/admin/suppliers?page=2', reason: 'expired' });
  });

  it('ignores a second 401 that arrives while the login page is showing', async () => {
    const { router } = await renderRoutes(adminRoutes, { url: '/en/admin/suppliers?page=2' });
    await act(async () => {
      emitSessionExpired();
      await router.invalidate();
    });
    const first = router.state.location.href;
    await act(async () => {
      emitSessionExpired();
      emitSessionExpired();
      await router.invalidate();
    });
    // Not "login?redirect=/en/admin/login?...": the return address stays the page the user left.
    expect(router.state.location.href).toBe(first);
  });
});
