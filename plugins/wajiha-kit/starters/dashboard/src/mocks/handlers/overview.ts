/** Home page: totals, activity over time and recent changes. */
import { http } from 'msw';
import { endpoints } from '@/constants/api';
import type {
  ActivityDay,
  ActivityTrend,
  KpiCard,
  OverviewSummary,
  RecentChange,
} from '@/features/dashboard/home/types/types';
import { api, intParam, nowIso, ok } from '../core';
import { seededChanges } from '../seed/activity';
import { DAY_MS, hashString, seededRandom, toLocalDate } from '../seed/base';
import { categories } from '../seed/categories';
import { auditLog } from '../seed/misc';
import { suppliers } from '../seed/suppliers';
import { unitsOfMeasure } from '../seed/units';
import { warehouses } from '../seed/warehouses';

/** A total with a small, stable history so the card sparklines look alive. */
function kpi(key: string, value: number): KpiCard {
  const random = seededRandom(hashString(key));
  const trend = Array.from({ length: 12 }, (_, i) =>
    Math.max(
      0,
      Math.round(value * (0.55 + (i / 11) * 0.45) + (random() - 0.5) * 2),
    ),
  );
  trend[trend.length - 1] = value;
  const previousValue = trend.at(-2) ?? value;
  const changePercent =
    previousValue === 0
      ? null
      : ((value - previousValue) / previousValue) * 100;
  return { value, previousValue, changePercent, trend };
}

function totalOf(rows: ActivityDay[]): number {
  return rows.reduce((total, row) => total + row.created + row.updated, 0);
}

function activity(days: number): ActivityTrend {
  const random = seededRandom(hashString(`activity:${days}`));
  const points: ActivityDay[] = Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.now() - (days - 1 - i) * DAY_MS);
    const weekend = date.getDay() === 5 || date.getDay() === 6;
    const base = weekend ? 3 : 14;
    return {
      date: toLocalDate(date),
      created: Math.round(base * (0.6 + random() * 0.8)),
      updated: Math.round(base * 1.4 * (0.5 + random())),
    };
  });
  const half = Math.floor(points.length / 2);
  const before = totalOf(points.slice(0, half));
  const after = totalOf(points.slice(half));
  return {
    from: points[0]?.date ?? null,
    to: points.at(-1)?.date ?? null,
    created: points.reduce((total, row) => total + row.created, 0),
    updated: points.reduce((total, row) => total + row.updated, 0),
    changePercent: before === 0 ? null : ((after - before) / before) * 100,
    days: points,
  };
}

/** Warehouse changes made in this session come from the audit log. */
function liveChanges(): RecentChange[] {
  return auditLog
    .filter((entry) => entry.entity === 'WAREHOUSE' && entry.entityId)
    .map((entry) => {
      const row = warehouses.find((w) => w.id === entry.entityId);
      return {
        id: `audit-${entry.id}`,
        resource: 'warehouse' as const,
        recordId: entry.entityId ?? '',
        name: row?.name ?? '',
        action:
          entry.action === 'CREATE'
            ? ('created' as const)
            : entry.action === 'DELETE'
              ? ('deleted' as const)
              : ('updated' as const),
        at: entry.changedAt ?? nowIso(),
      };
    });
}

export const overviewHandlers = [
  http.get(api(endpoints.overview.summary), async () => {
    const response: OverviewSummary = {
      generatedAt: nowIso(),
      warehouses: kpi('warehouses', warehouses.length),
      suppliers: kpi('suppliers', suppliers.length),
      categories: kpi('categories', categories.length),
      units: kpi('units', unitsOfMeasure.length),
    };
    return ok(response);
  }),

  http.get(api(endpoints.overview.activity), async ({ request }) => {
    const url = new URL(request.url);
    const days = Math.min(Math.max(intParam(url, 'days', 30), 1), 90);
    return ok(activity(days));
  }),

  http.get(api(endpoints.overview.recent), async ({ request }) => {
    const url = new URL(request.url);
    const limit = Math.min(Math.max(intParam(url, 'limit', 6), 1), 20);
    const rows = [...liveChanges(), ...seededChanges]
      .toSorted((a, b) => b.at.localeCompare(a.at))
      .slice(0, limit);
    return ok(rows);
  }),
];
