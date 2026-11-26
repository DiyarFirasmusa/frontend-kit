import { createRoute, type AnyRoute } from '@tanstack/react-router';
import { act, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createTestQueryClient } from '@/test/render';
import { renderRoutes } from '@/test/render-router';
import { emitSessionExpired } from '../api/session-events';
import { AdminRoot } from './admin-root';

const queryClient = createTestQueryClient();

/** A tiny admin: the real layout (AdminRoot), a page and the login page, with the login's search rules. */
function adminRoutes(root: AnyRoute) {
  const admin = createRoute({
    getParentRoute: () => root,
    path: '/$locale/admin',
    component: () => <AdminRoot locale="en" queryClient={queryClient} />,
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

describe('<AdminRoot> session expiry that came first', () => {
  it('moves to login when the 401 came back before the layout mounted (a loader prefetch on a hard reload)', async () => {
    // Nobody listens yet: the API layer clears the session and announces the expiry into the void.
    expect(emitSessionExpired()).toBe(false);
    const { router } = await renderRoutes(adminRoutes, { url: '/en/admin/suppliers?page=2' });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/en/admin/login');
    });
    expect(router.state.location.search).toEqual({
      redirect: '/en/admin/suppliers?page=2',
      reason: 'expired',
    });
  });

  it('does not send anyone to login when nothing expired', async () => {
    const { router } = await renderRoutes(adminRoutes, { url: '/en/admin/suppliers' });
    expect(router.state.location.pathname).toBe('/en/admin/suppliers');
  });
});
