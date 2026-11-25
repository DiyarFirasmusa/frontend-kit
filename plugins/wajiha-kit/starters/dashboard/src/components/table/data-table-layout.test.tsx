import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen, within } from '@/test/render';
import type { Column } from '@/types/table';
import { DataTable } from './data-table';

interface Row {
  id: string;
  name: string;
}

const columns: Column<Row>[] = [
  { id: 'name', header: 'Name', accessor: (row) => row.name },
];

const rows: Row[] = [
  { id: '1', name: 'Zara' },
  { id: '2', name: 'Amir' },
];

function tableRoot(container: HTMLElement) {
  const root = container.querySelector('[data-slot="data-table"]');
  if (!root) {
    throw new Error('missing data table');
  }
  return root;
}

describe('DataTable layout', () => {
  it('draws its own bordered panel by default', () => {
    const { container } = renderWithProviders(
      <DataTable data={rows} columns={columns} getRowId={(row) => row.id} />,
    );

    expect(tableRoot(container)).toHaveClass('border', 'p-panel');
  });

  it('drops the panel when embedded in a card', () => {
    const { container } = renderWithProviders(
      <DataTable
        embedded
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        aria-label="Warehouses"
      />,
    );

    const root = tableRoot(container);
    expect(root).toHaveAttribute('data-embedded', 'true');
    expect(root).not.toHaveClass('border');
    expect(root).not.toHaveClass('p-panel');
    expect(screen.getByRole('table', { name: 'Warehouses' })).toBeVisible();
  });

  it('puts the selection column at the end and marks selected rows', async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        selection={{
          selectedIds: new Set(['2']),
          onChange,
          position: 'end',
          hideSelectAll: true,
        }}
        selectedRowClassName="bg-primary-tint"
      />,
    );

    const [, first, second] = screen.getAllByRole('row');
    if (!first || !second) {
      throw new Error('missing rows');
    }
    const firstCells = within(first).getAllByRole('cell');
    expect(
      firstCells.at(-1)?.querySelector('[role="checkbox"]'),
    ).not.toBeNull();
    expect(firstCells[0]).toHaveTextContent('Zara');
    expect(second).toHaveClass('bg-primary-tint');
    expect(second).toHaveAttribute('data-selected', 'true');
    expect(first).not.toHaveClass('bg-primary-tint');
    expect(
      screen.queryByRole('checkbox', { name: /select all/i }),
    ).not.toBeInTheDocument();

    await user.click(within(first).getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(new Set(['2', '1']));
  });

  it('adds per-row classes', () => {
    renderWithProviders(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowClassName={(row) => (row.id === '1' ? 'is-active' : undefined)}
      />,
    );

    expect(screen.getAllByRole('row')[1]).toHaveClass('is-active');
  });
});
