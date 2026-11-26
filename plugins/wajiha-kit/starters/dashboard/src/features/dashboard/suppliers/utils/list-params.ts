import type { SupplierListParams } from '../types/types';
import type { SupplierSearch } from '../validations/search';

/** Only the fields the request uses: loaderDeps and the query key both come from here. */
export function toSupplierListParams(
  search: SupplierSearch,
): SupplierListParams {
  return {
    page: search.page,
    pageSize: search.pageSize,
    sort: search.sort,
    q: search.q,
    status: search.status,
  };
}
