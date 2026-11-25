import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen, within } from '@/test/render';
import {
  CategoryBlockedDialog,
  type CategoryBlockedDialogProps,
} from './category-blocked-dialog';

function renderBlocked(overrides: Partial<CategoryBlockedDialogProps> = {}) {
  const props: CategoryBlockedDialogProps = {
    open: true,
    onOpenChange: vi.fn(),
    categoryName: 'Hand protection',
    categoryPath: 'Safety / Hand protection',
    itemCount: 62,
    childCount: 3,
    isActive: true,
    canDeactivate: true,
    isPending: false,
    onDeactivate: vi.fn(),
    ...overrides,
  };
  const utils = renderWithProviders(<CategoryBlockedDialog {...props} />);
  return { ...utils, props };
}

describe('CategoryBlockedDialog', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  beforeEach(() => {
    signIn({ permissions: ['item_category:write', 'item_category:delete'] });
  });

  it('shows the title, the reason text and the category name and path', async () => {
    renderBlocked();

    expect(
      await screen.findByText(tt('categories.blocked.title')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(tt('categories.blocked.reason'), { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText('Hand protection')).toBeInTheDocument();
    expect(
      screen.getByText('Safety / Hand protection', { exact: false }),
    ).toBeInTheDocument();
  });

  it('lists the linked item and child category counts with the status', async () => {
    renderBlocked();

    const items = await screen.findByText(tt('categories.blocked.items'));
    expect(items.nextElementSibling).toHaveTextContent('62');
    expect(
      screen.getByText(tt('categories.blocked.children')).nextElementSibling,
    ).toHaveTextContent(tt('categories.blocked.present'));
    expect(
      screen.getByText(tt('categories.blocked.status')).nextElementSibling,
    ).toHaveTextContent(tt('common.active'));
  });

  it('renders an em dash for unknown counts', async () => {
    renderBlocked({ itemCount: null, childCount: null, isActive: false });

    const items = await screen.findByText(tt('categories.blocked.items'));
    expect(items.nextElementSibling).toHaveTextContent('—');
    expect(
      screen.getByText(tt('categories.blocked.children')).nextElementSibling,
    ).toHaveTextContent('—');
    expect(
      screen.getByText(tt('categories.blocked.status')).nextElementSibling,
    ).toHaveTextContent(tt('common.inactive'));
  });

  it('hides the deactivate button when the category cannot be deactivated', async () => {
    renderBlocked({ canDeactivate: false });

    await screen.findByText(tt('categories.blocked.title'));
    expect(
      screen.queryByRole('button', {
        name: tt('categories.blocked.deactivate'),
      }),
    ).not.toBeInTheDocument();
  });

  it('calls onDeactivate when the deactivate button is clicked', async () => {
    const { user, props } = renderBlocked();

    await user.click(
      await screen.findByRole('button', {
        name: tt('categories.blocked.deactivate'),
      }),
    );

    expect(props.onDeactivate).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenChange(false) when the footer close button is clicked', async () => {
    const { user, props } = renderBlocked();

    const deactivate = await screen.findByRole('button', {
      name: tt('categories.blocked.deactivate'),
    });
    const footer = deactivate.parentElement;
    if (!footer) {
      throw new Error('footer not found');
    }
    await user.click(
      within(footer).getByRole('button', { name: tt('common.close') }),
    );

    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders the Arabic title when the language is Arabic', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/categories');
    renderBlocked();

    expect(
      await screen.findByText(tt('categories.blocked.title')),
    ).toBeInTheDocument();
    expect(screen.getByText('الفروع')).toBeInTheDocument();
  });
});
