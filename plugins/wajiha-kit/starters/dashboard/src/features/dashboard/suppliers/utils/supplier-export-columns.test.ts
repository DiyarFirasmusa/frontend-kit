import { beforeAll, describe, expect, it } from 'vitest';
import i18n, { loadFeatureLocale } from '@/lib/i18n/i18n';
import { tt } from '@/test/i18n';
import { toExportMatrix } from '@/utils/export-table';
import { makeSupplier } from '../supplier-test-utils';
import { getSupplierExportColumns } from './supplier-export-columns';

beforeAll(async () => {
  await loadFeatureLocale('dashboard/suppliers');
});

describe('getSupplierExportColumns', () => {
  it('uses the on-screen headers and plain cell values', () => {
    const columns = getSupplierExportColumns(i18n.t);

    expect(columns.map((column) => column.header)).toEqual([
      tt('suppliers.columns.code'),
      tt('suppliers.columns.name'),
      tt('suppliers.dialog.contactName'),
      tt('suppliers.columns.phone'),
      tt('suppliers.columns.email'),
      tt('suppliers.columns.taxNumber'),
      tt('suppliers.dialog.address'),
      tt('suppliers.columns.inUse'),
      tt('suppliers.columns.status'),
    ]);
    expect(toExportMatrix([makeSupplier()], columns)[0]).toEqual([
      'SUP-001',
      'Rafidain Supplies',
      'Ali Hassan',
      '+964 780 000 0000',
      'orders@example.com',
      '123456789',
      'Baghdad',
      tt('suppliers.inUse.no'),
      tt('common.active'),
    ]);
  });

  it('marks names seen only on documents as unregistered', () => {
    const columns = getSupplierExportColumns(i18n.t);
    const row = makeSupplier({
      registered: false,
      contactName: null,
      inUse: true,
    });

    const [cells] = toExportMatrix([row], columns);
    expect(cells?.[2]).toBeNull();
    expect(cells?.slice(7)).toEqual([
      tt('suppliers.inUse.yes'),
      tt('suppliers.status.unregistered'),
    ]);
  });
});
