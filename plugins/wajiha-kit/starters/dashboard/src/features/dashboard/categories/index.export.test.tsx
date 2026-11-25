import { HttpResponse, http, type JsonBodyType } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen, waitFor } from '@/test/render';
import { readXlsxRows, recordDownloads } from '@/test/xlsx';
import CategoriesContainer from './index';

const categories = [
  {
    id: 'cat-hand',
    parentId: 'cat-safety',
    code: 'SAF-HAND',
    name: 'Hand protection',
  },
  {
    id: 'cat-safety',
    parentId: null,
    code: 'SAFETY',
    name: 'Safety equipment',
  },
];

function mockApi(body: JsonBodyType) {
  server.use(
    http.get(api(endpoints.itemCategories.list), () => HttpResponse.json(body)),
    http.get(api(endpoints.itemCategories.attributes('cat-hand')), () =>
      HttpResponse.json([]),
    ),
    http.get(api(endpoints.itemCategories.attributes('cat-safety')), () =>
      HttpResponse.json([]),
    ),
    http.get(api(endpoints.attributeDefinitions.list), () =>
      HttpResponse.json([]),
    ),
  );
}

function render(initialTab: 'categories' | 'attributes' = 'categories') {
  return renderWithRouter(<CategoriesContainer initialTab={initialTab} />, {
    path: '/categories',
  });
}

describe('CategoriesContainer export', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  beforeEach(() => {
    signIn({ permissions: Object.values(PERMS.itemCategory) });
  });

  it('disables export when there are no categories', async () => {
    mockApi([]);
    await render();
    await screen.findByText(tt('categories.tree.empty'));

    expect(
      screen.getByRole('button', { name: tt('common.exportExcel') }),
    ).toBeDisabled();
  });

  it('exports the tree with parents before their children', async () => {
    mockApi(categories);
    const downloads = recordDownloads();
    const { user } = await render();
    await screen.findAllByText('Hand protection');

    await user.click(
      screen.getByRole('button', { name: tt('common.exportExcel') }),
    );

    await waitFor(() => {
      expect(downloads.names).toHaveLength(1);
    });
    expect(downloads.names[0]).toMatch(/^categories-.*\.xlsx$/);
    const sheet = await readXlsxRows(downloads.blobs[0]);
    expect(sheet[0]?.[0]).toBe(tt('categories.form.code'));
    expect(sheet).toHaveLength(3);
    expect(sheet[1]?.slice(0, 2)).toEqual(['SAFETY', 'Safety equipment']);
    expect(sheet[2]?.slice(0, 4)).toEqual([
      'SAF-HAND',
      'Hand protection',
      'Safety equipment',
      '2',
    ]);
  });
});
