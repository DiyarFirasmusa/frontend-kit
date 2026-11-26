import { getAdminQueryClient } from '../lib/query-client';
import { overviewQueryOptions } from './use-overview';

/** The overview route's loader: starts the numbers' request, awaits nothing (see suppliers/prefetch.ts). */
export function prefetchOverview(): void {
  void getAdminQueryClient().prefetchQuery(overviewQueryOptions());
}
