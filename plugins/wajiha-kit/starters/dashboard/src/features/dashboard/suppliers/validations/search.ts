import { z } from 'zod';
import {
  looseText,
  pageSchema,
  pageSizeSchema,
  withFallback,
} from '@/lib/list-search';
import { SUPPLIER_STATUSES } from '../types/types';

/**
 * The URL is the state of the list: page, size, sort, search and filters.
 * Every field falls back (`withFallback`) and has a default, so a bad or partial
 * shared link still opens the list.
 */
export const supplierSearchSchema = z.object({
  page: pageSchema,
  pageSize: pageSizeSchema,
  sort: withFallback(z.string(), '').default(''),
  q: withFallback(looseText, '').default(''),
  status: withFallback(z.enum(SUPPLIER_STATUSES), 'all').default('all'),
});

export type SupplierSearch = z.infer<typeof supplierSearchSchema>;

export const defaultSupplierSearch: SupplierSearch = supplierSearchSchema.parse(
  {},
);
