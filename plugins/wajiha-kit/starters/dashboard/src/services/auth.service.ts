import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type { ChangePasswordPayload } from '@/types/auth';

export const authService = {
  // Backend /logout 302-redirects instead of returning JSON; skipAuthHandling
  // stops the resulting 401 from triggering the shared client's own refresh/redirect.
  // accessToken is passed explicitly because this is called after the local
  // session is already cleared (see useLogout), so the store no longer has
  // one for the request interceptor to attach.
  async logout(refresh: string, accessToken?: string | null): Promise<void> {
    await privateApi.post(
      endpoints.auth.logout,
      { refresh },
      {
        authBase: true,
        silent: true,
        skipAuthHandling: true,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
    );
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await privateApi.post(endpoints.auth.changePassword, payload, {
      authBase: true,
    });
  },
};
