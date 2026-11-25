import { z } from 'zod';
import type {
  WarehouseRequest,
  WarehouseResponse,
} from '@/types/api/warehouses';

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isOptionalUuid(value: string): boolean {
  return value === '' || UUID_PATTERN.test(value);
}

const optionalUuid = z
  .string()
  .trim()
  .refine(isOptionalUuid, { message: 'warehouses.form.errors.uuid' });

export const warehouseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'warehouses.form.errors.name' })
    .max(200, { message: 'warehouses.form.errors.nameMax' }),
  code: z
    .string()
    .trim()
    .min(1, { message: 'warehouses.form.errors.code' })
    .max(30, { message: 'warehouses.form.errors.codeMax' }),
  address: z
    .string()
    .trim()
    .min(1, { message: 'warehouses.form.errors.address' })
    .max(300, { message: 'warehouses.form.errors.addressMax' }),
  hrOrgUnitId: optionalUuid,
  managerEmployeeId: optionalUuid,
  managerUserId: optionalUuid,
  isTransit: z.boolean(),
  isActive: z.boolean(),
});

export type WarehouseValues = z.infer<typeof warehouseSchema>;

export const defaultWarehouseForm: WarehouseValues = {
  name: '',
  code: '',
  address: '',
  hrOrgUnitId: '',
  managerEmployeeId: '',
  managerUserId: '',
  isTransit: false,
  isActive: true,
};

export function toWarehouseValues(
  warehouse: WarehouseResponse,
): WarehouseValues {
  return {
    name: warehouse.name ?? '',
    code: warehouse.code ?? '',
    address: warehouse.address ?? '',
    hrOrgUnitId: warehouse.hrOrgUnitId ?? '',
    managerEmployeeId: warehouse.managerEmployeeId ?? '',
    managerUserId: warehouse.managerUserId ?? '',
    isTransit: warehouse.isTransit ?? false,
    isActive: warehouse.isActive ?? true,
  };
}

export function toWarehousePayload(values: WarehouseValues): WarehouseRequest {
  const address = values.address.trim();
  const hrOrgUnitId = values.hrOrgUnitId.trim();
  const managerEmployeeId = values.managerEmployeeId.trim();
  const managerUserId = values.managerUserId.trim();
  return {
    name: values.name.trim(),
    code: values.code.trim(),
    isTransit: values.isTransit,
    isActive: values.isActive,
    ...(address ? { address } : {}),
    ...(hrOrgUnitId ? { hrOrgUnitId } : {}),
    ...(managerEmployeeId ? { managerEmployeeId } : {}),
    ...(managerUserId ? { managerUserId } : {}),
  };
}
