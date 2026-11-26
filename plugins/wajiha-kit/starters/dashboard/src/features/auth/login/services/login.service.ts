import { publicApi } from '@/api/client/public/public';
import { endpoints } from '@/constants/api';
import { env } from '@/env';
import type { LoginPayload, LoginResponse } from '@/types/auth';

export const loginService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await publicApi.post<LoginResponse>(
      endpoints.auth.login,
      payload,
      // Cookie mode: let the browser store the HttpOnly refresh cookie the
      // backend sets on a cross-origin response.
      { authBase: true, withCredentials: env.VITE_AUTH_REFRESH === 'cookie' },
    );
    return data;
  },
};
