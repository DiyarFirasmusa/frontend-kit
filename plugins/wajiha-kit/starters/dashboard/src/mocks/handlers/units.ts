import { http } from 'msw';
import { endpoints } from '@/constants/api';
import {
  type UnitOfMeasureRequest,
  type UnitOfMeasureResponse,
} from '@/types/api/catalog';
/**
 * Units of measure: a paged list (`?page=0&size=10&sort=name,asc`), 404 for a
 * missing id, 422 problem+json with field errors, 409 when a rule refuses the
 * action. Same shape as the suppliers mock.
 */
import {
  api,
  boolParam,
  fail,
  intParam,
  matches,
  noContent,
  notFound,
  ok,
  paginate,
  param,
  readJson,
  sameCode,
  sortBy,
  textParam,
  validationProblem,
} from '../core';
import { newId } from '../seed/base';
import { unitsOfMeasure } from '../seed/units';

const SORTABLE = {
  code: (row: UnitOfMeasureResponse) => row.code,
  name: (row: UnitOfMeasureResponse) => row.name,
  decimalPlaces: (row: UnitOfMeasureResponse) => row.decimalPlaces,
};

/** A malformed body (readJson returns {}) must fail validation, not throw. */
function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function validate(
  request: Request,
  body: UnitOfMeasureRequest,
  current: UnitOfMeasureResponse | null,
): Promise<Response> | null {
  const errors: { field: string; ar: string; en: string }[] = [];
  if (!text(body.code)) {
    errors.push({ field: 'code', ar: 'الرمز مطلوب', en: 'Code is required' });
  } else if (
    unitsOfMeasure.some(
      (u) => u.id !== current?.id && sameCode(u.code, body.code),
    )
  ) {
    errors.push({
      field: 'code',
      ar: 'رمز الوحدة مستخدم مسبقاً',
      en: 'Unit code already exists',
    });
  }
  if (!text(body.name)) {
    errors.push({ field: 'name', ar: 'الاسم مطلوب', en: 'Name is required' });
  }
  if (
    current?.inUse === true &&
    body.decimalPlaces !== undefined &&
    body.decimalPlaces < (current.decimalPlaces ?? 0)
  ) {
    errors.push({
      field: 'decimalPlaces',
      ar: 'لا يمكن تقليل المنازل العشرية لوحدة مستخدمة',
      en: 'Decimal places of a unit in use cannot be reduced',
    });
  }
  return errors.length > 0 ? validationProblem(request, errors) : null;
}

export const unitHandlers = [
  http.get(api(endpoints.unitsOfMeasure.list), async ({ request }) => {
    const url = new URL(request.url);
    const q = textParam(url, 'q');
    const isActive = boolParam(url, 'isActive');
    const decimals = url.searchParams.has('decimalPlaces')
      ? intParam(url, 'decimalPlaces', -1)
      : undefined;
    const filtered = unitsOfMeasure.filter(
      (u) =>
        matches(q, u.code, u.name) &&
        (isActive === undefined || u.isActive === isActive) &&
        (decimals === undefined || u.decimalPlaces === decimals),
    );
    return ok(
      paginate(
        sortBy(filtered, url, SORTABLE),
        intParam(url, 'page', 0),
        intParam(url, 'size', 10),
      ),
    );
  }),

  http.post(api(endpoints.unitsOfMeasure.create), async ({ request }) => {
    const body = await readJson<UnitOfMeasureRequest>(request);
    const invalid = validate(request, body, null);
    if (invalid) {
      return invalid;
    }
    const uom: UnitOfMeasureResponse = {
      id: newId(),
      code: text(body.code),
      name: text(body.name),
      decimalPlaces: body.decimalPlaces ?? 0,
      isActive: body.isActive ?? true,
      inUse: false,
    };
    unitsOfMeasure.unshift(uom);
    return ok(uom, 201);
  }),

  http.get(
    api(endpoints.unitsOfMeasure.detail(':id')),
    async ({ params, request }) => {
      const uom = unitsOfMeasure.find((u) => u.id === param(params, 'id'));
      return uom ? ok(uom) : notFound(request);
    },
  ),

  http.put(
    api(endpoints.unitsOfMeasure.update(':id')),
    async ({ params, request }) => {
      const uom = unitsOfMeasure.find((u) => u.id === param(params, 'id'));
      if (!uom) {
        return notFound(request);
      }
      const body = await readJson<UnitOfMeasureRequest>(request);
      const invalid = validate(request, body, uom);
      if (invalid) {
        return invalid;
      }
      Object.assign(uom, {
        code: text(body.code),
        name: text(body.name),
        decimalPlaces: body.decimalPlaces ?? uom.decimalPlaces,
        isActive: body.isActive ?? uom.isActive,
      } satisfies Partial<UnitOfMeasureResponse>);
      return ok(uom);
    },
  ),

  http.delete(
    api(endpoints.unitsOfMeasure.remove(':id')),
    async ({ params, request }) => {
      const index = unitsOfMeasure.findIndex(
        (u) => u.id === param(params, 'id'),
      );
      const uom = unitsOfMeasure[index];
      if (!uom) {
        return notFound(request);
      }
      // The UI already blocks this; the backend still decides.
      if (uom.inUse === true) {
        return fail(
          request,
          409,
          'الوحدة مستخدمة في مواد ولا يمكن حذفها',
          'Unit is used by items and cannot be deleted',
        );
      }
      unitsOfMeasure.splice(index, 1);
      return noContent();
    },
  ),
];
