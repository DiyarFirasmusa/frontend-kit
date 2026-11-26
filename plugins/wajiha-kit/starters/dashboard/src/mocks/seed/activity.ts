import type { RecentChange } from '@/types/api/overview';
import { isoDaysAgo } from './base';
/** Recent changes shown on the home page. Warehouse changes made in the UI are added by the audit log. */
import { categories } from './categories';
import { suppliers } from './suppliers';
import { unitsOfMeasure } from './units';
import { warehouses } from './warehouses';

type Row = { id: string; name: string | null };

const SOURCES: readonly {
  resource: RecentChange['resource'];
  rows: readonly Row[];
}[] = [
  { resource: 'supplier', rows: suppliers },
  { resource: 'unit', rows: unitsOfMeasure },
  { resource: 'category', rows: categories },
  { resource: 'warehouse', rows: warehouses },
];

const ACTIONS: readonly RecentChange['action'][] = [
  'created',
  'updated',
  'updated',
  'created',
];

export const seededChanges: RecentChange[] = Array.from(
  { length: 12 },
  (_, i) => {
    const source = SOURCES[i % SOURCES.length];
    const row = source?.rows[Math.floor(i / SOURCES.length) + 1];
    return {
      id: `seed-change-${i}`,
      resource: source?.resource ?? 'supplier',
      recordId: row?.id ?? '',
      name: row?.name ?? '',
      action: ACTIONS[i % ACTIONS.length] ?? 'updated',
      at: isoDaysAgo(Math.floor(i / 3), 17 - i, 10 + i),
    };
  },
);
