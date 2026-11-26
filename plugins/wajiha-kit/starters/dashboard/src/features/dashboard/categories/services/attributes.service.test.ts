import { HttpResponse, http } from 'msw';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';
import { endpoints } from '@/constants/api';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import type { AttributeListParams } from '../types/types';
import type { OptionChanges } from '../utils/option-order';
import {
  createAttributeOption,
  fetchAttributeDefinitions,
  saveAttributeOptions,
  toAttributeListQuery,
} from './attributes.service';

const DEFAULTS: AttributeListParams = {
  page: 1,
  pageSize: 10,
  sort: '',
  q: '',
  dataType: 'all',
  status: 'all',
};

describe('toAttributeListQuery', () => {
  it('sends 0-based paging and leaves default filters out', () => {
    expect(toAttributeListQuery(DEFAULTS)).toEqual({ page: 0, size: 10 });
  });

  it('maps sort, search, type and status to the backend names', () => {
    expect(
      toAttributeListQuery({
        page: 2,
        pageSize: 20,
        sort: 'dataType.desc',
        q: 'col',
        dataType: 'OPTION',
        status: 'inactive',
      }),
    ).toEqual({
      page: 1,
      size: 20,
      sort: 'dataType,desc',
      q: 'col',
      dataType: 'OPTION',
      isActive: false,
    });
  });
});

describe('attributes.service', () => {
  it('fetchAttributeDefinitions sends the query and forwards the signal', async () => {
    let search = '';
    server.use(
      http.get(api(endpoints.attributeDefinitions.list), ({ request }) => {
        search = new URL(request.url).search;
        return HttpResponse.json({ content: [] });
      }),
    );
    const controller = new AbortController();
    await fetchAttributeDefinitions(
      { ...DEFAULTS, q: 'col' },
      { signal: controller.signal },
    );
    expect(search).toBe('?page=0&size=10&q=col');
  });

  it('createAttributeOption stays silent when asked', async () => {
    const success = vi.spyOn(toast, 'success');
    server.use(
      http.post(api(endpoints.attributeDefinitions.options('attr-color')), () =>
        HttpResponse.json({ id: 'opt-1' }, { status: 201 }),
      ),
    );
    await createAttributeOption(
      'attr-color',
      { label: 'Red' },
      { silent: true },
    );
    expect(success).not.toHaveBeenCalled();
  });
});

describe('saveAttributeOptions', () => {
  it('sends removals, updates, creations, then one reorder, with one toast', async () => {
    const success = vi.spyOn(toast, 'success');
    const seen: string[] = [];
    server.use(
      http.delete(
        api(endpoints.attributeDefinitions.option('attr-1', 'old')),
        () => {
          seen.push('delete');
          return new HttpResponse(null, { status: 204 });
        },
      ),
      http.put(
        api(endpoints.attributeDefinitions.option('attr-1', 'kept')),
        () => {
          seen.push('update');
          return HttpResponse.json({ id: 'kept' });
        },
      ),
      http.post(api(endpoints.attributeDefinitions.options('attr-1')), () => {
        seen.push('create');
        return HttpResponse.json({ id: 'created' }, { status: 201 });
      }),
      http.put(
        api(endpoints.attributeDefinitions.optionsOrder('attr-1')),
        async ({ request }) => {
          const body: unknown = await request.json();
          seen.push(`order:${JSON.stringify(body)}`);
          return HttpResponse.json([]);
        },
      ),
    );
    const changes: OptionChanges = {
      deletes: ['old'],
      updates: [{ id: 'kept', payload: { label: 'Kept' } }],
      creates: [{ label: 'New' }],
      order: ['kept', 0],
    };
    await saveAttributeOptions('attr-1', changes);
    expect(seen).toEqual([
      'delete',
      'update',
      'create',
      'order:{"optionIds":["kept","created"]}',
    ]);
    expect(success).toHaveBeenCalledTimes(1);
  });
});
