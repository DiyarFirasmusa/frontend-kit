import { beforeAll, describe, expect, it, vi } from 'vitest';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen, within } from '@/test/render';
import type { AttributeDefinitionResponse } from '@/types/api/catalog';
import { AttributeOptionsDialog } from './attribute-options-dialog';

function makeAttribute(
  overrides: Partial<AttributeDefinitionResponse> = {},
): AttributeDefinitionResponse {
  return {
    id: 'attr-color',
    code: 'COLOR',
    name: 'Color',
    dataType: 'OPTION',
    unitLabel: null,
    isActive: true,
    options: [
      { id: 'o-2', code: 'blue', label: 'Blue', sortOrder: 2, isActive: true },
      {
        id: 'o-1',
        code: 'black',
        label: 'Black',
        sortOrder: 1,
        isActive: true,
      },
      { id: 'o-3', code: 'grey', label: 'Grey', sortOrder: 3, isActive: false },
    ],
    ...overrides,
  };
}

function renderDialog(
  attribute: AttributeDefinitionResponse | null = makeAttribute(),
) {
  const onSave = vi.fn();
  const onOpenChange = vi.fn();
  const view = renderWithProviders(
    <AttributeOptionsDialog
      open
      attribute={attribute}
      isPending={false}
      onOpenChange={onOpenChange}
      onSave={onSave}
    />,
  );
  return { ...view, onSave, onOpenChange };
}

const saveButton = () =>
  screen.getByRole('button', { name: tt('categories.options.save') });
const optionRows = () => screen.getAllByRole('listitem');

describe('AttributeOptionsDialog', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  it('lists the options in order with their order number and the attribute title', async () => {
    renderDialog();

    expect(
      await screen.findByText(
        tt('categories.options.title', { name: 'Color' }),
      ),
    ).toBeInTheDocument();
    const rows = optionRows();
    expect(rows).toHaveLength(3);
    expect(within(rows[0]!).getByText('1')).toBeInTheDocument();
    expect(within(rows[0]!).getByText('Black')).toBeInTheDocument();
    expect(within(rows[1]!).getByText('Blue')).toBeInTheDocument();
    expect(within(rows[2]!).getByText('3')).toBeInTheDocument();
  });

  it('keeps "Save options" disabled until something changes', async () => {
    const { user } = renderDialog();
    await screen.findAllByRole('listitem');
    expect(saveButton()).toBeDisabled();

    await user.click(
      screen.getByRole('button', {
        name: `${tt('categories.options.moveUp')}: Blue`,
      }),
    );

    expect(saveButton()).toBeEnabled();
    expect(within(optionRows()[0]!).getByText('Blue')).toBeInTheDocument();
  });

  it('sends nothing until Save, then saves every change together', async () => {
    const { user, onSave } = renderDialog();
    await screen.findAllByRole('listitem');

    await user.click(
      screen.getByRole('button', {
        name: `${tt('categories.options.moveUp')}: Blue`,
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Delete: Grey' }));
    await user.click(
      screen.getByRole('button', { name: tt('categories.options.add') }),
    );
    await user.type(
      screen.getByLabelText(new RegExp(tt('categories.options.label'))),
      'Red',
    );
    await user.click(
      screen.getByRole('button', { name: tt('categories.options.confirmAdd') }),
    );
    expect(onSave).not.toHaveBeenCalled();

    await user.click(saveButton());

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({
      deletes: ['o-3'],
      updates: [],
      creates: [{ label: 'Red', sortOrder: 4, isActive: true }],
      order: ['o-2', 'o-1', 0],
    });
  });

  it('edits an option in the draft', async () => {
    const { user, onSave } = renderDialog();
    await screen.findAllByRole('listitem');

    await user.click(screen.getByRole('button', { name: 'Edit: Black' }));
    const label = screen.getByLabelText(
      new RegExp(tt('categories.options.label')),
    );
    expect(label).toHaveValue('Black');
    await user.clear(label);
    await user.type(label, 'Jet black');
    await user.click(
      screen.getByRole('button', {
        name: tt('categories.options.confirmEdit'),
      }),
    );
    await user.click(saveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        updates: [
          expect.objectContaining({
            id: 'o-1',
            payload: expect.objectContaining({ label: 'Jet black' }),
          }),
        ],
      }),
    );
  });

  it('disables move up on the first row and move down on the last', async () => {
    renderDialog();

    const up = await screen.findAllByRole('button', {
      name: new RegExp(tt('categories.options.moveUp')),
    });
    const down = screen.getAllByRole('button', {
      name: new RegExp(tt('categories.options.moveDown')),
    });
    expect(up[0]).toBeDisabled();
    expect(up[1]).toBeEnabled();
    expect(down[2]).toBeDisabled();
  });

  it('cancels without saving', async () => {
    const { user, onSave, onOpenChange } = renderDialog();
    await screen.findAllByRole('listitem');

    await user.click(screen.getByRole('button', { name: 'Delete: Grey' }));
    await user.click(screen.getByRole('button', { name: tt('common.cancel') }));

    expect(onSave).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows the empty state when there are no options', async () => {
    renderDialog(makeAttribute({ options: [] }));

    expect(
      await screen.findByText(tt('categories.options.empty')),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('renders the Arabic title', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/categories');
    renderDialog(makeAttribute({ name: 'اللون' }));

    expect(await screen.findByText('خيارات خاصية اللون')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'حفظ الخيارات' }),
    ).toBeInTheDocument();
  });
});
