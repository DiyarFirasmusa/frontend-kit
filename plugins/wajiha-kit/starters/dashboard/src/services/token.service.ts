import { z } from 'zod';
import { publicApi } from '@/api/client/public/public';
import { endpoints } from '@/constants/api';
import { env } from '@/env';
import type { RefreshResponse } from '@/types/auth';

/* Generated types check nothing at run time; a session must not be built on
   a body that only looks like tokens. */
const refreshResponseSchema = z.object({
  access: z.string().min(1),
  refresh: z.string().min(1).optional(),
});

export const tokenService = {
  /**
   * Cookie mode sends no token: the browser attaches the HttpOnly refresh
   * cookie (`withCredentials`). Session mode sends `{ refresh }`.
   */
  async refresh(
    refresh: string | null,
    signal?: AbortSignal,
  ): Promise<RefreshResponse> {
    const useCookie = env.VITE_AUTH_REFRESH === 'cookie';
    const { data } = await publicApi.post<unknown>(
      endpoints.auth.refresh,
      useCookie ? undefined : { refresh },
      {
        authBase: true,
        silent: true,
        silentError: true,
        signal,
        withCredentials: useCookie,
      },
    );
    return refreshResponseSchema.parse(data);
  },
};
