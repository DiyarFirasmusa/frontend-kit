import { createRoute, type AnyRoute } from '@tanstack/react-router';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { publicEnv } from '@/shared/env/public-env';
import { useToastStore } from '@/shared/store/toast-store';
import { tt } from '@/test/i18n';
import { server } from '@/test/msw-server';
import { screen, waitFor } from '@/test/render';
import { renderRoutes } from '@/test/render-router';
import { endpoints } from '../api/endpoints';
import { useAuthStore } from '../store/auth-store';
import { usePermissionStore } from '../store/permission-store';
import { startSession } from '../store/session';
import { UserMenu } from './user-menu';

function menuRoutes(root: AnyRoute) {
  const admin = createRoute({ getParentRoute: () => root, path: '/$locale/admin' });
  const home = createRoute({
    getParentRoute: () => admin,
    path: '/',
    component: () => <UserMenu locale="en" />,
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
  const settings = createRoute({
    getParentRoute: () => admin,
    path: 'settings',
    component: () => <p>settings page</p>,
  });
  return [admin.addChildren([home, login, settings])];
}

function signIn() {
  startSession({
    accessToken: 'mock-token-admin-abc',
    user: { id: 'u1', username: 'sara', name: 'Sara Ahmed' },
    roles: ['admin'],
    permissions: [],
  });
}

const logoutUrl = `${publicEnv.VITE_ADMIN_API_URL}${endpoints.auth.logout}`;

async function openMenu() {
  const mounted = await renderRoutes(menuRoutes, { url: '/en/admin' });
  await mounted.user.click(await screen.findByRole('button', { name: /Sara Ahmed/u }));
  return mounted;
}

describe('<UserMenu>', () => {
  it('shows the signed-in name', async () => {
    signIn();
    await renderRoutes(menuRoutes, { url: '/en/admin' });
    expect(await screen.findByRole('button', { name: /Sara Ahmed/u })).toBeInTheDocument();
  });

  it('opens settings', async () => {
    signIn();
    const { user, router } = await openMenu();
    await user.click(await screen.findByRole('menuitem', { name: tt('admin.navSettings') }));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/en/admin/settings');
    });
  });

  it('signs out: tells the backend with the old token, forgets the session, lands on login', async () => {
    signIn();
    const seen: Array<string | null> = [];
    server.use(
      http.post(logoutUrl, ({ request }) => {
        seen.push(request.headers.get('Authorization'));
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { user, router } = await openMenu();
    await user.click(await screen.findByRole('menuitem', { name: tt('admin.signOut') }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/en/admin/login');
    });
    // A deliberate sign-out carries no "session ended" reason and no return address.
    expect(router.state.location.search).toEqual({});
    expect(useAuthStore.getState()).toMatchObject({ user: null, accessToken: null });
    expect(usePermissionStore.getState().roles).toEqual([]);
    await waitFor(() => {
      expect(seen).toEqual(['Bearer mock-token-admin-abc']);
    });
  });

  it('still signs out when the backend fails, and shows no error toast', async () => {
    signIn();
    server.use(http.post(logoutUrl, () => HttpResponse.json({ message: 'down' }, { status: 500 })));
    const { user, router } = await openMenu();
    await user.click(await screen.findByRole('menuitem', { name: tt('admin.signOut') }));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/en/admin/login');
    });
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useToastStore.getState().toasts).toEqual([]);
  });
});
