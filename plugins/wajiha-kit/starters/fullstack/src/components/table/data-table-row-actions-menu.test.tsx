import { expect, it, vi } from 'vitest';
import { Check, Trash2 } from '@/components/ui/icons';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { DataTableRowActions } from './data-table-row-actions';

it('renders only the dots trigger in the menu variant', async () => {
  const onDelete = vi.fn();
  const { user } = renderWithProviders(
    <DataTableRowActions
      variant="menu"
      menuLabel="Row menu: BGD-01"
      actions={[
        { id: 'view', label: 'View', onSelect: vi.fn() },
        {
          id: 'delete',
          label: 'Delete',
          icon: Trash2,
          variant: 'destructive',
          onSelect: onDelete,
        },
      ]}
    />,
  );

  expect(screen.getAllByRole('button')).toHaveLength(1);
  const trigger = screen.getByRole('button', { name: 'Row menu: BGD-01' });
  expect(trigger).toHaveClass('row-action-menu');
  await user.click(trigger);
  await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));

  expect(onDelete).toHaveBeenCalledTimes(1);
});

it('renders nothing in the menu variant without actions', () => {
  renderWithProviders(<DataTableRowActions variant="menu" actions={[]} />);

  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('draws icon actions as stroked rounded squares in their tone', () => {
  renderWithProviders(
    <DataTableRowActions
      actions={[
        {
          id: 'approve',
          label: 'Approve',
          icon: Check,
          variant: 'success',
          onSelect: vi.fn(),
        },
      ]}
    />,
  );

  const button = screen.getByRole('button', { name: 'Approve' });
  expect(button).toHaveClass('row-action', 'row-action-icon');
  expect(button).toHaveClass('row-action-success');
});

it('labels the menu trigger in Arabic by default', async () => {
  await setTestLanguage('ar');
  renderWithProviders(
    <DataTableRowActions
      variant="menu"
      actions={[{ id: 'view', label: 'View', onSelect: vi.fn() }]}
    />,
  );

  expect(screen.getByRole('button', { name: 'إجراءات' })).toBeInTheDocument();
  expect(tt('ui.actions')).toBe('إجراءات');
});
