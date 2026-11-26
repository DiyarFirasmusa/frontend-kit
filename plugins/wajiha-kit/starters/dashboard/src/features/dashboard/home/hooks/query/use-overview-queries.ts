import { useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import {
  fetchActivity,
  fetchOverviewSummary,
  fetchRecentChanges,
} from '../../services/overview.service';

export function useOverviewSummary(enabled = true) {
  return useQuery({
    enabled,
    queryKey: qk.overview.summary,
    queryFn: ({ signal }) => fetchOverviewSummary({ signal }),
  });
}

export function useActivityTrend(days: number, enabled = true) {
  return useQuery({
    enabled,
    queryKey: qk.overview.activity(days),
    queryFn: ({ signal }) => fetchActivity(days, { signal }),
  });
}

export function useRecentChanges(limit: number, enabled = true) {
  return useQuery({
    enabled,
    queryKey: qk.overview.recent(limit),
    queryFn: ({ signal }) => fetchRecentChanges(limit, { signal }),
  });
}
