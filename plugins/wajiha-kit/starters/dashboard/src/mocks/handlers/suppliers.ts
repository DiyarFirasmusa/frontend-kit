import { http } from 'msw';
import { endpoints } from '@/constants/api';
import {
  type SupplierRequest,
  type SupplierResponse,
} from '@/types/api/suppliers';
/**
 * Suppliers: the reference mock for a CRUD entity. Copy this file for a new
 * one. It answers like a typical OpenAPI backend: a paged list
 * (`?page=0&size=10&sort=name,asc`), 404 for a missing id, 422 problem+json
 * with field errors, 409 when a rule refuses the action.
 */
import {
  api,
  boolParam,
  fail,
  intParam,
  matches,
  noContent,
  notFound,
  nowIso,
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
import { suppliers } from '../seed/suppliers';

const SORTABLE = {
  code: (row: SupplierResponse) => row.code,
  name: (row: SupplierResponse) => row.name,
  createdAt: (row: SupplierResponse) => row.createdAt,
};

/** A malformed body (readJson returns {}) must fail validation, not throw. */
function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function validate(
  request: Request,
  body: SupplierRequest,
  id: string | null,
): Promise<Response> | null {
  const errors: { field: string; ar: string; en: string }[] = [];
  if (!text(body.code)) {
    errors.push({ field: 'code', ar: 'الرمز مطلوب', en: 'Code is required' });
  } else if (
    suppliers.some((s) => s.id !== id && sameCode(s.code, body.code))
  ) {
    errors.push({
      field: 'code',
      ar: 'رمز المورد مستخدم مسبقاً',
      en: 'Supplier code already exists',
    });
  }
  if (!text(body.name)) {
    errors.push({ field: 'name', ar: 'الاسم مطلوب', en: 'Name is required' });
  }
  return errors.length > 0 ? validationProblem(request, errors) : null;
}

function toRecord(
  body: SupplierRequest,
): Omit<SupplierResponse, 'id' | 'inUse' | 'createdAt' | 'updatedAt'> {
  return {
    code: text(body.code),
    name: text(body.name),
    contactName: body.contactName ?? null,
    phone: body.phone ?? null,
    email: body.email ?? null,
    address: body.address ?? null,
    taxNumber: body.taxNumber ?? null,
    notes: body.notes ?? null,
    isActive: body.isActive ?? true,
  };
}

export const supplierHandlers = [
  http.get(api(endpoints.suppliers.list), async ({ request }) => {
    const url = new URL(request.url);
    const q = textParam(url, 'q');
    const isActive = boolParam(url, 'isActive');
    const filtered = suppliers.filter(
      (s) =>
        matches(q, s.code, s.name, s.contactName, s.phone, s.email) &&
        (isActive === undefined || s.isActive === isActive),
    );
    return ok(
      paginate(
        sortBy(filtered, url, SORTABLE),
        intParam(url, 'page', 0),
        intParam(url, 'size', 10),
      ),
    );
  }),

  http.post(api(endpoints.suppliers.create), async ({ request }) => {
    const body = await readJson<SupplierRequest>(request);
    const invalid = validate(request, body, null);
    if (invalid) {
      return invalid;
    }
    const now = nowIso();
    const supplier: SupplierResponse = {
      id: newId(),
      ...toRecord(body),
      inUse: false,
      createdAt: now,
      updatedAt: now,
    };
    suppliers.unshift(supplier);
    return ok(supplier, 201);
  }),

  http.get(
    api(endpoints.suppliers.detail(':id')),
    async ({ params, request }) => {
      const supplier = suppliers.find((s) => s.id === param(params, 'id'));
      return supplier ? ok(supplier) : notFound(request);
    },
  ),

  http.put(
    api(endpoints.suppliers.update(':id')),
    async ({ params, request }) => {
      const supplier = suppliers.find((s) => s.id === param(params, 'id'));
      if (!supplier) {
        return notFound(request);
      }
      const body = await readJson<SupplierRequest>(request);
      const invalid = validate(request, body, supplier.id);
      if (invalid) {
        return invalid;
      }
      Object.assign(supplier, { ...toRecord(body), updatedAt: nowIso() });
      return ok(supplier);
    },
  ),

  http.delete(
    api(endpoints.suppliers.remove(':id')),
    async ({ params, request }) => {
      const index = suppliers.findIndex((s) => s.id === param(params, 'id'));
      const supplier = suppliers[index];
      if (!supplier) {
        return notFound(request);
      }
      // The UI already blocks this; the backend still decides.
      if (supplier.inUse === true) {
        return fail(
          request,
          409,
          'المورد مستخدم في مستندات ولا يمكن حذفه، يمكنك إيقافه بدلاً من ذلك',
          'Supplier is used on documents and cannot be deleted; deactivate it instead',
        );
      }
      suppliers.splice(index, 1);
      return noContent();
    },
  ),
];
