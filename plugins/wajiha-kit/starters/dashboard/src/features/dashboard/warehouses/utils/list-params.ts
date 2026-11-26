import type { WarehouseListParams } from '../types/types';
import type { WarehouseSearch } from '../validations/search';

/** Only the fields the request uses: loaderDeps and the query key both come from here. */
export function toWarehouseListParams(
  search: WarehouseSearch,
): WarehouseListParams {
  return {
    page: search.page,
    pageSize: search.pageSize,
    sort: search.sort,
    q: search.q,
    status: search.status,
    type: search.type,
  };
}
