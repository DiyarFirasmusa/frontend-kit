import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type { MeResponse } from '@/types/api/me';

export async function fetchMe(): Promise<MeResponse> {
  const { data } = await privateApi.get<MeResponse>(endpoints.auth.me);
  return data;
}
