import { type AuditLogResponse } from '@/types/api/audit';
import { type WorkspaceResponse } from '@/types/api/workspace';
/** The workspace shown in the sidebar and the audit log behind the warehouse change log. */
import { makeId } from './base';
import { ME_USER_ID, userId } from './people';
import { members, WAREHOUSE_SEEDS, warehouses } from './warehouses';

export const workspace: WorkspaceResponse = {
  name: 'الشركة التجريبية',
  code: 'DEMO-01',
};

// ---------------------------------------------------------------------------
// Audit log (warehouse detail "change log")
// ---------------------------------------------------------------------------

export const auditLog: AuditLogResponse[] = [];

warehouses.forEach((wh, i) => {
  const seed = WAREHOUSE_SEEDS[i];
  if (!seed) {
    return;
  }
  auditLog.push(
    {
      id: makeId(0xf6, i * 10 + 1),
      entity: 'WAREHOUSE',
      entityId: wh.id,
      parentEntity: null,
      parentId: null,
      action: 'CREATE',
      changedBy: ME_USER_ID,
      changedAt: wh.createdAt,
      changes: [
        { field: 'code', oldValue: null, newValue: wh.code },
        { field: 'name', oldValue: null, newValue: wh.name },
        { field: 'isTransit', oldValue: null, newValue: wh.isTransit },
      ],
    },
    {
      id: makeId(0xf6, i * 10 + 2),
      entity: 'WAREHOUSE',
      entityId: wh.id,
      parentEntity: null,
      parentId: null,
      action: 'UPDATE',
      changedBy: userId(6),
      changedAt: wh.updatedAt,
      changes: [
        {
          field: 'address',
          oldValue: 'العنوان القديم',
          newValue: wh.address,
        },
      ],
    },
  );
  members
    .filter((m) => m.warehouseId === wh.id)
    .forEach((m, j) => {
      auditLog.push({
        id: makeId(0xf6, i * 10 + 3 + j),
        entity: 'WAREHOUSE_USER',
        entityId: m.id,
        parentEntity: 'WAREHOUSE',
        parentId: wh.id,
        action: 'CREATE',
        changedBy: ME_USER_ID,
        changedAt: m.createdAt,
        changes: [
          { field: 'userId', oldValue: null, newValue: m.userName },
          { field: 'role', oldValue: null, newValue: m.role },
        ],
      });
    });
});
