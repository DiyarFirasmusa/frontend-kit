import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type { MeResponse } from '@/types/api/me';

export async function fetchMe(
  options: { signal?: AbortSignal; silentError?: boolean } = {},
): Promise<MeResponse> {
  const { data } = await privateApi.get<MeResponse>(endpoints.auth.me, {
    signal: options.signal,
    silentError: options.silentError,
  });
  return data;
}
