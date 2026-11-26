import { z } from 'zod';
import { withFallback } from '@/lib/list-search';
import { WAREHOUSE_DETAIL_TABS } from '../types/types';

/** The open tab is in the URL; a bad value falls back to the overview. */
export const warehouseDetailSearchSchema = z.object({
  tab: withFallback(z.enum(WAREHOUSE_DETAIL_TABS), 'overview').default(
    'overview',
  ),
});

export type WarehouseDetailSearch = z.infer<typeof warehouseDetailSearchSchema>;

export const defaultWarehouseDetailSearch: WarehouseDetailSearch =
  warehouseDetailSearchSchema.parse({});
