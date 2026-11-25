import { z } from 'zod';
import { WarehouseUserRoleValues } from '@/types/api/enums';
import type { WarehouseUserRequest } from '@/types/api/warehouses';
import { UUID_PATTERN } from '../../../validations/validations';

export const addMemberSchema = z.object({
  userId: z
    .string()
    .trim()
    .refine((value) => UUID_PATTERN.test(value), {
      message: 'warehouses.members.errors.userId',
    }),
  role: z.enum(WarehouseUserRoleValues, {
    message: 'warehouses.members.errors.role',
  }),
});

export type AddMemberValues = z.infer<typeof addMemberSchema>;

export const defaultAddMemberForm: AddMemberValues = {
  userId: '',
  role: 'STOREKEEPER',
};

export function toAddMemberPayload(
  values: AddMemberValues,
): WarehouseUserRequest {
  return { userId: values.userId.trim(), role: values.role };
}
