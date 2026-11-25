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
    queryFn: fetchOverviewSummary,
  });
}

export function useActivityTrend(days: number) {
  return useQuery({
    queryKey: qk.overview.activity(days),
    queryFn: () => fetchActivity(days),
  });
}

export function useRecentChanges(limit: number) {
  return useQuery({
    queryKey: qk.overview.recent(limit),
    queryFn: () => fetchRecentChanges(limit),
  });
}
