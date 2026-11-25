import { http, HttpResponse } from 'msw';
import { toast } from 'sonner';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { endpoints } from '@/constants/api';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import type {
  AttributeDefinitionResponse,
  AttributeOptionResponse,
} from '@/types/api/catalog';
import {
  createAttributeOption,
  deleteAttributeOption,
  fetchAttributeDefinitions,
  updateAttributeOption,
} from './attributes.service';

const definitionId = 'attr-color';
const optionId = 'opt-black';

const option: AttributeOptionResponse = {
  id: optionId,
  code: 'BLACK',
  label: 'أسود',
  sortOrder: 1,
  isActive: true,
};

const definition: AttributeDefinitionResponse = {
  id: definitionId,
  code: 'COLOR',
  name: 'اللون',
  dataType: 'OPTION',
  unitLabel: null,
  isActive: true,
  options: [option],
};

describe('attribute definitions service', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends only the list params that are set', async () => {
    const seen: URLSearchParams[] = [];
    server.use(
      http.get(api(endpoints.attributeDefinitions.list), ({ request }) => {
        seen.push(new URL(request.url).searchParams);
        return HttpResponse.json([definition]);
      }),
    );

    expect(await fetchAttributeDefinitions()).toEqual([definition]);
    expect(
      await fetchAttributeDefinitions({ q: 'col', dataType: 'OPTION' }),
    ).toEqual([definition]);
    expect(await fetchAttributeDefinitions({ isActive: false })).toEqual([
      definition,
    ]);

    expect([...seen[0].keys()]).toEqual([]);
    expect(seen[1].get('q')).toBe('col');
    expect(seen[1].get('dataType')).toBe('OPTION');
    expect(seen[1].has('isActive')).toBe(false);
    expect(seen[2].get('isActive')).toBe('false');
    expect(seen[2].has('q')).toBe(false);
    expect(seen[2].has('dataType')).toBe(false);
  });

  it('creates an option by POST to the nested options path', async () => {
    const bodies: unknown[] = [];
    server.use(
      http.post(
        api(endpoints.attributeDefinitions.options(definitionId)),
        async ({ request }) => {
          bodies.push(await request.json());
          return HttpResponse.json(option, { status: 201 });
        },
      ),
    );

    const payload = { code: 'BLACK', label: 'أسود', sortOrder: 1 };
    expect(await createAttributeOption(definitionId, payload)).toEqual(option);
    expect(bodies).toEqual([payload]);
  });

  it('updates an option by PUT to the nested option path', async () => {
    const methods: string[] = [];
    server.use(
      http.put(
        api(endpoints.attributeDefinitions.option(definitionId, optionId)),
        async ({ request }) => {
          methods.push(request.method);
          expect(await request.json()).toEqual({
            code: 'BLACK',
            label: 'أسود',
            sortOrder: 2,
            isActive: true,
          });
          return HttpResponse.json({ ...option, sortOrder: 2 });
        },
      ),
    );

    const result = await updateAttributeOption(definitionId, optionId, {
      code: 'BLACK',
      label: 'أسود',
      sortOrder: 2,
      isActive: true,
    });
    expect(result.sortOrder).toBe(2);
    expect(methods).toEqual(['PUT']);
  });

  it('deletes an option by DELETE to the nested option path', async () => {
    const methods: string[] = [];
    server.use(
      http.delete(
        api(endpoints.attributeDefinitions.option(definitionId, optionId)),
        ({ request }) => {
          methods.push(request.method);
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    await expect(
      deleteAttributeOption(definitionId, optionId),
    ).resolves.toBeUndefined();
    expect(methods).toEqual(['DELETE']);
  });

  it('suppresses the success toast when updating silently', async () => {
    server.use(
      http.put(
        api(endpoints.attributeDefinitions.option(definitionId, optionId)),
        () => HttpResponse.json(option),
      ),
    );
    const successSpy = vi.spyOn(toast, 'success');
    const payload = { code: 'BLACK', label: 'أسود', sortOrder: 1 };

    await updateAttributeOption(definitionId, optionId, payload, {
      silent: true,
    });
    expect(successSpy).not.toHaveBeenCalled();

    await updateAttributeOption(definitionId, optionId, payload);
    expect(successSpy).toHaveBeenCalledTimes(1);
  });
});
