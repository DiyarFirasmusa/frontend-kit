import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { qk } from '@/constants/query-keys';
import { fetchAuditLog } from '@/services/audit-log.service';
import type { AuditLogResponse } from '@/types/api/audit';
import type { AuditEntity } from '@/types/api/enums';

export const AUDIT_LOG_PAGE_SIZE = 20;

interface UseAuditLogOptions {
  entity: AuditEntity;
  entityId?: string;
  enabled: boolean;
}

/** The change log of one record (or a whole entity type), newest first, one page per "show more". */
export function useAuditLog({ entity, entityId, enabled }: UseAuditLogOptions) {
  const query = useInfiniteQuery({
    queryKey: qk.auditLog.list({ entity, entityId }),
    queryFn: ({ pageParam, signal }) =>
      fetchAuditLog(
        {
          entity,
          ...(entityId ? { entityId } : {}),
          page: pageParam,
          size: AUDIT_LOG_PAGE_SIZE,
        },
        { signal },
      ),
    initialPageParam: 0,
    getNextPageParam: (last) => {
      const page = last.page ?? 0;
      const totalPages = last.totalPages ?? 0;
      return page + 1 < totalPages ? page + 1 : undefined;
    },
    enabled,
  });

  const entries = useMemo<AuditLogResponse[]>(
    () => query.data?.pages.flatMap((page) => page.content ?? []) ?? [],
    [query.data],
  );

  return {
    entries,
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}
