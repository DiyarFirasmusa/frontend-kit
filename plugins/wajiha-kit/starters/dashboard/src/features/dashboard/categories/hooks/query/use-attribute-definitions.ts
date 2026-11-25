import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchAttributeDefinitions } from '../../services/attributes.service';
import type { AttributeDefinitionListParams } from '../../types/types';

export function useAttributeDefinitionsList(
  params: AttributeDefinitionListParams,
) {
  return useQuery({
    queryKey: qk.attributes.list(params),
    queryFn: () => fetchAttributeDefinitions(params),
    placeholderData: keepPreviousData,
  });
}
