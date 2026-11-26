import { z } from 'zod';
import {
  looseText,
  pageSchema,
  pageSizeSchema,
  withFallback,
} from '@/lib/list-search';
import { UOM_DECIMALS, UOM_STATUSES } from '../types/types';

/**
 * The URL is the state of the list: page, size, sort, search and filters.
 * Every field falls back and has a default, so a bad shared link still opens
 * the list. `decimals` accepts a number too: the router JSON-parses
 * `?decimals=2` before the schema sees it.
 */
export const unitOfMeasureSearchSchema = z.object({
  page: pageSchema,
  pageSize: pageSizeSchema,
  sort: withFallback(z.string(), '').default(''),
  q: withFallback(looseText, '').default(''),
  status: withFallback(z.enum(UOM_STATUSES), 'all').default('all'),
  decimals: withFallback(
    z.preprocess(
      (value) => (typeof value === 'number' ? String(value) : value),
      z.enum(UOM_DECIMALS),
    ),
    'all',
  ).default('all'),
});

export type UnitOfMeasureSearch = z.infer<typeof unitOfMeasureSearchSchema>;

export const defaultUnitOfMeasureSearch: UnitOfMeasureSearch =
  unitOfMeasureSearchSchema.parse({});
