import { getAdminQueryClient } from '../lib/query-client';
import { overviewQueryOptions } from '../overview/use-overview';
import { suppliersListParams, type SuppliersSearch } from './supplier-search';
import { suppliersListQueryOptions } from './use-supplier-queries';

// What a route loader starts while the page's code is still loading (and on hover, with defaultPreload:
// 'intent'). Nothing is awaited: the page renders at once with its own loading, error and empty states and
// finds the request already running, so a loader never blocks or replaces them. A failed prefetch is
// silent; the page asks again and shows the error itself.

export function prefetchSuppliers(search: SuppliersSearch): void {
  void getAdminQueryClient().prefetchQuery(suppliersListQueryOptions(suppliersListParams(search)));
}

export function prefetchOverview(): void {
  void getAdminQueryClient().prefetchQuery(overviewQueryOptions());
}
