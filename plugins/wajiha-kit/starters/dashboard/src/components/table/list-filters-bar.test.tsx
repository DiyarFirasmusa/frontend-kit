import { describe, expect, it, vi } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen, within } from '@/test/render';
import { ListFiltersBar, type ListFiltersBarProps } from './list-filters-bar';

const STATUS = {
  id: 'status',
  label: 'Status',
  options: [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ],
};

const TYPE = {
  id: 'type',
  label: 'Type',
  options: [{ value: 'TRANSIT', label: 'Transit' }],
};

function setup(overrides: Partial<ListFiltersBarProps> = {}) {
  const props: ListFiltersBarProps = {
    search: '',
    searchPlaceholder: 'Search items',
    filters: [STATUS, TYPE],
    filterValues: {},
    onFilterChange: vi.fn(),
    onSearchChange: vi.fn(),
    onClearFilters: vi.fn(),
    isDirty: false,
    ...overrides,
  };
  return { ...renderWithProviders(<ListFiltersBar {...props} />), props };
}

describe('ListFiltersBar', () => {
  it('shows every filter inline, reading its name while empty', () => {
    setup();

    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent(
      'Status',
    );
    expect(screen.getByRole('combobox', { name: 'Type' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: tt('common.showFilters') }),
    ).not.toBeInTheDocument();
  });

  it('shows the picked option and reports a change by filter id', async () => {
    const { user, props } = setup({ filterValues: { status: 'ACTIVE' } });

    const trigger = screen.getByRole('combobox', { name: 'Status' });
    expect(trigger).toHaveTextContent('Active');
    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Inactive' }));

    expect(props.onFilterChange).toHaveBeenCalledWith('status', 'INACTIVE');
  });

  it('renders quick chips as checkbox tiles that toggle', async () => {
    const onSelect = vi.fn();
    const { user } = setup({
      quickChips: [
        { id: 'mine', label: 'Created by me', active: true, onSelect },
      ],
    });

    const box = screen.getByRole('checkbox', { name: 'Created by me' });
    expect(box).toHaveAttribute('aria-checked', 'true');
    await user.click(box);

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('places controls in the given order and keeps the rest after them', () => {
    const { container } = setup({
      extras: [{ id: 'item', node: <button type="button">Item</button> }],
      order: ['item', 'type', 'search'],
    });

    const names = [
      ...container.querySelectorAll('input[type="search"], button'),
    ].map(
      (el) =>
        el.getAttribute('aria-label') ?? el.textContent?.trim() ?? el.tagName,
    );
    expect(names.slice(0, 4)).toEqual([
      'Item',
      'Type',
      tt('common.search'),
      'Status',
    ]);
  });

  it('renders the extra controls slot without a toggle', () => {
    setup({ extraFilters: <input aria-label="From date" /> });

    expect(screen.getByRole('textbox', { name: 'From date' })).toBeVisible();
  });

  it('shows reset only when dirty and clears search and filters', async () => {
    const { user, props, rerender } = setup();
    expect(
      screen.queryByRole('button', { name: tt('common.reset') }),
    ).not.toBeInTheDocument();

    rerender(<ListFiltersBar {...props} isDirty />);
    await user.click(screen.getByRole('button', { name: tt('common.reset') }));

    expect(props.onSearchChange).toHaveBeenCalledWith('');
    expect(props.onClearFilters).toHaveBeenCalledTimes(1);
  });

  it('hides the search field when asked', () => {
    setup({ hideSearch: true });

    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('labels the controls in Arabic', async () => {
    await setTestLanguage('ar');
    const { user } = setup();

    expect(screen.getByRole('searchbox', { name: 'بحث' })).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Status' }));
    const listbox = await screen.findByRole('listbox');
    expect(
      within(listbox).getByRole('option', { name: 'الكل' }),
    ).toBeInTheDocument();
  });
});
