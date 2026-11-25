import { renderHook } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { makeSupplier } from '../supplier-test-utils';
import type { SupplierRow } from '../types/types';
import { getSupplierColumns } from './supplier-columns';

function buildColumns() {
  const t = renderHook(() => useTranslation().t).result.current;
  return getSupplierColumns({
    t,
    canWrite: true,
    canDelete: true,
    onEdit: vi.fn(),
    onRegister: vi.fn(),
    onRemove: vi.fn(),
  });
}

function renderCell(columnId: string, row: SupplierRow) {
  const column = buildColumns().find((col) => col.id === columnId);
  if (!column?.cell) {
    throw new Error(`missing cell for ${columnId}`);
  }
  return renderWithProviders(<>{column.cell(row)}</>);
}

describe('getSupplierColumns', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/suppliers');
  });

  it('builds the headers', () => {
    expect(buildColumns().map((col) => col.header)).toEqual([
      tt('suppliers.columns.code'),
      tt('suppliers.columns.name'),
      tt('suppliers.columns.phone'),
      tt('suppliers.columns.email'),
      tt('suppliers.columns.taxNumber'),
      tt('suppliers.columns.inUse'),
      tt('suppliers.columns.status'),
      '',
    ]);
  });

  it('shows the contact under the name and dashes for empty values', () => {
    renderCell('name', makeSupplier());
    expect(screen.getByText('Ali Hassan')).toBeInTheDocument();
    renderCell('phone', makeSupplier({ phone: null }));
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('marks a document-only name as not registered', () => {
    renderCell('status', makeSupplier({ registered: false }));
    expect(
      screen.getByText(tt('suppliers.status.unregistered')),
    ).toBeInTheDocument();
  });

  it('translates the status in Arabic', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/suppliers');
    renderCell('status', makeSupplier({ registered: false }));
    expect(screen.getByText('غير مسجل')).toBeInTheDocument();
  });
});
