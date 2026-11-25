import { http } from 'msw';
import { endpoints } from '@/constants/api';
import {
  type UnitOfMeasureRequest,
  type UnitOfMeasureResponse,
} from '@/types/api/catalog';
/** Units of measure. */
import {
  api,
  boolParam,
  fail,
  intParam,
  matches,
  noContent,
  notFound,
  ok,
  param,
  readJson,
  sameCode,
  textParam,
} from '../core';
import { newId } from '../seed/base';
import { unitsOfMeasure } from '../seed/units';

export const unitHandlers = [
  // ----- Units of measure -----
  http.get(api(endpoints.unitsOfMeasure.list), async ({ request }) => {
    const url = new URL(request.url);
    const q = textParam(url, 'q');
    const isActive = boolParam(url, 'isActive');
    const decimals = url.searchParams.has('decimalPlaces')
      ? intParam(url, 'decimalPlaces', -1)
      : undefined;
    const response: UnitOfMeasureResponse[] = unitsOfMeasure.filter(
      (u) =>
        matches(q, u.code, u.name) &&
        (isActive === undefined || u.isActive === isActive) &&
        (decimals === undefined || u.decimalPlaces === decimals),
    );
    return ok(response);
  }),

  http.post(api(endpoints.unitsOfMeasure.create), async ({ request }) => {
    const body = await readJson<UnitOfMeasureRequest>(request);
    if (unitsOfMeasure.some((u) => sameCode(u.code, body.code))) {
      return fail(
        request,
        409,
        'رمز الوحدة مستخدم مسبقاً',
        'Unit code already exists',
      );
    }
    const uom: UnitOfMeasureResponse = {
      id: newId(),
      code: body.code,
      name: body.name,
      decimalPlaces: body.decimalPlaces ?? 0,
      isActive: body.isActive ?? true,
      inUse: false,
    };
    unitsOfMeasure.push(uom);
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
      if (
        unitsOfMeasure.some(
          (u) => u.id !== uom.id && sameCode(u.code, body.code),
        )
      ) {
        return fail(
          request,
          409,
          'رمز الوحدة مستخدم مسبقاً',
          'Unit code already exists',
        );
      }
      if (
        uom.inUse === true &&
        body.decimalPlaces !== undefined &&
        body.decimalPlaces < (uom.decimalPlaces ?? 0)
      ) {
        return fail(
          request,
          409,
          'لا يمكن تقليل المنازل العشرية لوحدة مستخدمة',
          'Decimal places of a unit in use cannot be reduced',
        );
      }
      Object.assign(uom, {
        code: body.code ?? uom.code,
        name: body.name ?? uom.name,
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
