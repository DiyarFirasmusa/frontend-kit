import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { qk } from '@/constants/query-keys';
import {
  searchDirectory,
  type DirectorySearchKind,
} from '@/services/directory.service';
import type { DirectoryEntryResponse } from '@/types/api/directory';
import type { LookupResult } from './lookup-result';

/**
 * Searches users, employees or org units by name. The caller debounces `q`
 * and passes `enabled: false` until the picker has been opened.
 */
export function useDirectorySearch(
  kind: DirectorySearchKind,
  q: string,
  enabled = true,
): LookupResult<DirectoryEntryResponse> {
  const term = q.trim();
  const query = useQuery({
    queryKey: qk.directory.search(kind, term),
    queryFn: () => searchDirectory(kind, term),
    placeholderData: keepPreviousData,
    enabled,
    retry: false,
  });
  const data = useMemo(() => query.data ?? [], [query.data]);
  const options = useMemo(
    () =>
      data.map((entry) => ({
        value: entry.id,
        label: entry.name || entry.subtitle || entry.id,
      })),
    [data],
  );
  return {
    options,
    data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
