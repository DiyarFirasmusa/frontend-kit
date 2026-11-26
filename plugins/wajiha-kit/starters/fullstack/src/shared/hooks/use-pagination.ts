import { useCallback, useState } from 'react';
import type { ServerPagination } from '@/components/table/types';

interface UsePaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

export function usePagination({ pageSize = 10, initialPage = 0 }: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage);

  const reset = useCallback(() => {
    setPage(0);
  }, []);

  const toTablePagination = useCallback(
    (total: number): ServerPagination => ({
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      onPageChange: setPage,
    }),
    [page, pageSize],
  );

  return {
    page,
    pageSize,
    skip: page * pageSize,
    take: pageSize,
    setPage,
    reset,
    toTablePagination,
  };
}
