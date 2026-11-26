import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import type { ItemCategoryResponse } from '@/types/api/catalog';
import {
  CategoryFormDialog,
  type CategoryFormDialogProps,
} from './category-form-dialog';

const PARENTS = [
  { value: '', label: 'None (top-level)' },
  { value: 'cat-safety', label: 'Safety' },
];

const HAND: ItemCategoryResponse = {
  id: 'cat-hand',
  parentId: 'cat-safety',
  code: 'SAF-HAND',
  name: 'Hand protection',
  isActive: true,
  itemCount: null,
  childCount: null,
};

function renderDialog(overrides: Partial<CategoryFormDialogProps> = {}) {
  const props: CategoryFormDialogProps = {
    open: true,
    onOpenChange: vi.fn(),
    mode: 'create',
    category: null,
    defaultParentId: '',
    parentOptions: PARENTS,
    isPending: false,
    onSubmit: vi.fn(),
    ...overrides,
  };
  const utils = renderWithProviders(<CategoryFormDialog {...props} />);
  return { ...utils, props };
}

describe('CategoryFormDialog', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  beforeEach(() => {
    signIn({
      permissions: [
        'item_category:read',
        'item_category:create',
        'item_category:update',
      ],
    });
  });

  it('renders empty fields and the no-parent option in create mode', async () => {
    const { user } = renderDialog();

    expect(
      await screen.findByLabelText(new RegExp(tt('categories.form.name'))),
    ).toHaveValue('');
    expect(
      screen.queryByLabelText(new RegExp(tt('categories.form.code'))),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(tt('categories.form.createTitle')),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('combobox', {
        name: new RegExp(tt('categories.form.parent')),
      }),
    );
    expect(
      await screen.findByRole('option', {
        name: tt('categories.form.noParent'),
      }),
    ).toBeInTheDocument();
  });

  it('prefills code and name from the category in edit mode', async () => {
    renderDialog({ mode: 'edit', category: HAND });

    expect(
      await screen.findByLabelText(new RegExp(tt('categories.form.code'))),
    ).toHaveValue('SAF-HAND');
    expect(
      screen.getByLabelText(new RegExp(tt('categories.form.name'))),
    ).toHaveValue('Hand protection');
    expect(
      screen.getByText(tt('categories.form.editTitle')),
    ).toBeInTheDocument();
  });

  it('shows the translated required message when the name is empty', async () => {
    const { user } = renderDialog();

    await user.click(
      await screen.findByRole('button', { name: tt('common.save') }),
    );

    expect(
      (await screen.findAllByText(tt('categories.validation.required'))).length,
    ).toBeGreaterThan(0);
  });

  it('submits trimmed values and keeps parentId empty for top-level categories', async () => {
    const { user, props } = renderDialog();

    await user.type(
      await screen.findByLabelText(new RegExp(tt('categories.form.name'))),
      '  Safety gear  ',
    );
    await user.click(screen.getByRole('button', { name: tt('common.save') }));

    await waitFor(() => {
      expect(props.onSubmit).toHaveBeenCalledWith({
        code: '',
        name: 'Safety gear',
        parentId: '',
        isActive: true,
      });
    });
  });

  it('uses the move title and description in move mode', async () => {
    renderDialog({ mode: 'move', category: HAND });

    expect(
      await screen.findByText(tt('categories.form.moveTitle')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(tt('categories.form.moveDescription'))),
    ).toBeInTheDocument();
  });

  it('renders the Arabic title when the language is Arabic', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/categories');
    renderDialog();

    expect(
      await screen.findByText(tt('categories.form.createTitle')),
    ).toBeInTheDocument();
  });
});
