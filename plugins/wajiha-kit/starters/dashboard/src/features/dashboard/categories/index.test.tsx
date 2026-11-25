import { HttpResponse, delay, http, type JsonBodyType } from 'msw';
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
const definitionsUrl = api(endpoints.attributeDefinitions.list);

interface Overrides {
  categories?: JsonBodyType;
  categoriesStatus?: number;
  categoryLoad?: () => unknown;
}

function mockApi(o: Overrides = {}) {
  server.use(
    http.get(listUrl, async () => {
      await o.categoryLoad?.();
      return HttpResponse.json(o.categories ?? categories, {
        status: o.categoriesStatus ?? 200,
      });
    }),
    http.get(attributesUrl, () => HttpResponse.json([])),
    http.get(safetyAttributesUrl, () => HttpResponse.json([])),
    http.get(definitionsUrl, () => HttpResponse.json([])),
  );
}

const render = () =>
  renderWithRouter(<CategoriesContainer initialTab="categories" />, {
    path: '/categories',
  });

describe('CategoriesContainer (categories tab)', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  beforeEach(() => {
    signIn({ permissions: Object.values(PERMS.itemCategory) });
  });

  it('shows the loading state while categories load', async () => {
    mockApi({ categoryLoad: () => delay('infinite') });
    await render();

    expect(await screen.findByText(tt('common.loading'))).toBeInTheDocument();
  });

  it('shows the load error and retries the category request', async () => {
    let calls = 0;
    mockApi({
      categoriesStatus: 500,
      categoryLoad: () => {
        calls += 1;
      },
    });
    const { user } = await render();

    expect(await screen.findByText(tt('common.loadError'))).toBeInTheDocument();
    const before = calls;
    await user.click(
      screen.getByRole('button', { name: tt('common.tryAgain') }),
    );
    await waitFor(() => {
      expect(calls).toBeGreaterThan(before);
    });
  });

  it('shows the empty tree message in English', async () => {
    mockApi({ categories: [] });
    await render();

    expect(
      await screen.findByText(tt('categories.tree.empty')),
    ).toBeInTheDocument();
  });

  it('shows the empty tree message in Arabic', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/categories');
    mockApi({ categories: [] });
    await render();

    expect(
      await screen.findByText(tt('categories.tree.empty')),
    ).toBeInTheDocument();
    await setTestLanguage('en');
  });

  it('renders the category tree names', async () => {
    mockApi();
    await render();

    expect(
      (await screen.findAllByText('Safety equipment')).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('Hand protection')).toBeInTheDocument();
  });

  it('selects the first category until the user picks another (design 11.01)', async () => {
    mockApi();
    const { user } = await render();

    const detail = await screen.findByRole('region', {
      name: tt('categories.detail.title'),
    });
    expect(
      within(detail).getByRole('heading', { name: 'Safety equipment' }),
    ).toBeInTheDocument();

    await user.click(screen.getByText('Hand protection'));
    expect(
      await within(detail).findByRole('heading', { name: 'Hand protection' }),
    ).toBeInTheDocument();
  });

  it('labels the selected category pane in Arabic', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/categories');
    mockApi();
    await render();

    expect(
      await screen.findByRole('region', { name: 'التصنيف المحدد' }),
    ).toBeInTheDocument();
  });
});
