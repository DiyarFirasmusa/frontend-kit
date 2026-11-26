import { describe, expect, it, vi } from 'vitest';
import type { Column, ServerPagination } from '@/components/table/types';
import { setTestLanguage, tt } from '@/test/i18n';
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

const serverPage: ServerPagination = {
  page: 0,
  pageSize: 20,
  total: 40,
  totalPages: 2,
  onPageChange: vi.fn(),
};

function summaryIs(text: string) {
  return (_: string, el: Element | null) => el?.tagName === 'P' && el.textContent === text;
}

describe('DataTable states', () => {
  it('renders skeleton placeholders in each body row while loading', () => {
    const { container } = renderWithProviders(
      <DataTable
        data={[]}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading
        skeletonRows={3}
      />,
    );

    const bodyRows = screen.getAllByRole('row').slice(1);
    expect(bodyRows).toHaveLength(3);
    for (const row of bodyRows) {
      expect(row.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(1);
    }
    expect(container.querySelectorAll('tbody [data-slot="skeleton"]')).toHaveLength(3);
    expect(screen.queryByText(tt('ui.noResults'))).not.toBeInTheDocument();
  });

  it('renders the error state and retries', async () => {
    const onRetry = vi.fn();
    const { user } = renderWithProviders(
      <DataTable
        data={[]}
        columns={columns}
        getRowId={(row) => row.id}
        isError
        errorLabel="Network down"
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText(tt('ui.error'))).toBeInTheDocument();
    expect(screen.getByText('Network down')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: tt('ui.tryAgain') }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('renders the empty state when there are no rows', () => {
    renderWithProviders(<DataTable data={[]} columns={columns} getRowId={(row) => row.id} />);

    expect(screen.getByText(tt('ui.noResults'))).toBeInTheDocument();
  });

  it('renders the success state with rows and fires onRowClick', async () => {
    const onRowClick = vi.fn();
    const { user } = renderWithProviders(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        onRowClick={onRowClick}
      />,
    );

    expect(screen.getByText('Zara')).toBeInTheDocument();
    await user.click(screen.getByText('Amir'));
    expect(onRowClick).toHaveBeenCalledExactlyOnceWith(rows[1]);
  });
});

describe('DataTable pagination summary', () => {
  it('shows the summary for the current server page', () => {
    renderWithProviders(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        serverPagination={serverPage}
      />,
    );

    const summary = `${tt('ui.showing')} 1–20 ${tt('ui.of')} 40`;
    expect(screen.getByText(summaryIs(summary))).toBeInTheDocument();
  });

  it('translates the summary in Arabic', async () => {
    await setTestLanguage('ar');
    renderWithProviders(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        serverPagination={serverPage}
      />,
    );

    expect(screen.getByText(summaryIs('عرض 1–20 من 40'))).toBeInTheDocument();
  });
});
