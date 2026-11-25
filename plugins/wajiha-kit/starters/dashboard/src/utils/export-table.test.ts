import { describe, expect, it } from 'vitest';
import type { ExportColumn } from '@/types/export';
import { collectPersonIds, toExportMatrix } from './export-table';

interface Row {
  code: string;
  qty: number | null;
  createdBy: string | null;
  holder: string | null;
}

const columns: ExportColumn<Row>[] = [
  { header: 'Code', value: (row) => row.code },
  { header: 'Qty', value: (row) => row.qty },
  { header: 'By', value: (row) => row.createdBy, person: 'user' },
  { header: 'Holder', value: (row) => row.holder, person: 'employee' },
];

const rows: Row[] = [
  { code: 'A', qty: 1, createdBy: 'u1', holder: 'e1' },
  { code: 'B', qty: null, createdBy: 'u1', holder: null },
  { code: 'C', qty: 3, createdBy: 'u2', holder: '' },
];

describe('collectPersonIds', () => {
  it('groups the distinct ids of person columns by kind', () => {
    const ids = collectPersonIds(rows, columns);

    expect([...(ids.get('user') ?? [])]).toEqual(['u1', 'u2']);
    expect([...(ids.get('employee') ?? [])]).toEqual(['e1']);
    expect(ids.has('orgUnit')).toBe(false);
  });
});

describe('personName', () => {
  const named: ExportColumn<Row>[] = [
    {
      header: 'Holder',
      value: (row) => row.holder,
      person: 'employee',
      personName: (row) => (row.holder === 'e1' ? 'Ali Hassan' : null),
    },
  ];

  it('uses the name the API sent and skips the lookup for that row', () => {
    const rowsWithHolder: Row[] = [
      { code: 'A', qty: 1, createdBy: null, holder: 'e1' },
      { code: 'B', qty: 1, createdBy: null, holder: 'e2' },
    ];

    expect([
      ...(collectPersonIds(rowsWithHolder, named).get('employee') ?? []),
    ]).toEqual(['e2']);
    expect(
      toExportMatrix(rowsWithHolder, named, new Map([['e2', 'Sara Ali']])),
    ).toEqual([['Ali Hassan'], ['Sara Ali']]);
  });
});

describe('toExportMatrix', () => {
  it('maps rows to cells and swaps resolved person ids for names', () => {
    const names = new Map([['u1', 'Sara Ali']]);

    expect(toExportMatrix(rows, columns, names)).toEqual([
      ['A', 1, 'Sara Ali', 'e1'],
      ['B', null, 'Sara Ali', null],
      ['C', 3, 'u2', ''],
    ]);
  });
});
