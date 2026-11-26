import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ClientDataTable } from '@/components/table/client-data-table';
import i18n, { loadFeatureLocale } from '@/lib/i18n/i18n';
import { setTestLanguage, tt } from '@/test/i18n';
import { serveDirectoryNames } from '@/test/msw/directory';
import { renderWithProviders, screen } from '@/test/render';
import type { WarehouseResponse } from '@/types/api/warehouses';
import type { Column } from '@/types/table';
import { makeWarehouse } from '../warehouse-test-utils';
import { getWarehouseColumns } from './warehouse-columns';

function buildColumns() {
  return getWarehouseColumns({
    t: i18n.t,
    can: () => true,
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  });
}

function column(id: string): Column<WarehouseResponse> {
  const found = buildColumns().find((c) => c.id === id);
  if (!found) {
    throw new Error(`Missing warehouse column: ${id}`);
  }
  return found;
}

function renderColumns(ids: string[], rows: WarehouseResponse[]) {
  return renderWithProviders(
    <ClientDataTable
      data={rows}
      columns={ids.map((id) => column(id))}
      getRowId={(r) => r.id}
    />,
  );
}

describe('getWarehouseColumns', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/warehouses');
  });

  it('defines the columns in display order', () => {
    expect(buildColumns().map((c) => c.id)).toEqual([
      'code',
      'name',
      'address',
      'manager',
      'members',
      'locations',
      'type',
      'status',
      'actions',
    ]);
  });

  it('renders an em dash for an empty address and manager', () => {
    const row = makeWarehouse({
      address: null,
      managerUserId: null,
      managerEmployeeId: null,
    });
    renderColumns(['address', 'manager'], [row]);
    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('renders the manager name and uses it as the accessor value', () => {
    const row = makeWarehouse({ managerName: 'Sara Ali' });
    renderColumns(['manager'], [row]);
    expect(screen.getByText('Sara Ali')).toBeInTheDocument();
    expect(column('manager').accessor?.(row)).toBe('Sara Ali');
  });

  it('renders the resolved manager name when the row has only an id', async () => {
    serveDirectoryNames({
      '6f1d2c3a-0000-4000-8000-000000000001': 'Omar Hadi',
    });
    renderColumns(['manager'], [makeWarehouse()]);
    expect(await screen.findByText('Omar Hadi')).toBeInTheDocument();
  });

  it('renders the location and member counts with an em dash when missing', () => {
    const row = makeWarehouse({ locationCount: 12, memberCount: 0 });
    expect(column('locations').accessor?.(row)).toBe('12');
    expect(column('members').accessor?.(row)).toBe('0');
    expect(column('members').accessor?.(makeWarehouse())).toBe('—');
  });

  it('renders an em dash for a blank address string', () => {
    const row = makeWarehouse({ address: '   ' });
    expect(column('address').accessor?.(row)).toBe('—');
  });

  it('renders an em dash for a null warehouse name', () => {
    renderColumns(['name'], [makeWarehouse({ name: null })]);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders the warehouse name and code', () => {
    const row = makeWarehouse({ name: 'Basra depot', code: 'BSR-01' });
    renderColumns(['name', 'code'], [row]);
    expect(screen.getByText('Basra depot')).toBeInTheDocument();
    expect(screen.getByText('BSR-01')).toBeInTheDocument();
  });

  it('renders the warehouse type as plain text in English', () => {
    renderColumns(['type'], [makeWarehouse({ isTransit: true })]);
    expect(screen.getByText(tt('warehouses.type.transit'))).not.toHaveClass(
      'badge',
    );
  });

  it('renders the transit and regular types in Arabic', async () => {
    await setTestLanguage('ar');
    renderColumns(
      ['type'],
      [
        makeWarehouse({ id: 'a', isTransit: true }),
        makeWarehouse({ id: 'b', isTransit: false }),
      ],
    );
    expect(screen.getByText(tt('warehouses.type.transit'))).toBeInTheDocument();
    expect(screen.getByText(tt('warehouses.type.regular'))).toBeInTheDocument();
  });
});
