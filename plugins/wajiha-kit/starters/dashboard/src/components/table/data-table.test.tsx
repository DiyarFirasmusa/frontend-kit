import { createColumnHelper } from '@tanstack/react-table';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen, within } from '@/test/render';
import { DataTable, type DataTableProps } from './data-table';
import type { DataTableFeatures, TableStatus } from './table-features';

interface Row {
  id: string;
  name: string;
}

const helper = createColumnHelper<DataTableFeatures, Row>();
const columns = helper.columns([
  helper.accessor('name', { id: 'name', header: 'Name' }),
  helper.accessor('id', { header: 'Id', enableSorting: false }),
]);
const ROWS: Row[] = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' },
];

function renderTable(overrides: Partial<DataTableProps<Row>> = {}) {
  const props: DataTableProps<Row> = {
    caption: 'Things',
    columns,
    rows: ROWS,
    rowCount: 25,
    getRowId: (row) => row.id,
    pagination: { pageIndex: 0, pageSize: 10 },
    sorting: [],
    onPaginationChange: vi.fn(),
    onSortingChange: vi.fn(),
    status: 'ready',
    onRetry: vi.fn(),
    emptyLabel: 'Nothing here',
    ...overrides,
  };
  return { ...renderWithProviders(<DataTable {...props} />), props };
}

describe('DataTable', () => {
  it('renders the page it is given, with a caption', () => {
    renderTable();
    const table = screen.getByRole('table', { name: 'Things' });
    expect(within(table).getByText('Alpha')).toBeVisible();
  });

  it('marks sortable headers and hands the next sort up', async () => {
    const { user, props } = renderTable({
      sorting: [{ id: 'name', desc: false }],
    });
    const header = screen.getByRole('columnheader', { name: /Name/ });
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(
      screen.getByRole('columnheader', { name: 'Id' }),
    ).not.toHaveAttribute('aria-sort');
    await user.click(within(header).getByRole('button'));
    expect(props.onSortingChange).toHaveBeenCalledWith([
      { id: 'name', desc: true },
    ]);
  });

  it('hands the next page up and derives the page count from the total', async () => {
    const { user, props } = renderTable();
    expect(screen.getByRole('button', { name: '3' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(props.onPaginationChange).toHaveBeenCalledWith({
      pageIndex: 1,
      pageSize: 10,
    });
  });

  it.each<[TableStatus, string]>([
    ['error', 'Try again'],
    ['loading', ''],
  ])('renders the %s body and hides the pagination', (status, text) => {
    renderTable({ status });
    expect(screen.queryByRole('navigation')).toBeNull();
    if (text) {
      expect(screen.getByRole('button', { name: /try again/i })).toBeVisible();
    }
  });

  it('shows the empty message with its action and no pagination', () => {
    renderTable({
      rows: [],
      rowCount: 0,
      emptyAction: <button type="button">Clear filters</button>,
    });
    expect(screen.getByText('Nothing here')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeVisible();
    expect(screen.queryByRole('navigation')).toBeNull();
  });
});
