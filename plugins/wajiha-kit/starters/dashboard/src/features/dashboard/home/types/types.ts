export type {
  ActivityDay,
  ActivityTrend,
  ChangeAction,
  ChangeResource,
  KpiCard,
  OverviewSummary,
  RecentChange,
} from '@/types/api/overview';
import type { StaticRoutePath } from '@/types/routes';

/** Where a home card or panel link goes: a page without parameters (from the route tree). */
export interface HomeLink {
  to: StaticRoutePath;
}

export interface HomeWidgetState<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
}

export const HOME_QUERY_DEFAULTS = {
  activityDays: 30,
  recentLimit: 6,
} as const;
