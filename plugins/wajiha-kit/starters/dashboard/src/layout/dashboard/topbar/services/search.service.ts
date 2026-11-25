import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type { GlobalSearchResponse } from '../types/types';

export const SEARCH_LIMIT = 5;

export async function fetchGlobalSearch(
  q: string,
  signal?: AbortSignal,
): Promise<GlobalSearchResponse> {
  const { data } = await privateApi.get<GlobalSearchResponse>(
    endpoints.search.query,
    { params: { q, limit: SEARCH_LIMIT }, signal, silentError: true },
  );
  return data;
}
