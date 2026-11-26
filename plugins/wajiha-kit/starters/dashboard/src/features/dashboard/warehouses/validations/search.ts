import { z } from 'zod';
import {
  looseText,
  pageSchema,
  pageSizeSchema,
  withFallback,
} from '@/lib/list-search';
import { WAREHOUSE_STATUSES, WAREHOUSE_TYPES } from '../types/types';

/**
 * The URL is the state of the list: page, size, sort, search and filters.
 * Every field falls back and has a default, so a bad shared link still opens
 * the list.
 */
export const warehouseSearchSchema = z.object({
  page: pageSchema,
  pageSize: pageSizeSchema,
  sort: withFallback(z.string(), '').default(''),
  q: withFallback(looseText, '').default(''),
  status: withFallback(z.enum(WAREHOUSE_STATUSES), 'all').default('all'),
  type: withFallback(z.enum(WAREHOUSE_TYPES), 'all').default('all'),
});

export type WarehouseSearch = z.infer<typeof warehouseSearchSchema>;

export const defaultWarehouseSearch: WarehouseSearch =
  warehouseSearchSchema.parse({});
