import { QueryClient } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { HttpResponse, http } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import { useAuthStore } from '@/store/auth-store';
import { usePermissionStore } from '@/store/permission-store';
import { makeJwt, signIn } from '@/test/fixtures/auth';
import { api, authApi } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { installSessionHooks } from './session-hooks';

function makeRouter(initialPath: string) {
  const rootRoute = createRootRoute();
  const routes = ['/', '/suppliers', '/login'].map((path) =>
    createRoute({ getParentRoute: () => rootRoute, path }),
  );
  return createRouter({
    routeTree: rootRoute.addChildren(routes),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

let uninstall: (() => void) | null = null;

afterEach(() => {
  uninstall?.();
  uninstall = null;
});

describe('installSessionHooks', () => {
  it('on a rejected refresh clears the stores and the query cache and goes to /login with the current page', async () => {
    const router = makeRouter('/suppliers?q=steel');
    await router.load();
    const queryClient = new QueryClient();
    queryClient.setQueryData(['suppliers', 'list'], [{ id: 's-1' }]);
    uninstall = installSessionHooks({ router, queryClient });
    signIn({ permissions: ['supplier:read'] });
    server.use(
      http.get(api('/v1/secure'), () =>
        HttpResponse.json({ message: 'expired' }, { status: 401 }),
      ),
      http.post(authApi(endpoints.auth.refresh), () =>
        HttpResponse.json({ message: 'revoked' }, { status: 401 }),
      ),
    );

    await expect(privateApi.get('/v1/secure')).rejects.toBeDefined();

    await vi.waitFor(() => {
      expect(router.state.location.pathname).toBe('/login');
    });
    expect(router.state.location.search).toEqual({
      redirect: '/suppliers?q=steel',
    });
    await vi.waitFor(() => {
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    });
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(usePermissionStore.getState().permissions).toEqual([]);
  });

  it('on a 403 reloads the permissions and re-runs the guards when they changed', async () => {
    const router = makeRouter('/');
    await router.load();
    const invalidate = vi.spyOn(router, 'invalidate');
    uninstall = installSessionHooks({ router, now: () => 1_000_000 });
    signIn({ permissions: ['supplier:read', 'supplier:delete'] });
    let refreshCalls = 0;
    server.use(
      http.delete(api('/v1/suppliers/1'), () =>
        HttpResponse.json({ message: 'denied' }, { status: 403 }),
      ),
      http.post(authApi(endpoints.auth.refresh), () => {
        refreshCalls += 1;
        return HttpResponse.json({
          access: makeJwt({ roles: [], permissions: ['supplier:read'] }),
          refresh: 'rotated',
        });
      }),
    );

    await expect(privateApi.delete('/v1/suppliers/1')).rejects.toBeDefined();
    await expect(privateApi.delete('/v1/suppliers/1')).rejects.toBeDefined();

    await vi.waitFor(() => {
      expect(invalidate).toHaveBeenCalledTimes(1);
    });
    expect(refreshCalls).toBe(1);
    expect(usePermissionStore.getState().permissions).toEqual([
      'supplier:read',
    ]);
    expect(useAuthStore.getState().accessToken).not.toBeNull();
  });
});
