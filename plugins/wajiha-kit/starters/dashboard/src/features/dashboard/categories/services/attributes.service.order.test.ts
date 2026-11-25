import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import {
  reorderAttributeOptions,
  saveAttributeOptions,
} from './attributes.service';

const definitionId = 'attr-color';

describe('attribute option ordering', () => {
  it('PUTs the whole order in one request', async () => {
    let body: unknown;
    server.use(
      http.put(
        api(endpoints.attributeDefinitions.optionsOrder(definitionId)),
        async ({ request }) => {
          body = await request.json();
          return HttpResponse.json([]);
        },
      ),
    );

    await reorderAttributeOptions(definitionId, ['b', 'a']);

    expect(body).toEqual({ optionIds: ['b', 'a'] });
  });

  it('creates new options first, then sends one reorder with their real ids', async () => {
    const calls: string[] = [];
    let orderBody: unknown;
    server.use(
      http.post(
        api(endpoints.attributeDefinitions.options(definitionId)),
        () => {
          calls.push('create');
          return HttpResponse.json({ id: 'o-new' });
        },
      ),
      http.put(
        api(endpoints.attributeDefinitions.optionsOrder(definitionId)),
        async ({ request }) => {
          calls.push('order');
          orderBody = await request.json();
          return HttpResponse.json([]);
        },
      ),
    );

    await saveAttributeOptions(definitionId, {
      deletes: [],
      updates: [],
      creates: [{ label: 'Red', sortOrder: 3 }],
      order: ['o-2', 0, 'o-1'],
    });

    expect(calls).toEqual(['create', 'order']);
    expect(orderBody).toEqual({ optionIds: ['o-2', 'o-new', 'o-1'] });
  });
});
