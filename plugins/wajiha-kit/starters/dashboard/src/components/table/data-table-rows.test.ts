import { describe, expect, it } from 'vitest';
import type { Column } from '@/types/table';
import { filterRows, sortRows } from './data-table-rows';

interface Row {
  name: string;
  qty: number;
}

const columns: Column<Row>[] = [
  { id: 'name', header: 'Name', accessor: (r) => r.name, cell: (r) => r.name },
  { id: 'qty', header: 'Qty', accessor: (r) => r.qty, cell: (r) => r.qty },
];

const rows: Row[] = [
  { name: 'bolt', qty: 10 },
  { name: 'Nut', qty: 2 },
  { name: 'washer', qty: 100 },
];

describe('filterRows', () => {
  it('keeps every row without a search', () => {
    expect(filterRows(rows, columns, '  ')).toEqual(rows);
  });

  it('matches any column, ignoring case', () => {
    expect(filterRows(rows, columns, 'NUT')).toEqual([rows[1]]);
    expect(filterRows(rows, columns, '100')).toEqual([rows[2]]);
  });
});

describe('sortRows', () => {
  it('returns the rows untouched without a sort', () => {
    expect(sortRows(rows, columns, null)).toBe(rows);
  });

  it('sorts numbers as numbers, both ways', () => {
    expect(
      sortRows(rows, columns, { id: 'qty', dir: 'asc' }).map((r) => r.qty),
    ).toEqual([2, 10, 100]);
    expect(
      sortRows(rows, columns, { id: 'qty', dir: 'desc' }).map((r) => r.qty),
    ).toEqual([100, 10, 2]);
  });

  it('sorts text with the locale compare', () => {
    expect(
      sortRows(rows, columns, { id: 'name', dir: 'asc' }).map((r) => r.name),
    ).toEqual(['bolt', 'Nut', 'washer']);
  });
});
