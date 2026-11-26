import { z } from 'zod';
import { looseText, withFallback } from '@/lib/list-search';

/**
 * The URL is the state of the tree page: the search text and the selected
 * category (an id, or `all` for the "All items" row; empty = the first
 * category). Both fall back, so a bad shared link still opens the page. Ids go
 * through `looseText`: the router would parse an all-digit id as a number.
 */
export const categorySearchSchema = z.object({
  q: withFallback(looseText, '').default(''),
  category: withFallback(looseText, '').default(''),
});

export type CategorySearch = z.infer<typeof categorySearchSchema>;

export const defaultCategorySearch: CategorySearch = categorySearchSchema.parse(
  {},
);
