import { expect, it, vi } from 'vitest';
import { Trash2 } from '@/components/ui/icons';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { DataTableRowActions } from './data-table-row-actions';

function setup() {
  const onView = vi.fn();
  const onDelete = vi.fn();
  const result = renderWithProviders(
    <DataTableRowActions
      actions={[
        { id: 'view', label: 'View', onSelect: onView },
        {
          id: 'delete',
          label: 'Delete',
          icon: Trash2,
          variant: 'destructive',
          separatorBefore: true,
          onSelect: onDelete,
        },
      ]}
    />,
  );
  return { ...result, onView, onDelete };
}

it('renders nothing without actions', () => {
  renderWithProviders(<DataTableRowActions actions={[]} />);

  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('keeps the inline buttons for wide screens', async () => {
  const { user, onView } = setup();

  await user.click(screen.getByRole('button', { name: 'View' }));

  expect(onView).toHaveBeenCalledTimes(1);
});

it('shows the action label as a tooltip on hover', async () => {
  const { user } = setup();

  await user.hover(screen.getByRole('button', { name: 'View' }));

  expect(
    await screen.findByText('View', {
      selector: '[data-slot="tooltip-content"]',
    }),
  ).toBeInTheDocument();
});

it('renders the inline action as an icon-only button when it has an icon', () => {
  renderWithProviders(
    <DataTableRowActions
      actions={[{ id: 'delete', label: 'Delete', icon: Trash2, onSelect: vi.fn() }]}
    />,
  );

  const button = screen.getByRole('button', { name: 'Delete' });
  expect(button).toHaveClass('row-action');
  expect(button.querySelector('svg')).not.toBeNull();
});

it('renders a label-only action as text without an icon', () => {
  renderWithProviders(
    <DataTableRowActions actions={[{ id: 'edit', label: 'Edit reason', onSelect: vi.fn() }]} />,
  );

  const button = screen.getByRole('button', { name: 'Edit reason' });
  expect(button).toHaveClass('row-action');
  expect(button.querySelector('svg')).toBeNull();
  expect(button).toHaveTextContent('Edit reason');
});

it('offers every action in a dots menu for narrow screens', async () => {
  const { user, onDelete } = setup();

  await user.click(screen.getByRole('button', { name: tt('ui.actions') }));
  await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));

  expect(onDelete).toHaveBeenCalledTimes(1);
});

it('does not run a disabled action from the menu', async () => {
  const onSelect = vi.fn();
  const { user } = renderWithProviders(
    <DataTableRowActions actions={[{ id: 'edit', label: 'Edit', disabled: true, onSelect }]} />,
  );

  await user.click(screen.getByRole('button', { name: tt('ui.actions') }));
  await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));

  expect(onSelect).not.toHaveBeenCalled();
});

it('keeps a disabled inline action hoverable so its tooltip explains why', async () => {
  const onSelect = vi.fn();
  const { user } = renderWithProviders(
    <DataTableRowActions
      actions={[
        {
          id: 'approve',
          label: 'Approve',
          icon: Trash2,
          title: 'Needs a second approver',
          disabled: true,
          onSelect,
        },
      ]}
    />,
  );

  const button = screen.getByRole('button', { name: 'Approve' });
  expect(button).toHaveAttribute('aria-disabled', 'true');
  await user.hover(button);

  expect(
    await screen.findByText('Needs a second approver', {
      selector: '[data-slot="tooltip-content"]',
    }),
  ).toBeInTheDocument();
  await user.click(button);
  expect(onSelect).not.toHaveBeenCalled();
});

it('labels the dots menu trigger in Arabic when the language is ar', async () => {
  await setTestLanguage('ar');
  renderWithProviders(
    <DataTableRowActions actions={[{ id: 'view', label: 'View', onSelect: vi.fn() }]} />,
  );

  expect(screen.getByRole('button', { name: tt('ui.actions') })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'إجراءات' })).toBeInTheDocument();
});
