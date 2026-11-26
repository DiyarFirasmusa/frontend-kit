import { beforeAll, describe, expect, it, vi } from 'vitest';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { setTestLanguage } from '@/test/i18n';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import type { CategoryTreeNode } from '../types/types';
import { CategoryTree } from './category-tree';

function node(
  id: string,
  name: string,
  code: string,
  children: CategoryTreeNode[] = [],
  depth = 0,
): CategoryTreeNode {
  return {
    id,
    depth,
    category: {
      id,
      parentId: null,
      code,
      name,
      isActive: true,
      itemCount: null,
      childCount: null,
    },
    children,
  };
}

const nodes: CategoryTreeNode[] = [
  node('cat-safety', 'معدات السلامة', 'SAFETY', [
    node('cat-hand', 'حماية اليدين', 'SAF-HAND', [], 1),
  ]),
  node('cat-storage', 'أجهزة المخازن', 'STORAGE'),
];

function renderTree(
  overrides: Partial<Parameters<typeof CategoryTree>[0]> = {},
) {
  const props = {
    nodes,
    selectedId: null,
    onSelect: vi.fn(),
    search: '',
    onSearchChange: vi.fn(),
    isSearching: false,
    ...overrides,
  };
  const { user, rerender } = renderWithProviders(<CategoryTree {...props} />);
  return { ...props, user, rerender };
}

describe('CategoryTree', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  it('renders category names and codes', () => {
    renderTree();
    expect(screen.getByRole('button', { name: /معدات السلامة/ })).toBeVisible();
    expect(screen.getByText('حماية اليدين')).toBeVisible();
    expect(screen.getByTitle('STORAGE')).toBeVisible();
  });

  it('keeps the search field out of the column flex-basis (it would become a height)', () => {
    renderTree();
    const field = screen.getByRole('searchbox').parentElement;
    expect(field).toHaveClass('flex-none', 'basis-auto');
    expect(field).not.toHaveClass('basis-56');
  });

  it('selects a row by id and marks it pressed', async () => {
    const onSelect = vi.fn();
    const { user } = renderTree({ onSelect, selectedId: 'cat-storage' });

    expect(
      screen.getByRole('button', { name: /أجهزة المخازن/ }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: /معدات السلامة/ }),
    ).toHaveAttribute('aria-pressed', 'false');

    await user.click(screen.getByRole('button', { name: /معدات السلامة/ }));
    expect(onSelect).toHaveBeenCalledWith('cat-safety');
  });

  it('hides children when a branch is collapsed', async () => {
    const { user } = renderTree();
    expect(screen.getByText('حماية اليدين')).toBeVisible();

    const collapse = screen.getByRole('button', { name: 'Collapse' });
    expect(collapse).toHaveAttribute('aria-expanded', 'true');
    await user.click(collapse);

    expect(screen.queryByText('حماية اليدين')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('re-expands a collapsed branch when Expand is clicked', async () => {
    const { user } = renderTree();
    await user.click(screen.getByRole('button', { name: 'Collapse' }));
    expect(screen.queryByText('حماية اليدين')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expand' }));
    expect(screen.getByText('حماية اليدين')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Collapse' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('disables the expand toggles while searching', async () => {
    const onSearchChange = vi.fn();
    const { user, rerender, ...props } = renderTree({ onSearchChange });
    await user.click(screen.getByRole('button', { name: 'Collapse' }));
    expect(screen.queryByText('حماية اليدين')).not.toBeInTheDocument();

    rerender(
      <CategoryTree
        {...props}
        search="حماية"
        isSearching
        onSearchChange={onSearchChange}
      />,
    );
    const toggle = screen.getByRole('button', { name: 'Collapse' });
    expect(toggle).toBeDisabled();
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(toggle);
    expect(screen.getByText('حماية اليدين')).toBeVisible();
  });

  it('reveals matches inside a collapsed branch while searching', async () => {
    const { user, rerender, ...props } = renderTree();
    await user.click(screen.getByRole('button', { name: 'Collapse' }));
    expect(screen.queryByText('حماية اليدين')).not.toBeInTheDocument();

    rerender(<CategoryTree {...props} search="حماية" isSearching />);
    expect(screen.getByText('حماية اليدين')).toBeVisible();
  });

  it('shows the no-match message when searching with no nodes', () => {
    renderTree({ nodes: [], search: 'zzz', isSearching: true });
    expect(
      screen.getByText('No categories match your search.'),
    ).toBeInTheDocument();
  });

  it('commits the search text once typing pauses', async () => {
    const onSearchChange = vi.fn();
    const { user } = renderTree({ onSearchChange });
    await user.type(
      screen.getByRole('searchbox', { name: 'Search categories' }),
      'h',
    );
    expect(onSearchChange).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('h');
    });
    expect(onSearchChange).toHaveBeenCalledTimes(1);
  });

  it('renders Arabic labels in RTL language', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/categories');
    renderTree({ nodes: [], search: 'zzz', isSearching: true });
    expect(
      screen.getByRole('searchbox', { name: 'ابحث عن تصنيف' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('لا توجد تصنيفات مطابقة للبحث.'),
    ).toBeInTheDocument();
  });
});
