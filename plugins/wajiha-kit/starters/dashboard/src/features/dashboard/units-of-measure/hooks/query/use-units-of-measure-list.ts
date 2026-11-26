import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchUnitsOfMeasure } from '../../services/units-of-measure.service';
import type { UnitOfMeasureListParams } from '../../types/types';

/** Shared by the route loader (prefetch) and the page (read). */
export function unitsOfMeasureListQueryOptions(
  params: UnitOfMeasureListParams,
) {
  return queryOptions({
    queryKey: qk.unitsOfMeasure.list(params),
    // The signal aborts the request when the page or the params change.
    queryFn: ({ signal }) => fetchUnitsOfMeasure(params, { signal }),
    // The previous page stays on screen while the next one loads.
    placeholderData: keepPreviousData,
  });
}

export function useUnitsOfMeasureList(params: UnitOfMeasureListParams) {
  return useQuery(unitsOfMeasureListQueryOptions(params));
}
