import { endpoints } from '../api/endpoints';
import { PERMS } from '../constants/permissions';
import type { Supplier, SupplierRequest } from '../types/api';
import { crudHandlers } from './crud';
import { db } from './db';
import { isText, normalize, optional } from './http';

/**
 * The suppliers endpoints. A new resource copies this file: change the types, the endpoints, the
 * permissions, the database list, and the fields. Then spread the result into `handlers` (handlers.ts).
 */
export const supplierHandlers = crudHandlers<Supplier, SupplierRequest>({
  endpoints: endpoints.suppliers,
  rows: () => db.suppliers,
  permissions: PERMS.supplier,
  idPrefix: 'sup',
  searchFields: (row) => [row.code, row.name, row.contactName, row.phone, row.email],
  isActive: (row) => row.isActive,
  invalid: (body) =>
    isText(body.code) && isText(body.name)
      ? undefined
      : { ar: 'الرمز والاسم مطلوبان', en: 'Code and name are required' },
  conflict: (body, rows, exceptId) =>
    rows.some((row) => row.id !== exceptId && normalize(row.code) === normalize(body.code ?? ''))
      ? { ar: 'رمز المورد مستخدم مسبقاً', en: 'This supplier code is already used', field: 'code' }
      : undefined,
  toRow: (body) => ({
    code: (body.code ?? '').trim(),
    name: (body.name ?? '').trim(),
    contactName: optional(body.contactName),
    phone: optional(body.phone),
    email: optional(body.email),
    notes: optional(body.notes),
    isActive: body.isActive !== false,
  }),
  notFound: { ar: 'المورد غير موجود', en: 'Supplier not found' },
});
