/** A number with how it moved: one card on the home page. */
export interface KpiCard {
  value: number | null;
  previousValue: number | null;
  changePercent: number | null;
  trend: number[] | null;
}

export interface OverviewSummary {
  generatedAt: string | null;
  warehouses: KpiCard | null;
  suppliers: KpiCard | null;
  categories: KpiCard | null;
  units: KpiCard | null;
}

export interface ActivityDay {
  date: string | null;
  created: number;
  updated: number;
}

export interface ActivityTrend {
  from: string | null;
  to: string | null;
  created: number;
  updated: number;
  changePercent: number | null;
  days: ActivityDay[] | null;
}

export type ChangeResource = 'warehouse' | 'supplier' | 'category' | 'unit';
export type ChangeAction = 'created' | 'updated' | 'deleted';

export interface RecentChange {
  id: string;
  resource: ChangeResource;
  recordId: string;
  name: string;
  action: ChangeAction;
  at: string;
}

/** Where a home card or panel link goes: always one of the list pages. */
export interface HomeLink {
  to: '/warehouses' | '/suppliers' | '/categories' | '/units-of-measure';
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
