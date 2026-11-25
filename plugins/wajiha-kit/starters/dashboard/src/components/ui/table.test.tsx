import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

describe('Table', () => {
  it('renders semantic header and body cells', () => {
    renderWithProviders(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Warehouse</TableHead>
            <TableHead>Items</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Central store</TableCell>
            <TableCell>42</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(
      screen.getByRole('columnheader', { name: 'Warehouse' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(
      screen.getByRole('cell', { name: 'Central store' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '42' })).toBeInTheDocument();
  });
});
