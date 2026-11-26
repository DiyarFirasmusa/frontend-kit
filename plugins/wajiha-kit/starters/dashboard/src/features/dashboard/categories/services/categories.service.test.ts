import { HttpResponse, http } from 'msw';
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
  updateCategoryAttribute,
  updateItemCategory,
} from './categories.service';

const CATEGORY = {
  id: 'cat-hand',
  parentId: 'cat-safety',
  code: 'SAF-HAND',
  name: 'حماية اليدين',
  isActive: true,
};

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

  it('fetchItemCategories GETs the list endpoint', async () => {
    let method = '';
    let path = '';
    server.use(
      http.get(api(endpoints.itemCategories.list), ({ request }) => {
        method = request.method;
        path = new URL(request.url).pathname;
        return HttpResponse.json([CATEGORY]);
      }),
    );

    await expect(fetchItemCategories()).resolves.toEqual([CATEGORY]);
    expect(method).toBe('GET');
    expect(path).toBe(endpoints.itemCategories.list);
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

    const payload = {
      code: 'SAF-HAND',
      name: 'حماية اليدين',
      parentId: 'cat-safety',
    };
    await expect(createItemCategory(payload)).resolves.toEqual(CATEGORY);
    expect(body).toEqual(payload);
  });

  it('updateItemCategory PUTs the payload to the category path', async () => {
    let method = '';
    let body: unknown = null;
    server.use(
      http.put(
        api(endpoints.itemCategories.update('cat-hand')),
        async ({ request }) => {
          method = request.method;
          body = await request.json();
          return HttpResponse.json({ ...CATEGORY, isActive: false });
        },
      ),
    );

    const payload = { code: 'SAF-HAND', name: 'حماية اليدين', isActive: false };
    await expect(
      updateItemCategory('cat-hand', payload),
    ).resolves.toMatchObject({ isActive: false });
    expect(method).toBe('PUT');
    expect(body).toEqual(payload);
  });

  it('deleteItemCategory resolves undefined on 204', async () => {
    let method = '';
    server.use(
      http.delete(
        api(endpoints.itemCategories.remove('cat-hand')),
        ({ request }) => {
          method = request.method;
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    await expect(deleteItemCategory('cat-hand')).resolves.toBeUndefined();
    expect(method).toBe('DELETE');
  });

  it('attachCategoryAttribute POSTs to the category attributes path', async () => {
    let body: unknown = null;
    server.use(
      http.post(
        api(endpoints.itemCategories.attributes('cat-hand')),
        async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({ id: 'asg-3' }, { status: 201 });
        },
      ),
    );

    const payload = {
      attributeDefinitionId: 'attr-color',
      isRequired: true,
      isVariantAxis: false,
      sortOrder: 2,
    };
    await expect(attachCategoryAttribute('cat-hand', payload)).resolves.toEqual(
      {
        id: 'asg-3',
      },
    );
    expect(body).toEqual(payload);
  });

  it('updateCategoryAttribute PUTs to the assignment path', async () => {
    let body: unknown = null;
    server.use(
      http.put(
        api(endpoints.itemCategories.attribute('cat-hand', 'asg-2')),
        async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({ id: 'asg-2' });
        },
      ),
    );

    const payload = { attributeDefinitionId: 'attr-color', isRequired: true };
    await updateCategoryAttribute('cat-hand', 'asg-2', payload);
    expect(body).toEqual(payload);
  });

  it('detachCategoryAttribute DELETEs the assignment and resolves on 204', async () => {
    let method = '';
    server.use(
      http.delete(
        api(endpoints.itemCategories.attribute('cat-hand', 'asg-2')),
        ({ request }) => {
          method = request.method;
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    await expect(
      detachCategoryAttribute('cat-hand', 'asg-2'),
    ).resolves.toBeUndefined();
    expect(method).toBe('DELETE');
  });
});
