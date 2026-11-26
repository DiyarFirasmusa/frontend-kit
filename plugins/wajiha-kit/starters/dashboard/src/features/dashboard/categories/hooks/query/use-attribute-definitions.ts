import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import {
  fetchAttributeDefinition,
  fetchAttributeDefinitions,
} from '../../services/attributes.service';
import type { AttributeListParams } from '../../types/types';

/** Shared by the route loader (prefetch) and the page (read). */
export function attributeDefinitionsListQueryOptions(
  params: AttributeListParams,
) {
  return queryOptions({
    queryKey: qk.attributes.list(params),
    // The signal aborts the request when the page or the params change.
    queryFn: ({ signal }) => fetchAttributeDefinitions(params, { signal }),
    // The previous page stays on screen while the next one loads.
    placeholderData: keepPreviousData,
  });
}

export function useAttributeDefinitionsList(params: AttributeListParams) {
  return useQuery(attributeDefinitionsListQueryOptions(params));
}

/** Every active attribute, name order: what the "link attribute" select offers. */
export const ATTRIBUTE_LOOKUP_PARAMS: AttributeListParams = {
  page: 1,
  pageSize: 200,
  sort: 'name.asc',
  q: '',
  dataType: 'all',
  status: 'active',
};

export function attributeDefinitionDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: qk.attributes.detail(id),
    queryFn: ({ signal }) => fetchAttributeDefinition(id, { signal }),
  });
}

/** Edit and the options dialog read the definition by id, never a table row. */
export function useAttributeDefinitionDetail(id: string | null) {
  return useQuery({
    ...attributeDefinitionDetailQueryOptions(id ?? ''),
    enabled: id !== null,
  });
}

/** The "link attribute" choices. Loads only while that dialog is open. */
export function useAttributeLookup(enabled: boolean) {
  return useQuery({
    ...attributeDefinitionsListQueryOptions(ATTRIBUTE_LOOKUP_PARAMS),
    enabled,
  });
}
