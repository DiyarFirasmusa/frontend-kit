import { beforeAll, describe, expect, it } from 'vitest';
import i18n, { loadFeatureLocale } from '@/lib/i18n/i18n';
import { tt } from '@/test/i18n';
import { toExportMatrix } from '@/utils/export-table';
import { makeWarehouse } from '../warehouse-test-utils';
import { getWarehouseExportColumns } from './warehouse-export-columns';

beforeAll(async () => {
  await loadFeatureLocale('dashboard/warehouses');
});

describe('getWarehouseExportColumns', () => {
  it('uses the on-screen headers and plain cell values', () => {
    const columns = getWarehouseExportColumns(i18n.t);
    const row = makeWarehouse({
      managerName: 'Sara Ali',
      memberCount: 4,
      locationCount: 12,
    });

    expect(columns.map((column) => column.header)).toEqual([
      tt('warehouses.col.code'),
      tt('warehouses.col.name'),
      tt('warehouses.col.address'),
      tt('warehouses.col.manager'),
      tt('warehouses.col.members'),
      tt('warehouses.col.locations'),
      tt('warehouses.col.type'),
      tt('warehouses.col.status'),
    ]);
    expect(toExportMatrix([row], columns)[0]).toEqual([
      'BGD-01',
      'Baghdad central warehouse',
      'Baghdad, industrial zone',
      'Sara Ali',
      4,
      12,
      tt('warehouses.type.regular'),
      tt('common.active'),
    ]);
  });

  it('keeps empty values empty and labels transit warehouses', () => {
    const columns = getWarehouseExportColumns(i18n.t);
    const row = makeWarehouse({
      address: '  ',
      managerUserId: null,
      isTransit: true,
      isActive: null,
    });

    const [cells] = toExportMatrix([row], columns);
    expect(cells?.[2]).toBeNull();
    expect(cells?.[3]).toBeNull();
    expect(cells?.slice(6)).toEqual([tt('warehouses.type.transit'), null]);
  });
});
