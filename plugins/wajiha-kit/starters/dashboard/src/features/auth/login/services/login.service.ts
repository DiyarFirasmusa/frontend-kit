import { publicApi } from '@/api/client/public/public';
import { endpoints } from '@/constants/api';
import type { LoginPayload, LoginResponse } from '@/types/auth';

export const loginService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await publicApi.post<LoginResponse>(
      endpoints.auth.login,
      payload,
      { authBase: true },
    );
    return data;
  },
};
