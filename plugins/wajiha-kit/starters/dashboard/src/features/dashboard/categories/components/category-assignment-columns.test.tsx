import { useTable } from '@tanstack/react-table';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { dataTableFeatures } from '@/components/table/table-features';
import i18n, { loadFeatureLocale } from '@/lib/i18n/i18n';
import { renderWithProviders, screen } from '@/test/render';
import type { AssignmentRow } from '../types/types';
import { getCategoryAssignmentColumns } from './category-assignment-columns';

const t = i18n.t.bind(i18n);

function row(overrides: Partial<AssignmentRow> = {}): AssignmentRow {
  return {
    id: 'asg-1',
    sourceCategoryId: 'cat-hand',
    sourceCategoryName: 'Hand protection',
    inherited: false,
    attributeDefinitionId: 'attr-color',
    attributeCode: 'COLOR',
    attributeName: 'Color',
    dataType: 'OPTION',
    unitLabel: null,
    options: [],
    isRequired: false,
    isVariantAxis: false,
    sortOrder: 1,
    sourceName: 'Hand protection',
    ...overrides,
  };
}

function Cells({
  data,
  canWrite,
  handlers,
}: {
  data: AssignmentRow[];
  canWrite: boolean;
  handlers: Parameters<typeof getCategoryAssignmentColumns>[0];
}) {
  const columns = getCategoryAssignmentColumns({ ...handlers, canWrite });
  const table = useTable({ features: dataTableFeatures, columns, data });
  return (
    <div>
      {table.getRowModel().rows.map((r) =>
        r.getVisibleCells().map((cell) => (
          <div key={cell.id}>
            <table.FlexRender cell={cell} />
          </div>
        )),
      )}
    </div>
  );
}

function renderRow(data: AssignmentRow, canWrite = true) {
  const handlers = {
    t,
    canWrite,
    onToggleRequired: vi.fn(),
    onToggleVariantAxis: vi.fn(),
    onEditOptions: vi.fn(),
    onDetach: vi.fn(),
  };
  const view = renderWithProviders(
    <Cells data={[data]} canWrite={canWrite} handlers={handlers} />,
  );
  return { ...view, handlers };
}

describe('getCategoryAssignmentColumns', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  it('ends with the actions column and sorts nothing', () => {
    const columns = getCategoryAssignmentColumns({
      t,
      canWrite: true,
      onToggleRequired: vi.fn(),
      onToggleVariantAxis: vi.fn(),
      onEditOptions: vi.fn(),
      onDetach: vi.fn(),
    });
    expect(columns.at(-1)?.id).toBe('actions');
    expect(columns.every((column) => column.enableSorting === false)).toBe(
      true,
    );
  });

  it('toggles the flags and names the row on detach', async () => {
    const { user, handlers } = renderRow(row());
    const [required, axis] = screen.getAllByRole('switch');
    if (!required || !axis) {
      throw new Error('switches missing');
    }
    await user.click(required);
    expect(handlers.onToggleRequired).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'asg-1' }),
      true,
    );
    await user.click(axis);
    expect(handlers.onToggleVariantAxis).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: /^Detach Color/ }));
    expect(handlers.onDetach).toHaveBeenCalledOnce();
  });

  it('locks an inherited row and hides detach', () => {
    renderRow(row({ inherited: true }));
    for (const toggle of screen.getAllByRole('switch')) {
      expect(toggle).toHaveAttribute('aria-disabled', 'true');
    }
    expect(screen.queryByRole('button', { name: /^Detach/ })).toBeNull();
    expect(
      screen.getByText('Inherited attribute, read-only'),
    ).toBeInTheDocument();
  });

  it('locks everything without the update permission', () => {
    renderRow(row(), false);
    for (const toggle of screen.getAllByRole('switch')) {
      expect(toggle).toHaveAttribute('aria-disabled', 'true');
    }
    expect(screen.queryByRole('button', { name: /Edit options/ })).toBeNull();
  });
});
