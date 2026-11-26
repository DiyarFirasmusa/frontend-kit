import { http } from 'msw';
import { endpoints } from '@/constants/api';
/** Global search in the top bar: a few hits per group, matched on code and name. */
import { api, intParam, matches, ok, textParam } from '../core';
import { categories } from '../seed/categories';
import { suppliers } from '../seed/suppliers';
import { unitsOfMeasure } from '../seed/units';
import { warehouses } from '../seed/warehouses';

interface Searchable {
  id: string;
  code: string | null;
  name: string | null;
  isActive: boolean | null;
}

function hits(rows: Searchable[], q: string, limit: number) {
  return rows
    .filter((row) => matches(q, row.code, row.name))
    .slice(0, limit)
    .map(({ id, code, name, isActive }) => ({ id, code, name, isActive }));
}

export const searchHandlers = [
  http.get(api(endpoints.search.query), ({ request }) => {
    const url = new URL(request.url);
    const q = textParam(url, 'q');
    const limit = intParam(url, 'limit', 5);
    return ok({
      warehouses: hits(warehouses, q, limit),
      suppliers: hits(suppliers, q, limit),
      categories: hits(categories, q, limit),
      units: hits(unitsOfMeasure, q, limit),
    });
  }),
];
