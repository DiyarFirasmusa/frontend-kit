import { getRouteApi } from '@tanstack/react-router';
import { useCallback } from 'react';
import { useListSearch, type UpdateSearch } from '@/hooks/use-list-search';
import { AttributeDataTypeValues } from '@/types/api/enums';
import {
  ATTRIBUTE_STATUSES,
  type AttributeStatusFilter,
  type AttributeTypeFilter,
} from '../../../../types/types';
import {
  defaultAttributeSearch,
  type AttributeSearch,
} from '../../validations/search';

const routeApi = getRouteApi('/_app/attributes/');

const FILTER_KEYS = ['q', 'dataType', 'status'] as const;

export function toAttributeStatusFilter(value: string): AttributeStatusFilter {
  return ATTRIBUTE_STATUSES.find((status) => status === value) ?? 'all';
}

export function toAttributeTypeFilter(value: string): AttributeTypeFilter {
  return AttributeDataTypeValues.find((type) => type === value) ?? 'all';
}

/** The URL state of the list: pagination, sorting and filters (the URL is the only copy). */
export function useAttributeFilters() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const update: UpdateSearch<AttributeSearch> = (updater, options) => {
    void navigate({ search: updater, replace: options?.replace });
  };
  const goToPage = useCallback(
    (page: number) => {
      void navigate({ search: (prev) => ({ ...prev, page }), replace: true });
    },
    [navigate],
  );
  return {
    search,
    goToPage,
    ...useListSearch({
      search,
      defaults: defaultAttributeSearch,
      filterKeys: FILTER_KEYS,
      update,
    }),
  };
}
