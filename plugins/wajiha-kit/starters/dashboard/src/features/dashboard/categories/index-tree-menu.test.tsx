import { HttpResponse, http } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen, waitFor, within } from '@/test/render';
import CategoriesContainer from './index';

const categories = [
  {
    id: 'cat-safety',
    parentId: null,
    code: 'SAFETY',
    name: 'Safety equipment',
    itemCount: 184,
    childCount: 1,
    isActive: true,
  },
  {
    id: 'cat-storage',
    parentId: null,
    code: 'STORAGE',
    name: 'Storage devices',
    itemCount: 96,
    childCount: 0,
    isActive: true,
  },
  {
    id: 'cat-hand',
    parentId: 'cat-safety',
    code: 'SAF-HAND',
    name: 'Hand protection',
    itemCount: 62,
    childCount: 0,
    isActive: true,
  },
];

function mockApi(onUpdate?: (body: Record<string, unknown>) => void) {
  server.use(
    http.get(api(endpoints.itemCategories.list), () =>
      HttpResponse.json(categories),
    ),
    http.get(api(endpoints.itemCategories.attributes('cat-safety')), () =>
      HttpResponse.json([]),
    ),
    http.get(api(endpoints.itemCategories.attributes('cat-storage')), () =>
      HttpResponse.json([]),
    ),
    http.get(api(endpoints.itemCategories.attributes('cat-hand')), () =>
      HttpResponse.json([]),
    ),
    http.get(api(endpoints.attributeDefinitions.list), () =>
      HttpResponse.json([]),
    ),
    http.put(
      api(endpoints.itemCategories.update('cat-storage')),
      async ({ request }) => {
        onUpdate?.((await request.json()) as Record<string, unknown>);
        return HttpResponse.json({ ...categories[1], isActive: false });
      },
    ),
  );
}

function render() {
  return renderWithRouter(<CategoriesContainer initialTab="categories" />, {
    path: '/categories',
  });
}

describe('CategoriesContainer tree root row and node menu', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  beforeEach(() => {
    signIn({ permissions: Object.values(PERMS.itemCategory) });
  });

  it('shows "All items" with the sum of the root item counts', async () => {
    mockApi();
    await render();

    const allRow = await screen.findByRole('button', {
      name: new RegExp(tt('categories.tree.all')),
    });
    expect(allRow).toHaveTextContent('280');
  });

  it('shows the root view when "All items" is selected', async () => {
    mockApi();
    const { user } = await render();

    await user.click(
      await screen.findByRole('button', {
        name: new RegExp(tt('categories.tree.all')),
      }),
    );

    expect(
      await screen.findByText(tt('categories.detail.allCount', { count: 280 })),
    ).toBeInTheDocument();
    expect(
      screen.getByText(tt('categories.detail.allDescription')),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: tt('categories.assignments.attach'),
      }),
    ).not.toBeInTheDocument();
  });

  it('gives every node a menu with edit, disable, move and delete', async () => {
    mockApi();
    const { user } = await render();
    await screen.findByText('Storage devices');

    await user.click(
      screen.getByRole('button', {
        name: `${tt('common.actions')}: Storage devices`,
      }),
    );

    for (const name of [
      tt('common.edit'),
      tt('categories.actions.disable'),
      tt('categories.actions.move'),
      tt('common.delete'),
    ]) {
      expect(await screen.findByRole('menuitem', { name })).toBeInTheDocument();
    }
  });

  it('disables a category from its menu without selecting it', async () => {
    let body: Record<string, unknown> | undefined;
    mockApi((sent) => {
      body = sent;
    });
    const { user } = await render();
    await screen.findByText('Storage devices');

    await user.click(
      screen.getByRole('button', {
        name: `${tt('common.actions')}: Storage devices`,
      }),
    );
    await user.click(
      await screen.findByRole('menuitem', {
        name: tt('categories.actions.disable'),
      }),
    );

    await waitFor(() => {
      expect(body).toMatchObject({ code: 'STORAGE', isActive: false });
    });
  });

  it('opens the edit dialog for a node from its menu', async () => {
    mockApi();
    const { user } = await render();
    await screen.findByText('Storage devices');

    await user.click(
      screen.getByRole('button', {
        name: `${tt('common.actions')}: Storage devices`,
      }),
    );
    await user.click(
      await screen.findByRole('menuitem', { name: tt('common.edit') }),
    );

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByDisplayValue('STORAGE')).toBeInTheDocument();
  });

  it('writes the root row and menu labels in Arabic', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/categories');
    mockApi();
    await render();

    expect(
      await screen.findByRole('button', { name: /كل الأصناف/ }),
    ).toBeInTheDocument();
  });
});
