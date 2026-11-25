import { useCallback, useMemo, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { AttributeDataType } from '@/types/api/enums';
import type { AttributeDefinitionListParams } from '../../types/types';

export type AttributeStatusFilter = '' | 'ACTIVE' | 'INACTIVE';

export interface AttributeFilters {
  search: string;
  setSearch: (value: string) => void;
  dataType: AttributeDataType | '';
  setDataType: (value: AttributeDataType | '') => void;
  status: AttributeStatusFilter;
  setStatus: (value: AttributeStatusFilter) => void;
  params: AttributeDefinitionListParams;
  isDirty: boolean;
  clear: () => void;
}

function toIsActive(status: AttributeStatusFilter): boolean | undefined {
  if (status === 'ACTIVE') {
    return true;
  }
  if (status === 'INACTIVE') {
    return false;
  }
  return undefined;
}

export function useAttributeFilters(): AttributeFilters {
  const [search, setSearch] = useState('');
  const [dataType, setDataType] = useState<AttributeDataType | ''>('');
  const [status, setStatus] = useState<AttributeStatusFilter>('');
  const debouncedSearch = useDebouncedValue(search, 400);

  const params = useMemo<AttributeDefinitionListParams>(() => {
    const q = debouncedSearch.trim();
    const isActive = toIsActive(status);
    return {
      ...(q !== '' ? { q } : {}),
      ...(dataType !== '' ? { dataType } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    };
  }, [debouncedSearch, dataType, status]);

  const clear = useCallback(() => {
    setSearch('');
    setDataType('');
    setStatus('');
  }, []);

  return {
    search,
    setSearch,
    dataType,
    setDataType,
    status,
    setStatus,
    params,
    isDirty: search !== '' || dataType !== '' || status !== '',
    clear,
  };
}
