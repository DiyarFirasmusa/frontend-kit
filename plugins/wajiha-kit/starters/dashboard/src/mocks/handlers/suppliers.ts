import { http } from 'msw';
import { endpoints } from '@/constants/api';
import {
  type SupplierRequest,
  type SupplierResponse,
} from '@/types/api/suppliers';
/** Suppliers. */
import {
  api,
  boolParam,
  fail,
  intParam,
  matches,
  noContent,
  normalize,
  notFound,
  nowIso,
  ok,
  param,
  readJson,
  sameCode,
  textParam,
} from '../core';
import { newId } from '../seed/base';
import { suppliers, unregisteredSuppliers } from '../seed/suppliers';

export const supplierHandlers = [
  // ----- Suppliers -----
  http.get(api(endpoints.suppliers.list), async ({ request }) => {
    const url = new URL(request.url);
    const q = textParam(url, 'q');
    const isActive = boolParam(url, 'isActive');
    const includeUnregistered = boolParam(url, 'includeUnregistered') === true;
    const limit = intParam(url, 'limit', 500);
    const pool = includeUnregistered
      ? [...suppliers, ...unregisteredSuppliers]
      : suppliers;
    const response: SupplierResponse[] = pool
      .filter(
        (s) =>
          matches(
            q,
            s.code,
            s.name,
            s.contactName,
            s.phone,
            s.email,
            s.address,
          ) &&
          (isActive === undefined || s.isActive === isActive),
      )
      .toSorted((a, b) => {
        if (q === '') {
          return 0;
        }
        const aStarts = normalize(a.name ?? '').startsWith(normalize(q))
          ? 0
          : 1;
        const bStarts = normalize(b.name ?? '').startsWith(normalize(q))
          ? 0
          : 1;
        return aStarts - bStarts;
      })
      .slice(0, limit);
    return ok(response);
  }),

  http.post(api(endpoints.suppliers.create), async ({ request }) => {
    const body = await readJson<SupplierRequest>(request);
    if (suppliers.some((s) => sameCode(s.code, body.code))) {
      return fail(
        request,
        409,
        'رمز المورد مستخدم مسبقاً',
        'Supplier code already exists',
      );
    }
    const now = nowIso();
    const supplier: SupplierResponse = {
      id: newId(),
      code: body.code,
      name: body.name,
      contactName: body.contactName ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      address: body.address ?? null,
      taxNumber: body.taxNumber ?? null,
      notes: body.notes ?? null,
      isActive: body.isActive ?? true,
      registered: true,
      inUse: false,
      createdAt: now,
      updatedAt: now,
    };
    suppliers.push(supplier);
    // Registering a document-only name removes it from the unregistered list.
    const pending = unregisteredSuppliers.findIndex(
      (u) => u.name === supplier.name,
    );
    if (pending !== -1) {
      unregisteredSuppliers.splice(pending, 1);
      supplier.inUse = true;
    }
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
      if (
        suppliers.some(
          (s) => s.id !== supplier.id && sameCode(s.code, body.code),
        )
      ) {
        return fail(
          request,
          409,
          'رمز المورد مستخدم مسبقاً',
          'Supplier code already exists',
        );
      }
      Object.assign(supplier, {
        code: body.code ?? supplier.code,
        name: body.name ?? supplier.name,
        contactName: body.contactName ?? null,
        phone: body.phone ?? null,
        email: body.email ?? null,
        address: body.address ?? null,
        taxNumber: body.taxNumber ?? null,
        notes: body.notes ?? null,
        isActive: body.isActive ?? supplier.isActive,
        updatedAt: nowIso(),
      } satisfies Partial<SupplierResponse>);
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
