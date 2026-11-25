import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import type { ReactNode } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { createTestQueryClient, renderWithProviders } from '@/test/render';
import type {
  AttributeDefinitionResponse,
  CategoryAttributeResponse,
  ItemCategoryResponse,
} from '@/types/api/catalog';
import type { CategoriesTab } from '../types/types';
import { useCategoriesPage } from './use-categories-page';

const ALL_PERMISSIONS = [
  'item_category:read',
  'item_category:write',
  'item_category:delete',
  'attribute_definition:read',
  'attribute_definition:write',
  'attribute_definition:delete',
];

const CATEGORIES: ItemCategoryResponse[] = [
  {
    id: 'cat-safety',
    parentId: null,
    code: 'SAFETY',
    name: 'معدات السلامة',
    isActive: true,
    itemCount: null,
    childCount: null,
  },
  {
    id: 'cat-hand',
    parentId: 'cat-safety',
    code: 'SAF-HAND',
    name: 'حماية اليدين',
    isActive: true,
    itemCount: null,
    childCount: null,
  },
  {
    id: 'cat-gloves',
    parentId: 'cat-hand',
    code: 'GLOVES',
    name: 'قفازات',
    isActive: true,
    itemCount: null,
    childCount: null,
  },
  {
    id: 'cat-storage',
    parentId: null,
    code: 'STORAGE',
    name: 'أجهزة المخازن',
    isActive: true,
    itemCount: null,
    childCount: null,
  },
];

const DEFINITIONS: AttributeDefinitionResponse[] = [
  {
    id: 'attr-material',
    code: 'MATERIAL',
    name: 'المادة',
    dataType: 'TEXT',
    unitLabel: null,
    isActive: true,
    options: [],
  },
  {
    id: 'attr-color',
    code: 'COLOR',
    name: 'اللون',
    dataType: 'OPTION',
    unitLabel: null,
    isActive: true,
    options: [
      {
        id: 'opt-black',
        code: 'BLACK',
        label: 'أسود',
        sortOrder: 1,
        isActive: true,
      },
      {
        id: 'opt-blue',
        code: 'BLUE',
        label: 'أزرق',
        sortOrder: 2,
        isActive: true,
      },
    ],
  },
  {
    id: 'attr-weight',
    code: 'WEIGHT',
    name: 'الوزن',
    dataType: 'NUMBER',
    unitLabel: 'kg',
    isActive: true,
    options: null,
  },
];

const HAND_ASSIGNMENTS: CategoryAttributeResponse[] = [
  {
    id: 'asg-1',
    sourceCategoryId: 'cat-safety',
    sourceCategoryName: null,
    unitLabel: null,
    options: null,
    inherited: true,
    attributeDefinitionId: 'attr-material',
    attributeCode: 'MATERIAL',
    attributeName: 'المادة',
    dataType: 'TEXT',
    isRequired: true,
    isVariantAxis: false,
    sortOrder: 1,
  },
  {
    id: 'asg-2',
    sourceCategoryId: 'cat-hand',
    sourceCategoryName: null,
    unitLabel: null,
    options: null,
    inherited: false,
    attributeDefinitionId: 'attr-color',
    attributeCode: 'COLOR',
    attributeName: 'اللون',
    dataType: 'OPTION',
    isRequired: false,
    isVariantAxis: true,
    sortOrder: 2,
  },
];

function serveCatalog() {
  server.use(
    http.get(api(endpoints.itemCategories.list), () =>
      HttpResponse.json(CATEGORIES),
    ),
    http.get(api(endpoints.attributeDefinitions.list), () =>
      HttpResponse.json(DEFINITIONS),
    ),
    http.get(
      api(endpoints.itemCategories.attributes(':categoryId')),
      ({ params }) =>
        HttpResponse.json(
          params.categoryId === 'cat-hand' ? HAND_ASSIGNMENTS : [],
        ),
    ),
  );
}

function renderPage(initialTab: CategoriesTab = 'categories') {
  const queryClient = createTestQueryClient();
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return renderHook(() => useCategoriesPage(initialTab), { wrapper: Wrapper });
}

async function renderLoaded(initialTab: CategoriesTab = 'categories') {
  const hook = renderPage(initialTab);
  await waitFor(() => {
    expect(hook.result.current.categories.query.isSuccess).toBe(true);
  });
  return hook;
}

describe('useCategoriesPage', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  it('starts on the requested tab', () => {
    signIn({ permissions: ALL_PERMISSIONS });
    serveCatalog();
    const { result } = renderPage('attributes');
    expect(result.current.tab).toBe('attributes');
    expect(result.current.dir).toBe('ltr');
  });

  it('hides the attributes tab without attribute_definition:read', () => {
    signIn({
      permissions: ['item_category:read', 'item_category:write'],
      roles: [],
    });
    serveCatalog();
    const { result } = renderPage();
    expect(result.current.showAttributesTab).toBe(false);
    expect(result.current.canWriteAttribute).toBe(false);
  });

  it('builds the category tree from the list and filters it by search', async () => {
    signIn({ permissions: ALL_PERMISSIONS });
    serveCatalog();
    const { result } = await renderLoaded();

    const safety = result.current.categories.nodes.find(
      (node) => node.id === 'cat-safety',
    );
    expect(result.current.categories.nodes).toHaveLength(2);
    expect(safety?.children[0]?.id).toBe('cat-hand');
    expect(safety?.children[0]?.depth).toBe(1);

    act(() => {
      result.current.categories.setSearch('SAF-HAND');
    });
    expect(result.current.categories.isSearching).toBe(true);
    expect(result.current.categories.nodes.map((node) => node.id)).toEqual([
      'cat-safety',
    ]);
  });

  it('excludes the edited category and its descendants from parent options', async () => {
    signIn({ permissions: ALL_PERMISSIONS });
    serveCatalog();
    await setTestLanguage('en');
    const { result } = await renderLoaded();

    act(() => {
      result.current.categories.select('cat-safety');
    });
    act(() => {
      result.current.categories.onEditSelected();
    });

    const options = result.current.categoryDialog.parentOptions;
    expect(result.current.categoryDialog.mode).toBe('edit');
    expect(options[0]).toEqual({ value: '', label: 'None (top-level)' });
    const values = options.map((option) => option.value);
    expect(values).toContain('cat-storage');
    expect(values).not.toContain('cat-safety');
    expect(values).not.toContain('cat-hand');
    expect(values).not.toContain('cat-gloves');

    await setTestLanguage('ar');
    try {
      const arabic = await renderLoaded();
      const labels = arabic.result.current.categoryDialog.parentOptions;
      expect(labels[0]?.label).toBe(tt('categories.form.noParent'));
      expect(labels.find((option) => option.value === 'cat-hand')?.label).toBe(
        'معدات السلامة / حماية اليدين',
      );
    } finally {
      await setTestLanguage('en');
    }
  });

  it('ignores attach clicks while no category is selected', () => {
    signIn({ permissions: ALL_PERMISSIONS });
    serveCatalog();
    const { result } = renderPage();
    act(() => {
      result.current.assignments.onAttachClick();
    });
    expect(result.current.attachDialog.open).toBe(false);
  });

  it('opens the blocked dialog when deleting a category fails', async () => {
    signIn({ permissions: ALL_PERMISSIONS });
    serveCatalog();
    server.use(
      http.delete(api(endpoints.itemCategories.remove('cat-gloves')), () =>
        HttpResponse.json({ message: 'in use' }, { status: 409 }),
      ),
    );
    const { result } = await renderLoaded();

    act(() => {
      result.current.categories.select('cat-gloves');
    });
    act(() => {
      result.current.categories.onDeleteSelected();
    });
    expect(result.current.confirm.open).toBe(true);
    expect(result.current.confirm.kind).toBe('category');
    expect(result.current.confirm.name).toBe('قفازات');

    act(() => {
      result.current.confirm.onConfirm();
    });

    await waitFor(() => {
      expect(result.current.blockedDialog.open).toBe(true);
    });
    expect(result.current.blockedDialog.categoryName).toBe('قفازات');
    expect(result.current.blockedDialog.categoryPath).toBe(
      'معدات السلامة / حماية اليدين / قفازات',
    );
    expect(result.current.blockedDialog.canDeactivate).toBe(true);
    expect(result.current.confirm.open).toBe(false);
  });

  it('excludes definitions that are already linked from the attach options', async () => {
    signIn({ permissions: ALL_PERMISSIONS });
    serveCatalog();
    const { result } = await renderLoaded();

    act(() => {
      result.current.categories.select('cat-hand');
    });
    await waitFor(() => {
      expect(result.current.assignments.rows).toHaveLength(2);
    });

    const values = result.current.attachDialog.attributeOptions.map(
      (option) => option.value,
    );
    expect(values).toEqual(['attr-weight']);
    expect(result.current.attachDialog.attributeOptions[0]?.label).toBe(
      'الوزن (WEIGHT)',
    );
  });

  it('closes the confirm dialog after a successful detach', async () => {
    signIn({ permissions: ALL_PERMISSIONS });
    serveCatalog();
    server.use(
      http.delete(
        api(endpoints.itemCategories.attribute('cat-hand', 'asg-2')),
        () => new HttpResponse(null, { status: 204 }),
      ),
    );
    const { result } = await renderLoaded();

    act(() => {
      result.current.categories.select('cat-hand');
    });
    await waitFor(() => {
      expect(result.current.assignments.rows).toHaveLength(2);
    });

    const row = result.current.assignments.rows.find(
      (item) => item.id === 'asg-2',
    );
    const actions = result.current.assignments.columns.find(
      (column) => column.id === 'actions',
    );
    if (!row || !actions?.cell) {
      throw new Error('expected the asg-2 row and its actions cell');
    }
    const view = renderWithProviders(<>{actions.cell(row)}</>);
    await view.user.click(
      view.getByRole('button', { name: tt('categories.assignments.detach') }),
    );

    expect(result.current.confirm.open).toBe(true);
    expect(result.current.confirm.kind).toBe('assignment');
    expect(result.current.confirm.name).toBe('اللون');

    act(() => {
      result.current.confirm.onConfirm();
    });
    await waitFor(() => {
      expect(result.current.confirm.open).toBe(false);
    });
  });

  it('selects a newly created category once the list refetches', async () => {
    signIn({ permissions: ALL_PERMISSIONS });
    serveCatalog();
    const created: ItemCategoryResponse = {
      id: 'cat-new',
      parentId: null,
      code: 'NEW',
      name: 'جديد',
      isActive: true,
      itemCount: null,
      childCount: null,
    };
    let list = CATEGORIES;
    server.use(
      http.get(api(endpoints.itemCategories.list), () =>
        HttpResponse.json(list),
      ),
      http.post(api(endpoints.itemCategories.create), () => {
        list = [...CATEGORIES, created];
        return HttpResponse.json(created, { status: 201 });
      }),
    );
    const { result } = await renderLoaded();

    act(() => {
      result.current.onAddCategory();
    });
    act(() => {
      result.current.categoryDialog.onSubmit({
        code: 'NEW',
        name: 'جديد',
        parentId: '',
        isActive: true,
      });
    });

    await waitFor(() => {
      expect(
        result.current.categories.query.data?.some(
          (category) => category.id === 'cat-new',
        ),
      ).toBe(true);
    });
    expect(result.current.categories.selectedId).toBe('cat-new');
  });

  it('saves a reordered option list with one reorder request', async () => {
    signIn({ permissions: ALL_PERMISSIONS });
    serveCatalog();
    const writes: unknown[] = [];
    server.use(
      http.put(
        api(endpoints.attributeDefinitions.optionsOrder('attr-color')),
        async ({ request }) => {
          writes.push(await request.json());
          return HttpResponse.json([]);
        },
      ),
    );
    const { result } = await renderLoaded();

    act(() => {
      result.current.categories.select('cat-hand');
    });
    await waitFor(() => {
      expect(result.current.assignments.rows).toHaveLength(2);
    });
    const row = result.current.assignments.rows.find(
      (item) => item.id === 'asg-2',
    );
    if (!row) {
      throw new Error('expected the asg-2 row');
    }
    const view = renderWithProviders(
      <div>
        {result.current.assignments.columns.map((column) => (
          <div key={column.id}>{column.cell?.(row)}</div>
        ))}
      </div>,
    );
    await view.user.click(
      view.getByRole('button', {
        name: tt('categories.assignments.editOptions'),
      }),
    );
    expect(result.current.optionsDialog.open).toBe(true);

    act(() => {
      result.current.optionsDialog.onSave({
        deletes: [],
        updates: [],
        creates: [],
        order: ['opt-blue', 'opt-black'],
      });
    });

    await waitFor(() => {
      expect(writes).toHaveLength(1);
    });
    expect(writes[0]).toEqual({ optionIds: ['opt-blue', 'opt-black'] });
  });
});
