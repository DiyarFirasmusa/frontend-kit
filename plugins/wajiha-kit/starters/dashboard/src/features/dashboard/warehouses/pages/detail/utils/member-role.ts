import type { SelectOption } from '@/components/fields/select-option';
import type { BadgeTone } from '@/components/table/data-badge';
import {
  WarehouseUserRoleValues,
  type WarehouseUserRole,
} from '@/types/api/enums';

const MEMBER_ROLE_TONE: Record<WarehouseUserRole, BadgeTone> = {
  WAREHOUSE_MANAGER: 'brand',
  STOREKEEPER: 'info',
  STOCK_CONTROLLER: 'warning',
};

export function memberRoleTone(role: WarehouseUserRole): BadgeTone {
  return MEMBER_ROLE_TONE[role];
}

export function memberRoleLabelKey(role: WarehouseUserRole): string {
  return `warehouses.members.roles.${role}`;
}

export function memberRoleOptions(t: (key: string) => string): SelectOption[] {
  return WarehouseUserRoleValues.map((role) => ({
    value: role,
    label: t(memberRoleLabelKey(role)),
  }));
}

/** The first two letters of a member's name, shown in the avatar tile. */
export function memberInitials(name: string): string {
  const trimmed = name.trim();
  if (trimmed === '') {
    return '—';
  }
  return [...trimmed].slice(0, 2).join('');
}
