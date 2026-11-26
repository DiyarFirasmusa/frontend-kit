import type { PaginationState, SortingState } from '@tanstack/react-table';
import type { TableStatus } from '@/components/table/table-features';

/** The URL page is 1-based, the table's pageIndex 0-based. Convert only here. */
export function toPaginationState(
  page: number,
  pageSize: number,
): PaginationState {
  return { pageIndex: page - 1, pageSize };
}

/** URL sort is `<columnId>.<asc|desc>`; anything else means "no sort". */
export function toSortingState(sort: string): SortingState {
  const [id, direction] = sort.split('.');
  if (!id || (direction !== 'asc' && direction !== 'desc')) {
    return [];
  }
  return [{ id, desc: direction === 'desc' }];
}

export function toSortParam(sorting: SortingState): string {
  const first = sorting.at(0);
  return first ? `${first.id}.${first.desc ? 'desc' : 'asc'}` : '';
}

/** `name.asc` -> `name,asc`, the Spring `sort` parameter. */
export function toBackendSort(sort: string): string | undefined {
  const [first] = toSortingState(sort);
  return first ? `${first.id},${first.desc ? 'desc' : 'asc'}` : undefined;
}

export function toTableStatus(query: {
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
}): TableStatus {
  if (query.isError) {
    return 'error';
  }
  if (query.isPending) {
    return 'loading';
  }
  return query.isFetching ? 'refetching' : 'ready';
}
