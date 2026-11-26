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

const MEDICINES: ItemCategoryResponse = {
  id: 'cat-med',
  parentId: null,
  code: 'MED',
  name: 'Medicines',
  isActive: true,
  itemCount: null,
  childCount: null,
  expiryAlertDays: 60,
};

function renderDialog(overrides: Partial<CategoryFormDialogProps> = {}) {
  const props: CategoryFormDialogProps = {
    open: true,
    onOpenChange: vi.fn(),
    mode: 'create',
    category: null,
    defaultParentId: '',
    parentOptions: [{ value: '', label: 'None (top-level)' }],
    isPending: false,
    onSubmit: vi.fn(),
    ...overrides,
  };
  const utils = renderWithProviders(<CategoryFormDialog {...props} />);
  return { ...utils, props };
}

function expiryInput() {
  return screen.findByRole('spinbutton', {
    name: tt('categories.form.expiryAlertDays'),
  });
}

describe('CategoryFormDialog expiry alert window', () => {
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

  it('renders an empty field with the inherit hint in create mode', async () => {
    renderDialog();

    expect(await expiryInput()).toHaveValue(null);
    expect(
      screen.getByText(tt('categories.form.expiryAlertDaysHint')),
    ).toBeInTheDocument();
  });

  it('submits the entered window', async () => {
    const { user, props } = renderDialog();

    await user.type(
      screen.getByLabelText(new RegExp(tt('categories.form.name'))),
      'Medicines',
    );
    await user.type(await expiryInput(), '30');
    await user.click(screen.getByRole('button', { name: tt('common.save') }));

    await waitFor(() => {
      expect(props.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Medicines', expiryAlertDays: 30 }),
      );
    });
  });

  it('prefills the stored window in edit mode and blocks values over 365', async () => {
    const { user, props } = renderDialog({ mode: 'edit', category: MEDICINES });

    const input = await expiryInput();
    expect(input).toHaveValue(60);
    await user.clear(input);
    await user.type(input, '400');
    await user.click(screen.getByRole('button', { name: tt('common.save') }));

    expect(
      await screen.findByText(
        tt('categories.validation.expiryAlertDaysInvalid'),
      ),
    ).toBeInTheDocument();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('hides the field in move mode', async () => {
    renderDialog({ mode: 'move', category: MEDICINES });

    expect(
      await screen.findByText(tt('categories.form.moveTitle')),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('spinbutton', {
        name: tt('categories.form.expiryAlertDays'),
      }),
    ).not.toBeInTheDocument();
  });

  it('labels the field in Arabic', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/categories');
    renderDialog();

    expect(
      await screen.findByRole('spinbutton', {
        name: 'نافذة تنبيه الصلاحية (يوم)',
      }),
    ).toBeInTheDocument();
  });
});
