import type { AnyRouter } from '@tanstack/react-router';
import {
  refreshAccessToken,
  tokenHasPermissionClaims,
} from '@/api/auth/refresh-token';
import { registerSessionHooks } from '@/api/auth/session-hooks';
import { queryClient as appQueryClient } from '@/lib/query-client';
import { useAuthStore } from '@/store/auth-store';
import { usePermissionStore } from '@/store/permission-store';
import { restorePermissionsFromMe } from './bootstrap-session';

/* A page that keeps answering 403 must not turn into a refresh loop. */
const FORBIDDEN_RELOAD_GAP_MS = 30_000;

function permissionKey(): string {
  const { roles, permissions } = usePermissionStore.getState();
  return JSON.stringify([roles, permissions]);
}

interface SessionHookDeps {
  router: AnyRouter;
  queryClient?: typeof appQueryClient;
  now?: () => number;
}

/**
 * Wires the API layer's session events to the router and the query cache.
 * Called once in main.tsx after the router exists; returns the unregister
 * function (tests and hot reload).
 */
export function installSessionHooks({
  router,
  queryClient = appQueryClient,
  now = Date.now,
}: SessionHookDeps): () => void {
  let lastForbiddenReload = Number.NEGATIVE_INFINITY;

  return registerSessionHooks({
    onSessionExpired: () => {
      const { href, pathname } = router.state.location;
      const search = pathname.startsWith('/login') ? {} : { redirect: href };
      // The cache is cleared after the guarded page has left, so it cannot
      // refetch without a token; the next user never sees this one's data.
      void router
        .navigate({ to: '/login', search, replace: true })
        .finally(() => {
          queryClient.clear();
        });
    },
    onForbidden: () => {
      const time = now();
      if (time - lastForbiddenReload < FORBIDDEN_RELOAD_GAP_MS) {
        return;
      }
      lastForbiddenReload = time;
      const before = permissionKey();
      const { accessToken } = useAuthStore.getState();
      const reload =
        accessToken && tokenHasPermissionClaims(accessToken)
          ? refreshAccessToken().then(() => null)
          : restorePermissionsFromMe();
      void reload.then(async () => {
        // Guards read permissions with getState(); re-run them only when
        // the answer can be different.
        if (permissionKey() !== before) {
          await router.invalidate();
        }
      });
    },
  });
}
