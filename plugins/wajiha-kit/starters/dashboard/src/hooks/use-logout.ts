import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { cancelPendingRefresh } from '@/api/auth/refresh-token';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth-store';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async () => {
    const { refreshToken, accessToken, clear } = useAuthStore.getState();

    // Clear the session locally first: the user's own device must not
    // depend on the network to be signed out, and a pending refresh must
    // never be allowed to resolve into a session that was just cleared.
    cancelPendingRefresh();
    clear();

    // Best-effort, bounded server-side revocation — errors and timeouts
    // are ignored, the local sign-out already happened above. The access
    // token is passed explicitly since the store no longer holds one.
    // Fired before navigation so a failed navigate can never skip it.
    if (refreshToken) {
      authService.logout(refreshToken, accessToken).catch(() => {
        // no-op
      });
    }

    try {
      await router.navigate({ to: '/login', replace: true });
    } catch {
      // A failed client-side navigation must not leave the signed-out user
      // on a guarded page: fall back to a full load of the login route.
      window.location.assign('/login');
    } finally {
      // Cache clears after navigate so no guarded page refetches without a token.
      queryClient.clear();
    }
  };
}
