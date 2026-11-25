import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchUnitsOfMeasure } from '../../services/units-of-measure.service';
import type { UnitOfMeasureListParams } from '../../types/types';

export function useUnitsOfMeasureList(params: UnitOfMeasureListParams) {
  return useQuery({
    queryKey: qk.unitsOfMeasure.list(params),
    queryFn: () => fetchUnitsOfMeasure(params),
    placeholderData: keepPreviousData,
  });
}
