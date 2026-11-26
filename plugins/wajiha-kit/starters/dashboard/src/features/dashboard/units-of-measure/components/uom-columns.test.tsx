import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ClientDataTable } from '@/components/table/client-data-table';
import i18n, { loadFeatureLocale } from '@/lib/i18n/i18n';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import type { Column } from '@/types/table';
import type { UnitOfMeasureRow } from '../types/types';
import { makeUnitOfMeasure } from '../uom-test-utils';
import { getUnitOfMeasureColumns } from './uom-columns';

function buildColumns() {
  return getUnitOfMeasureColumns({
    t: i18n.t,
    can: () => true,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  });
}

function column(id: string): Column<UnitOfMeasureRow> {
  const found = buildColumns().find((c) => c.id === id);
  if (!found) {
    throw new Error(`Missing unit of measure column: ${id}`);
  }
  return found;
}

function renderColumns(ids: string[], rows: UnitOfMeasureRow[]) {
  return renderWithProviders(
    <ClientDataTable
      data={rows}
      columns={ids.map((id) => column(id))}
      getRowId={(r) => r.id}
    />,
  );
}

describe('getUnitOfMeasureColumns', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/units-of-measure');
  });

  it('defines the headers in display order', () => {
    const headers = buildColumns().map((c) => c.header);
    expect(headers).toEqual([
      'Code',
      'Name',
      'Decimal places',
      'Display example',
      'Status',
      'Actions',
    ]);
    expect(buildColumns().map((c) => c.id)).toEqual([
      'code',
      'name',
      'decimalPlaces',
      'example',
      'status',
      'actions',
    ]);
  });

  it('renders the code and name', () => {
    renderColumns(
      ['code', 'name'],
      [makeUnitOfMeasure({ code: 'KG', name: 'Kilogram' })],
    );
    expect(screen.getByText('KG')).toBeInTheDocument();
    expect(screen.getByText('Kilogram')).toBeInTheDocument();
  });

  it('renders an em dash for a null name', () => {
    renderColumns(['name'], [makeUnitOfMeasure({ name: null })]);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders an em dash for null code and decimal places', () => {
    renderColumns(
      ['code', 'decimalPlaces', 'example'],
      [makeUnitOfMeasure({ code: null, decimalPlaces: null })],
    );
    expect(screen.getAllByText('—')).toHaveLength(3);
  });

  it('formats the display example for three decimal places as 12.346', () => {
    expect(
      column('example').accessor?.(makeUnitOfMeasure({ decimalPlaces: 3 })),
    ).toBe('12.346');
    renderColumns(['example'], [makeUnitOfMeasure({ decimalPlaces: 3 })]);
    expect(screen.getByText('12.346')).toBeInTheDocument();
  });

  it('renders the active status badge in English', () => {
    renderColumns(['status'], [makeUnitOfMeasure({ isActive: true })]);
    expect(screen.getByText(tt('unitsOfMeasure.status.active'))).toHaveClass(
      'badge-green',
    );
  });

  it('renders the inactive status badge in English', () => {
    renderColumns(['status'], [makeUnitOfMeasure({ isActive: false })]);
    expect(screen.getByText(tt('unitsOfMeasure.status.inactive'))).toHaveClass(
      'badge-neutral',
    );
  });

  it('renders the status badge in Arabic', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/units-of-measure');
    renderColumns(['status'], [makeUnitOfMeasure({ isActive: true })]);
    expect(screen.getByText('نشطة')).toBeInTheDocument();
    await setTestLanguage('en');
  });
});
