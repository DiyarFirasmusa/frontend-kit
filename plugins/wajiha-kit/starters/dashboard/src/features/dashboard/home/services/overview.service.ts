import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type {
  ActivityTrend,
  OverviewSummary,
  RecentChange,
} from '../types/types';

/** `signal` comes from TanStack Query, so a cancelled query aborts the request. */
interface RequestOptions {
  signal?: AbortSignal;
}

export async function fetchOverviewSummary(
  options?: RequestOptions,
): Promise<OverviewSummary> {
  const { data } = await privateApi.get<OverviewSummary>(
    endpoints.overview.summary,
    { signal: options?.signal },
  );
  return data;
}

export async function fetchActivity(
  days: number,
  options?: RequestOptions,
): Promise<ActivityTrend> {
  const { data } = await privateApi.get<ActivityTrend>(
    endpoints.overview.activity,
    { params: { days }, signal: options?.signal },
  );
  return data;
}

export async function fetchRecentChanges(
  limit: number,
  options?: RequestOptions,
): Promise<RecentChange[]> {
  const { data } = await privateApi.get<RecentChange[]>(
    endpoints.overview.recent,
    { params: { limit }, signal: options?.signal },
  );
  return data;
}
