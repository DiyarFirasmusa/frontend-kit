import { useState } from 'react';
import type { WarehouseUserRole } from '@/types/api/enums';
import type { WarehouseUserResponse } from '@/types/api/warehouses';
import { canEditWarehouse } from '../../../hooks/warehouse-actions';
import { useAddMemberForm } from './form/use-add-member-form';
import {
  useChangeWarehouseMemberRole,
  useRemoveWarehouseMember,
  useWarehouseMembers,
} from './query/use-warehouse-members';

export function useMembersTab(warehouseId: string) {
  const query = useWarehouseMembers(warehouseId);
  const addDialog = useAddMemberForm(warehouseId);
  const remove = useRemoveWarehouseMember(warehouseId);
  const changeRole = useChangeWarehouseMemberRole(warehouseId);
  const [target, setTarget] = useState<WarehouseUserResponse | null>(null);
  const [open, setOpen] = useState(false);

  return {
    query,
    members: query.data ?? [],
    canManage: canEditWarehouse(),
    addDialog,
    roleChange: {
      pendingUserId: changeRole.isPending
        ? (changeRole.variables?.userId ?? null)
        : null,
      onChange: (userId: string, role: WarehouseUserRole) => {
        changeRole.mutate({ userId, role });
      },
    },
    remove: {
      target,
      open,
      isPending: remove.isPending,
      onAsk: (member: WarehouseUserResponse) => {
        setTarget(member);
        setOpen(true);
      },
      onOpenChange: (next: boolean) => {
        if (!next && remove.isPending) {
          return;
        }
        setOpen(next);
      },
      onConfirm: () => {
        if (!target?.userId) {
          return;
        }
        remove.mutate(target.userId, {
          onSuccess: () => {
            setTarget(null);
            setOpen(false);
          },
        });
      },
    },
  };
}
