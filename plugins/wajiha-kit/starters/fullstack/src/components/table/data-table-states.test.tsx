import { describe, expect, it } from 'vitest';
import type { Column } from '@/components/table/types';
import { renderWithProviders, screen } from '@/test/render';
import { DataTable } from './data-table';

interface Row {
  id: string;
  name: string;
}

const columns: Column<Row>[] = [{ id: 'name', header: 'Name', accessor: (row) => row.name }];

const rows: Row[] = [
  { id: '1', name: 'Zara' },
  { id: '2', name: 'Amir' },
];

describe('DataTable success state', () => {
  it('renders one body row per record in order', () => {
    renderWithProviders(<DataTable data={rows} columns={columns} getRowId={(row) => row.id} />);

    const bodyRows = screen.getAllByRole('row').slice(1);
    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[0]).toHaveTextContent('Zara');
    expect(bodyRows[1]).toHaveTextContent('Amir');
  });
});
