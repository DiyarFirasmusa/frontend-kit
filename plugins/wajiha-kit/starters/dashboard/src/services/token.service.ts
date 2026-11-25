import { publicApi } from '@/api/client/public/public';
import { endpoints } from '@/constants/api';
import type { RefreshResponse } from '@/types/auth';

export const tokenService = {
  async refresh(
    refresh: string,
    signal?: AbortSignal,
  ): Promise<RefreshResponse> {
    const { data } = await publicApi.post<RefreshResponse>(
      endpoints.auth.refresh,
      { refresh },
      { authBase: true, silent: true, silentError: true, signal },
    );
    return data;
  },
};
