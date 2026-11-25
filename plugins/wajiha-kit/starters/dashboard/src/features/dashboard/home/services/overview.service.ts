import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type {
  ActivityTrend,
  OverviewSummary,
  RecentChange,
} from '../types/types';

export async function fetchOverviewSummary(): Promise<OverviewSummary> {
  const { data } = await privateApi.get<OverviewSummary>(
    endpoints.overview.summary,
  );
  return data;
}

export async function fetchActivity(days: number): Promise<ActivityTrend> {
  const { data } = await privateApi.get<ActivityTrend>(
    endpoints.overview.activity,
    { params: { days } },
  );
  return data;
}

export async function fetchRecentChanges(
  limit: number,
): Promise<RecentChange[]> {
  const { data } = await privateApi.get<RecentChange[]>(
    endpoints.overview.recent,
    { params: { limit } },
  );
  return data;
}
