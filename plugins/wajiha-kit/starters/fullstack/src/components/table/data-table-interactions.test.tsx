import { describe, expect, it, vi } from 'vitest';
import type { Column, ServerPagination } from '@/components/table/types';
import { renderWithProviders, screen } from '@/test/render';
import { DataTable } from './data-table';

interface Row {
  id: string;
  name: string;
}

const columns: Column<Row>[] = [
  {
    id: 'name',
    header: 'Name',
    accessor: (row) => row.name,
    sortable: true,
  },
];

const rows: Row[] = [
  { id: '1', name: 'Zara' },
  { id: '2', name: 'Amir' },
];

function order() {
  return screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => row.textContent ?? '');
}

const serverPage: ServerPagination = {
  page: 0,
  pageSize: 20,
  total: 40,
  totalPages: 2,
  onPageChange: vi.fn(),
};

describe('DataTable sort', () => {
  it('sorts a fully loaded table in the browser', async () => {
    const { user } = renderWithProviders(
      <DataTable data={rows} columns={columns} getRowId={(row) => row.id} />,
    );

    expect(order()[0]).toContain('Zara');
    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(order()[0]).toContain('Amir');
    expect(order()[1]).toContain('Zara');
  });

  it('does not offer a sort control for a server page without onSortChange', () => {
    renderWithProviders(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        serverPagination={serverPage}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Name' })).not.toBeInTheDocument();
    expect(order()[0]).toContain('Zara');
    expect(order()[1]).toContain('Amir');
  });

  it('reports a server sort without reordering the current page', async () => {
    const onSortChange = vi.fn();
    const { user } = renderWithProviders(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        sortState={null}
        onSortChange={onSortChange}
        serverPagination={serverPage}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(onSortChange).toHaveBeenCalledExactlyOnceWith({
      id: 'name',
      dir: 'asc',
    });
    expect(order()[0]).toContain('Zara');
    expect(order()[1]).toContain('Amir');
  });
});

describe('DataTable empty values', () => {
  it('renders an em dash for a cell whose accessor returns null', () => {
    const nullable: Column<Row>[] = [{ id: 'name', header: 'Name', accessor: () => null }];
    renderWithProviders(
      <DataTable data={[rows[0]!]} columns={nullable} getRowId={(row) => row.id} />,
    );

    const cells = screen.getAllByRole('cell');
    expect(cells[0]?.textContent).toBe('—');
  });
});

describe('DataTable row interactions', () => {
  it('keeps row and cell roles and opens via keyboard on the row', async () => {
    const onRowClick = vi.fn();
    const { user } = renderWithProviders(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        onRowClick={onRowClick}
      />,
    );

    const bodyRows = screen.getAllByRole('row').slice(1);
    expect(bodyRows[0]?.tagName).toBe('TR');
    expect(bodyRows[0]).not.toHaveAttribute('role', 'link');
    expect(screen.getAllByRole('cell').length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: 'Zara' })).not.toBeInTheDocument();

    bodyRows[0]?.focus();
    expect(bodyRows[0]).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenCalledExactlyOnceWith(rows[0]);
  });

  it('still opens the row when a non-primary cell is clicked', async () => {
    const onRowClick = vi.fn();
    const withMeta: Column<Row>[] = [
      ...columns,
      { id: 'meta', header: 'Meta', accessor: () => 'extra' },
    ];
    const { user } = renderWithProviders(
      <DataTable
        data={rows}
        columns={withMeta}
        getRowId={(row) => row.id}
        onRowClick={onRowClick}
      />,
    );

    await user.click(screen.getAllByText('extra')[0]!);
    expect(onRowClick).toHaveBeenCalledExactlyOnceWith(rows[0]);
  });
});
