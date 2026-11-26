import type { UnitOfMeasureListParams } from '../types/types';
import type { UnitOfMeasureSearch } from '../validations/search';

/** Only the fields the request uses: loaderDeps and the query key both come from here. */
export function toUnitOfMeasureListParams(
  search: UnitOfMeasureSearch,
): UnitOfMeasureListParams {
  return {
    page: search.page,
    pageSize: search.pageSize,
    sort: search.sort,
    q: search.q,
    status: search.status,
    decimals: search.decimals,
  };
}
