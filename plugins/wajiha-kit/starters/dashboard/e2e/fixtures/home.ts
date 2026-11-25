import { API_BASE_URL, type MockApi } from './app';

/** Local wall-clock time `daysAgo` days before today, so relative labels stay stable. */
const at = (daysAgo: number, hours: number, minutes: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

const kpi = (value: number, changePercent: number, trend: number[]) => ({
  value,
  previousValue: null,
  changePercent,
  trend,
});

const SUMMARY_BODY = {
  generatedAt: new Date().toISOString(),
  warehouses: kpi(7, 16.7, [4, 4, 5, 5, 6, 6, 7]),
  suppliers: kpi(25, 4.2, [20, 21, 22, 22, 24, 24, 25]),
  categories: kpi(31, 0, [31, 31, 31, 31, 31, 31, 31]),
  units: kpi(12, -8.3, [13, 13, 13, 12, 12, 12, 12]),
};

const ACTIVITY_BODY = {
  from: '2026-01-01',
  to: '2026-01-30',
  created: 210,
  updated: 340,
  changePercent: 12.5,
  days: Array.from({ length: 30 }, (_, i) => ({
    date: `2026-01-${String(i + 1).padStart(2, '0')}`,
    created: 4 + (i % 7),
    updated: 8 + (i % 5),
  })),
};

const RECENT_BODY = [
  {
    id: 'c1',
    resource: 'supplier',
    recordId: 's1',
    name: 'مورد الرافدين',
    action: 'created',
    at: at(0, 9, 30),
  },
  {
    id: 'c2',
    resource: 'warehouse',
    recordId: 'w1',
    name: 'مخزن بغداد المركزي',
    action: 'updated',
    at: at(0, 8, 5),
  },
  {
    id: 'c3',
    resource: 'unit',
    recordId: 'u1',
    name: 'كرتونة',
    action: 'deleted',
    at: at(1, 16, 10),
  },
];

/** Registers API stubs for every home widget. */
export async function homeMocks(mockApi: MockApi): Promise<void> {
  await mockApi.json(`${API_BASE_URL}/api/overview/summary*`, SUMMARY_BODY);
  await mockApi.json(`${API_BASE_URL}/api/overview/activity*`, ACTIVITY_BODY);
  await mockApi.json(`${API_BASE_URL}/api/overview/recent*`, RECENT_BODY);
}
