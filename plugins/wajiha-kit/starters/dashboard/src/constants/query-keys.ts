import type { UseQueryOptions } from '@tanstack/react-query';

/** Cache window for read-mostly reference lookups (org units, titles, photos). */
export const REFERENCE_STALE_TIME_MS = 5 * 60 * 1000;
export const REFERENCE_GC_TIME_MS = 5 * 60 * 1000;

export const referenceQueryOptions = {
  staleTime: REFERENCE_STALE_TIME_MS,
  gcTime: REFERENCE_GC_TIME_MS,
} as const satisfies Pick<UseQueryOptions, 'staleTime' | 'gcTime'>;

export const qk = {
  search: {
    query: (q: string) => ['search', q] as const,
  },
  directory: {
    all: ['directory'] as const,
    entry: (id: string) => ['directory', id] as const,
    roles: (q: string) => ['directory', 'roles', q] as const,
    search: (kind: string, q: string) =>
      ['directory', 'search', kind, q] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params: unknown) => ['notifications', 'list', params] as const,
  },
  auditLog: {
    all: ['audit-log'] as const,
    list: (params: unknown) => ['audit-log', 'list', params] as const,
  },
  me: {
    all: ['me'] as const,
  },
  warehouses: {
    all: ['warehouses'] as const,
    list: (params: unknown) => ['warehouses', 'list', params] as const,
    detail: (id: string) => ['warehouses', 'detail', id] as const,
    users: (id: string) => ['warehouses', 'users', id] as const,
    locations: (id: string) => ['warehouses', 'locations', id] as const,
  },
  unitsOfMeasure: {
    all: ['units-of-measure'] as const,
    list: (params: unknown) => ['units-of-measure', 'list', params] as const,
    detail: (id: string) => ['units-of-measure', 'detail', id] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: (params: unknown) => ['categories', 'list', params] as const,
    detail: (id: string) => ['categories', 'detail', id] as const,
    attributes: (id: string) => ['categories', 'attributes', id] as const,
  },
  attributes: {
    all: ['attributes'] as const,
    list: (params: unknown) => ['attributes', 'list', params] as const,
    detail: (id: string) => ['attributes', 'detail', id] as const,
  },
  suppliers: {
    all: ['suppliers'] as const,
    search: (params: unknown) => ['suppliers', 'search', params] as const,
    list: (params: unknown) => ['suppliers', 'list', params] as const,
  },
  workspace: ['workspace'] as const,
  overview: {
    summary: ['overview', 'summary'] as const,
    activity: (days: number) => ['overview', 'activity', days] as const,
    recent: (limit: number) => ['overview', 'recent', limit] as const,
  },
};
