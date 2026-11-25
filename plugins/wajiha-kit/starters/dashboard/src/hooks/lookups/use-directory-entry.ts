import { useQuery } from '@tanstack/react-query';
import { qk, referenceQueryOptions } from '@/constants/query-keys';
import {
  loadDirectoryEntry,
  type DirectoryKind,
} from '@/services/directory.service';
import type { DirectoryEntryResponse } from '@/types/api/directory';

/**
 * The directory entry (name, avatar, subtitle, employment status) of a user,
 * employee or org unit id. Ids asked for in the same render pass share one
 * `POST /api/directory/resolve`.
 */
export function useDirectoryEntry(
  kind: DirectoryKind,
  id: string | null | undefined,
): DirectoryEntryResponse | null {
  return useDirectoryEntryState(kind, id).entry;
}

/** Like `useDirectoryEntry`, and also says whether the id is still being resolved. */
export function useDirectoryEntryState(
  kind: DirectoryKind,
  id: string | null | undefined,
): { entry: DirectoryEntryResponse | null; isLoading: boolean } {
  const query = useQuery({
    queryKey: qk.directory.entry(id ?? ''),
    queryFn: () => loadDirectoryEntry(kind, id ?? ''),
    enabled: Boolean(id),
    retry: false,
    ...referenceQueryOptions,
  });
  return { entry: query.data ?? null, isLoading: query.isLoading };
}
