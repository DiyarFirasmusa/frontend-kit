import { HttpResponse, http } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen, within } from '@/test/render';
import CategoriesContainer from './index';

const categories = [
  {
    id: 'cat-safety',
    parentId: null,
    code: 'SAFETY',
    name: 'Safety equipment',
  },
  {
    id: 'cat-hand',
    parentId: 'cat-safety',
    code: 'SAF-HAND',
    name: 'Hand protection',
  },
];

const listUrl = api(endpoints.itemCategories.list);
const attributesUrl = api(endpoints.itemCategories.attributes('cat-hand'));
const safetyAttributesUrl = api(
  endpoints.itemCategories.attributes('cat-safety'),
);
const removeUrl = api(endpoints.itemCategories.remove('cat-hand'));
const definitionsUrl = api(endpoints.attributeDefinitions.list);

function mockApi(removeStatus: number) {
  server.use(
    http.get(listUrl, () => HttpResponse.json(categories)),
    http.get(attributesUrl, () => HttpResponse.json([])),
    http.get(safetyAttributesUrl, () => HttpResponse.json([])),
    http.delete(removeUrl, () =>
      HttpResponse.json({}, { status: removeStatus }),
    ),
    http.get(definitionsUrl, () => HttpResponse.json([])),
  );
}

describe('CategoriesContainer (delete)', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  beforeEach(() => {
    signIn({ permissions: Object.values(PERMS.itemCategory) });
  });

  it('opens the blocked dialog when delete is rejected with a conflict', async () => {
    mockApi(409);
    const { user } = await renderWithRouter(
      <CategoriesContainer initialTab="categories" />,
      { path: '/categories' },
    );
    await user.click(await screen.findByText('Hand protection'));

    await user.click(
      await screen.findByRole('button', { name: tt('common.delete') }),
    );
    const confirm = await screen.findByRole('alertdialog');
    await user.click(
      within(confirm).getByRole('button', {
        name: tt('categories.delete.confirm'),
      }),
    );

    expect(
      await screen.findByRole('dialog', {
        name: tt('categories.blocked.title'),
      }),
    ).toBeInTheDocument();
  });

  it('shows item counts in the tree and blocks deleting a category in use', async () => {
    let deleteCalls = 0;
    server.use(
      http.get(listUrl, () =>
        HttpResponse.json([
          { ...categories[0], itemCount: 184, childCount: 1, isActive: true },
          { ...categories[1], itemCount: 62, childCount: 0, isActive: true },
        ]),
      ),
      http.get(attributesUrl, () => HttpResponse.json([])),
      http.get(safetyAttributesUrl, () => HttpResponse.json([])),
      http.get(safetyAttributesUrl, () => HttpResponse.json([])),
      http.get(definitionsUrl, () => HttpResponse.json([])),
      http.delete(removeUrl, () => {
        deleteCalls += 1;
        return HttpResponse.json({});
      }),
    );
    const { user } = await renderWithRouter(
      <CategoriesContainer initialTab="categories" />,
      { path: '/categories' },
    );

    expect(
      await screen.findAllByText(
        tt('categories.tree.itemCount', { count: 184 }),
      ),
    ).toHaveLength(2);
    await user.click(screen.getByText('Hand protection'));
    await user.click(
      await screen.findByRole('button', { name: tt('common.delete') }),
    );

    const blocked = await screen.findByRole('dialog', {
      name: tt('categories.blocked.title'),
    });
    expect(within(blocked).getAllByText('62')).toHaveLength(2);
    expect(
      within(blocked).getAllByText(tt('categories.blocked.none')),
    ).toHaveLength(2);
    expect(deleteCalls).toBe(0);
  });

  it('labels the tree item count in Arabic', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/categories');
    server.use(
      http.get(listUrl, () =>
        HttpResponse.json([
          { ...categories[0], itemCount: 1248, childCount: 0 },
        ]),
      ),
      http.get(definitionsUrl, () => HttpResponse.json([])),
    );
    await renderWithRouter(<CategoriesContainer initialTab="categories" />, {
      path: '/categories',
    });

    expect(await screen.findAllByText('الأصناف: 1248')).toHaveLength(2);
  });
});
