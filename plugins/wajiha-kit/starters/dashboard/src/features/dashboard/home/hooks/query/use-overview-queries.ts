import { useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import {
  fetchActivity,
  fetchOverviewSummary,
  fetchRecentChanges,
} from '../../services/overview.service';

export function useOverviewSummary() {
  return useQuery({
    queryKey: qk.overview.summary,
    queryFn: ({ signal }) => fetchOverviewSummary({ signal }),
  });
}

export function useActivityTrend(days: number) {
  return useQuery({
    queryKey: qk.overview.activity(days),
    queryFn: ({ signal }) => fetchActivity(days, { signal }),
  });
}

export function useRecentChanges(limit: number) {
  return useQuery({
    queryKey: qk.overview.recent(limit),
    queryFn: ({ signal }) => fetchRecentChanges(limit, { signal }),
  });
}
