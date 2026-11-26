import { HttpResponse, delay, http } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { signIn } from '@/test/fixtures/auth';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import {
  attachCategoryAttribute,
  createItemCategory,
  deleteItemCategory,
  detachCategoryAttribute,
  fetchCategoryAttributes,
  fetchItemCategories,
  fetchItemCategory,
  toCategoryListQuery,
  TREE_PAGE_SIZE,
  updateCategoryAttribute,
  updateItemCategory,
} from './categories.service';

const CATEGORY = {
  id: 'cat-hand',
  parentId: 'cat-safety',
  code: 'SAF-HAND',
  name: 'Hand protection',
  isActive: true,
};

describe('toCategoryListQuery', () => {
  it('asks for the whole tree in one page', () => {
    expect(toCategoryListQuery({ q: '' })).toEqual({
      page: 0,
      size: TREE_PAGE_SIZE,
    });
  });

  it('adds the search text only when there is one', () => {
    expect(toCategoryListQuery({ q: 'hand' })).toEqual({
      page: 0,
      size: TREE_PAGE_SIZE,
      q: 'hand',
    });
  });
});

describe('categories.service', () => {
  beforeEach(() => {
    signIn({
      permissions: [
        'item_category:read',
        'item_category:create',
        'item_category:update',
      ],
    });
  });

  it('fetchItemCategories sends the tree query and forwards the signal', async () => {
    let search = '';
    server.use(
      http.get(api(endpoints.itemCategories.list), ({ request }) => {
        search = new URL(request.url).search;
        return HttpResponse.json({
          content: [CATEGORY],
          totalElements: 1,
          totalPages: 1,
          number: 0,
          size: TREE_PAGE_SIZE,
        });
      }),
    );
    const controller = new AbortController();
    const page = await fetchItemCategories(
      { q: 'hand' },
      { signal: controller.signal },
    );
    expect(page.content).toEqual([CATEGORY]);
    expect(search).toBe(`?page=0&size=${TREE_PAGE_SIZE}&q=hand`);
  });

  it('fetchItemCategories aborts with the signal', async () => {
    server.use(
      http.get(api(endpoints.itemCategories.list), async () => {
        await delay(200);
        return HttpResponse.json({ content: [] });
      }),
    );
    const controller = new AbortController();
    const request = fetchItemCategories(
      { q: '' },
      { signal: controller.signal },
    );
    controller.abort();
    await expect(request).rejects.toBeTruthy();
  });

  it('fetchItemCategory GETs one record by id', async () => {
    server.use(
      http.get(api(endpoints.itemCategories.detail('cat-hand')), () =>
        HttpResponse.json(CATEGORY),
      ),
    );
    await expect(fetchItemCategory('cat-hand')).resolves.toEqual(CATEGORY);
  });

  it('fetchCategoryAttributes sends includeInherited=true', async () => {
    let includeInherited: string | null = null;
    server.use(
      http.get(
        api(endpoints.itemCategories.attributes('cat-hand')),
        ({ request }) => {
          includeInherited = new URL(request.url).searchParams.get(
            'includeInherited',
          );
          return HttpResponse.json([]);
        },
      ),
    );
    await expect(fetchCategoryAttributes('cat-hand')).resolves.toEqual([]);
    expect(includeInherited).toBe('true');
  });

  it('createItemCategory POSTs the payload and returns the created row', async () => {
    let body: unknown = null;
    server.use(
      http.post(api(endpoints.itemCategories.create), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(CATEGORY, { status: 201 });
      }),
    );
    const payload = { name: 'Hand protection', parentId: 'cat-safety' };
    await expect(createItemCategory(payload)).resolves.toEqual(CATEGORY);
    expect(body).toEqual(payload);
  });

  it('updateItemCategory PUTs to the id and deleteItemCategory DELETEs it', async () => {
    const seen: string[] = [];
    server.use(
      http.put(api(endpoints.itemCategories.update('cat-hand')), () => {
        seen.push('PUT');
        return HttpResponse.json(CATEGORY);
      }),
      http.delete(api(endpoints.itemCategories.remove('cat-hand')), () => {
        seen.push('DELETE');
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await updateItemCategory('cat-hand', { name: 'Hand protection' });
    await deleteItemCategory('cat-hand');
    expect(seen).toEqual(['PUT', 'DELETE']);
  });

  it('attaches, updates and detaches an attribute assignment', async () => {
    const seen: string[] = [];
    server.use(
      http.post(api(endpoints.itemCategories.attributes('cat-hand')), () => {
        seen.push('POST');
        return HttpResponse.json({ id: 'asg-1' }, { status: 201 });
      }),
      http.put(
        api(endpoints.itemCategories.attribute('cat-hand', 'asg-1')),
        () => {
          seen.push('PUT');
          return HttpResponse.json({ id: 'asg-1' });
        },
      ),
      http.delete(
        api(endpoints.itemCategories.attribute('cat-hand', 'asg-1')),
        () => {
          seen.push('DELETE');
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );
    const payload = { attributeDefinitionId: 'attr-color' };
    await attachCategoryAttribute('cat-hand', payload);
    await updateCategoryAttribute('cat-hand', 'asg-1', payload);
    await detachCategoryAttribute('cat-hand', 'asg-1');
    expect(seen).toEqual(['POST', 'PUT', 'DELETE']);
  });
});
