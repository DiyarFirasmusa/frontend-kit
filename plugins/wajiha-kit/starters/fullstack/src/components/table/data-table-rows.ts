import type { Column } from '@/components/table/types';

export interface RowSort {
  id: string;
  dir: 'asc' | 'desc';
}

/** Client-side search: a row stays when any column's value contains the text. */
export function filterRows<T>(data: T[], columns: Column<T>[], search: string | undefined): T[] {
  const q = search?.trim().toLowerCase();
  if (!q) {
    return data;
  }
  return data.filter((row) =>
    columns.some((col) => {
      const v = col.accessor?.(row);
      return v !== null && v !== undefined && String(v).toLowerCase().includes(q);
    }),
  );
}

/** Client-side sort by one column; numbers compare as numbers, everything else as text. */
export function sortRows<T>(rows: T[], columns: Column<T>[], sort: RowSort | null): T[] {
  if (!sort) {
    return rows;
  }
  const col = columns.find((c) => c.id === sort.id);
  if (!col) {
    return rows;
  }
  const read = (row: T): string | number => {
    const v = col.sortValue?.(row) ?? col.accessor?.(row) ?? '';
    return typeof v === 'number' ? v : String(v);
  };
  const factor = sort.dir === 'asc' ? 1 : -1;
  return [...rows].toSorted((a, b) => {
    const av = read(a);
    const bv = read(b);
    if (typeof av === 'number' && typeof bv === 'number') {
      return (av - bv) * factor;
    }
    return String(av).localeCompare(String(bv)) * factor;
  });
}
