import type { AttributeListParams } from '../../../types/types';
import type { AttributeSearch } from '../validations/search';

/** Only the fields the request uses: loaderDeps and the query key both come from here. */
export function toAttributeListParams(
  search: AttributeSearch,
): AttributeListParams {
  return {
    page: search.page,
    pageSize: search.pageSize,
    sort: search.sort,
    q: search.q,
    dataType: search.dataType,
    status: search.status,
  };
}
