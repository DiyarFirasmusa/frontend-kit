// Hand-written mirror of the demo backend's overview schemas (the home page and the mock backend share them).
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
