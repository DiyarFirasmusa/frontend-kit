import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

function renderNamed() {
  return renderWithProviders(
    <Table aria-label="Warehouses">
      <TableBody>
        <TableRow>
          <TableCell>Central store</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
}

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

  describe('scroll region', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('is no tab stop and names the table when nothing scrolls', () => {
      renderNamed();

      expect(screen.queryByRole('region')).not.toBeInTheDocument();
      expect(screen.getByRole('table', { name: 'Warehouses' })).toBeVisible();
      expect(
        document.querySelector('[data-slot="table-container"]'),
      ).not.toHaveAttribute('tabindex');
    });

    it('becomes a named, focusable region when the table scrolls sideways', () => {
      vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(
        900,
      );
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(
        400,
      );
      renderNamed();

      const region = screen.getByRole('region', { name: 'Warehouses' });
      expect(region).toHaveAttribute('tabindex', '0');
      expect(screen.getByRole('table')).not.toHaveAttribute('aria-label');
    });
  });
});
