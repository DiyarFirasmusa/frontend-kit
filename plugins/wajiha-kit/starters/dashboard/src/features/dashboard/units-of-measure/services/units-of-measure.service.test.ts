import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { makeUnitOfMeasure } from '../uom-test-utils';
import {
  createUnitOfMeasure,
  deleteUnitOfMeasure,
  fetchUnitsOfMeasure,
  updateUnitOfMeasure,
} from './units-of-measure.service';

const payload = {
  code: 'BOX',
  name: 'Box',
  decimalPlaces: 0,
  isActive: true,
};

describe('units-of-measure service', () => {
  it('lists units passing q and isActive as query params and returns the array', async () => {
    const rows = [makeUnitOfMeasure()];
    let seenQ: string | null = null;
    let seenActive: string | null = null;
    server.use(
      http.get(api(endpoints.unitsOfMeasure.list), ({ request }) => {
        const url = new URL(request.url);
        seenQ = url.searchParams.get('q');
        seenActive = url.searchParams.get('isActive');
        return HttpResponse.json(rows);
      }),
    );
    const result = await fetchUnitsOfMeasure({ q: 'kg', isActive: true });
    expect(seenQ).toBe('kg');
    expect(seenActive).toBe('true');
    expect(result).toEqual(rows);
  });

  it('creates a unit posting the payload and returns the created row', async () => {
    const created = makeUnitOfMeasure({
      id: 'uom-9',
      code: 'BOX',
      name: 'Box',
    });
    let body: unknown = null;
    server.use(
      http.post(api(endpoints.unitsOfMeasure.create), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(created, { status: 201 });
      }),
    );
    const result = await createUnitOfMeasure(payload);
    expect(body).toEqual(payload);
    expect(result).toEqual(created);
  });

  it('updates a unit by PUT to its detail URL and returns the row', async () => {
    const updated = makeUnitOfMeasure({ name: 'Box' });
    let body: unknown = null;
    server.use(
      http.put(
        api(endpoints.unitsOfMeasure.update('uom-1')),
        async ({ request }) => {
          body = await request.json();
          return HttpResponse.json(updated);
        },
      ),
    );
    const result = await updateUnitOfMeasure('uom-1', payload);
    expect(body).toEqual(payload);
    expect(result).toEqual(updated);
  });

  it('deletes a unit with DELETE and resolves to void', async () => {
    let called = false;
    server.use(
      http.delete(api(endpoints.unitsOfMeasure.remove('uom-1')), () => {
        called = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await expect(deleteUnitOfMeasure('uom-1')).resolves.toBeUndefined();
    expect(called).toBe(true);
  });
});
