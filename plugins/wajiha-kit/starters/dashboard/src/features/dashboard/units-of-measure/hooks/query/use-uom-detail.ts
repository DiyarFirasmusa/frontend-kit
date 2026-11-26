import { queryOptions, useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchUnitOfMeasure } from '../../services/units-of-measure.service';

export function unitOfMeasureDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: qk.unitsOfMeasure.detail(id),
    queryFn: ({ signal }) => fetchUnitOfMeasure(id, { signal }),
  });
}

/** Edit reads the record by id, never the possibly stale table row. */
export function useUnitOfMeasureDetail(id: string | null) {
  return useQuery({
    ...unitOfMeasureDetailQueryOptions(id ?? ''),
    enabled: id !== null,
  });
}
