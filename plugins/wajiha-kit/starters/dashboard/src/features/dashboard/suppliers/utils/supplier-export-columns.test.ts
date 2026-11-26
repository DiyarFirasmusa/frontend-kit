import { describe, expect, it } from 'vitest';
import i18n from '@/lib/i18n/i18n';
import { makeSupplier } from '../supplier-test-utils';
import { getSupplierExportColumns } from './supplier-export-columns';

describe('getSupplierExportColumns', () => {
  it('writes blank fields as empty cells and the status as text', () => {
    const columns = getSupplierExportColumns(i18n.t.bind(i18n));
    const values = columns.map((column) =>
      column.value(makeSupplier({ email: '  ', isActive: false })),
    );
    expect(values).toContain(null);
    expect(values.at(-1)).toBe(i18n.t('common.inactive'));
  });
});
