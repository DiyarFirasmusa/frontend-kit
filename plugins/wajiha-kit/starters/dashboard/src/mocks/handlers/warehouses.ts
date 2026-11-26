import { http } from 'msw';
import { endpoints } from '@/constants/api';
import {
  type LocationResponse,
  type WarehouseRequest,
  type WarehouseResponse,
  type WarehouseUserRequest,
  type WarehouseUserResponse,
  type WarehouseUserRoleRequest,
} from '@/types/api/warehouses';
/**
 * Warehouses, their locations and members. The list is paged
 * (`?page=0&size=10&sort=name,asc`), 404 for a missing id, 422 problem+json
 * with field errors, 409 when a rule refuses the action (same shape as the
 * suppliers mock).
 */
import {
  api,
  audit,
  boolParam,
  diff,
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
import { directoryName } from '../seed/people';
import { locations, members, warehouses } from '../seed/warehouses';

// Warehouses
// ---------------------------------------------------------------------------

function toWarehouse(w: WarehouseResponse): WarehouseResponse {
  return {
    ...w,
    locationCount: locations.filter((l) => l.warehouseId === w.id).length,
    memberCount: members.filter((m) => m.warehouseId === w.id).length,
    managerName:
      directoryName(w.managerUserId) ?? directoryName(w.managerEmployeeId),
  };
}

const SORTABLE = {
  code: (row: WarehouseResponse) => row.code,
  name: (row: WarehouseResponse) => row.name,
  address: (row: WarehouseResponse) => row.address,
  locationCount: (row: WarehouseResponse) => row.locationCount,
  memberCount: (row: WarehouseResponse) => row.memberCount,
};

/** A malformed body (readJson returns {}) must fail validation, not throw. */
function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function validate(
  request: Request,
  body: WarehouseRequest,
  id: string | null,
): Promise<Response> | null {
  const errors: { field: string; ar: string; en: string }[] = [];
  if (!text(body.code)) {
    errors.push({ field: 'code', ar: 'الرمز مطلوب', en: 'Code is required' });
  } else if (
    warehouses.some((w) => w.id !== id && sameCode(w.code, body.code))
  ) {
    errors.push({
      field: 'code',
      ar: 'رمز المستودع مستخدم مسبقاً',
      en: 'Warehouse code already exists',
    });
  }
  if (!text(body.name)) {
    errors.push({ field: 'name', ar: 'الاسم مطلوب', en: 'Name is required' });
  }
  return errors.length > 0 ? validationProblem(request, errors) : null;
}

function toLocation(l: LocationResponse): LocationResponse {
  const parent = l.parentId
    ? locations.find((p) => p.id === l.parentId)
    : undefined;
  return {
    ...l,
    parentCode: parent?.code ?? null,
    childCount: locations.filter((c) => c.parentId === l.id).length,
  };
}

function toMember(m: WarehouseUserResponse): WarehouseUserResponse {
  const wh = warehouses.find((w) => w.id === m.warehouseId);
  return {
    ...m,
    isManager: wh?.managerUserId === m.userId,
    userName: directoryName(m.userId) ?? m.userName,
  };
}

// ---------------------------------------------------------------------------

export const warehouseHandlers = [
  // ----- Warehouses -----
  http.get(api(endpoints.warehouses.list), async ({ request }) => {
    const url = new URL(request.url);
    const q = textParam(url, 'q');
    const isActive = boolParam(url, 'isActive');
    const isTransit = boolParam(url, 'isTransit');
    const filtered = warehouses
      .map((w) => toWarehouse(w))
      .filter(
        (w) =>
          matches(q, w.code, w.name, w.address, w.managerName) &&
          (isActive === undefined || w.isActive === isActive) &&
          (isTransit === undefined || w.isTransit === isTransit),
      );
    return ok(
      paginate(
        sortBy(filtered, url, SORTABLE),
        intParam(url, 'page', 0),
        intParam(url, 'size', 10),
      ),
    );
  }),

  http.post(api(endpoints.warehouses.create), async ({ request }) => {
    const body = await readJson<WarehouseRequest>(request);
    const invalid = validate(request, body, null);
    if (invalid) {
      return invalid;
    }
    const now = nowIso();
    const warehouse: WarehouseResponse = {
      id: newId(),
      code: text(body.code),
      name: text(body.name),
      address: body.address ?? null,
      hrOrgUnitId: body.hrOrgUnitId ?? null,
      managerEmployeeId: body.managerEmployeeId ?? null,
      managerUserId: body.managerUserId ?? null,
      isTransit: body.isTransit ?? false,
      isActive: body.isActive ?? true,
      createdAt: now,
      updatedAt: now,
      locationCount: 0,
      memberCount: 0,
      managerName: null,
    };
    warehouses.unshift(warehouse);
    audit('WAREHOUSE', warehouse.id, 'CREATE', [
      { field: 'code', oldValue: null, newValue: warehouse.code },
      { field: 'name', oldValue: null, newValue: warehouse.name },
    ]);
    return ok(toWarehouse(warehouse), 201);
  }),

  http.get(
    api(endpoints.warehouses.detail(':id')),
    async ({ params, request }) => {
      const warehouse = warehouses.find((w) => w.id === param(params, 'id'));
      return warehouse ? ok(toWarehouse(warehouse)) : notFound(request);
    },
  ),

  http.put(
    api(endpoints.warehouses.update(':id')),
    async ({ params, request }) => {
      const warehouse = warehouses.find((w) => w.id === param(params, 'id'));
      if (!warehouse) {
        return notFound(request);
      }
      const body = await readJson<WarehouseRequest>(request);
      const invalid = validate(request, body, warehouse.id);
      if (invalid) {
        return invalid;
      }
      const before = { ...warehouse };
      Object.assign(warehouse, {
        code: text(body.code),
        name: text(body.name),
        address: body.address ?? null,
        hrOrgUnitId: body.hrOrgUnitId ?? null,
        managerEmployeeId: body.managerEmployeeId ?? null,
        managerUserId: body.managerUserId ?? null,
        isTransit: body.isTransit ?? warehouse.isTransit,
        isActive: body.isActive ?? warehouse.isActive,
        updatedAt: nowIso(),
      } satisfies Partial<WarehouseResponse>);
      const changes = diff(before, warehouse, [
        'code',
        'name',
        'address',
        'managerUserId',
        'isTransit',
        'isActive',
      ]);
      if (changes.length > 0) {
        audit('WAREHOUSE', warehouse.id, 'UPDATE', changes);
      }
      return ok(toWarehouse(warehouse));
    },
  ),

  http.delete(
    api(endpoints.warehouses.remove(':id')),
    async ({ params, request }) => {
      const id = param(params, 'id');
      const index = warehouses.findIndex((w) => w.id === id);
      if (index === -1) {
        return notFound(request);
      }
      if (locations.some((l) => l.warehouseId === id)) {
        return fail(
          request,
          409,
          'لا يمكن حذف مستودع يحتوي على مواقع، يمكنك إيقافه بدلاً من ذلك',
          'A warehouse with locations cannot be deleted; deactivate it instead',
        );
      }
      warehouses.splice(index, 1);
      for (let i = members.length - 1; i >= 0; i -= 1) {
        if (members[i]?.warehouseId === id) {
          members.splice(i, 1);
        }
      }
      audit('WAREHOUSE', id, 'DELETE', []);
      return noContent();
    },
  ),

  http.get(api(endpoints.warehouses.locations(':id')), async ({ params }) => {
    const id = param(params, 'id');
    const response: LocationResponse[] = locations
      .filter((l) => l.warehouseId === id)
      .map((l) => toLocation(l));
    return ok(response);
  }),

  // ----- Warehouse members -----
  http.get(api(endpoints.warehouses.users(':id')), async ({ params }) => {
    const id = param(params, 'id');
    const response: WarehouseUserResponse[] = members
      .filter((m) => m.warehouseId === id)
      .map((m) => toMember(m));
    return ok(response);
  }),

  http.post(
    api(endpoints.warehouses.users(':id')),
    async ({ params, request }) => {
      const id = param(params, 'id');
      if (!warehouses.some((w) => w.id === id)) {
        return notFound(request);
      }
      const body = await readJson<WarehouseUserRequest>(request);
      if (
        members.some((m) => m.warehouseId === id && m.userId === body.userId)
      ) {
        return fail(
          request,
          409,
          'المستخدم عضو في هذا المستودع مسبقاً',
          'User is already a member of this warehouse',
        );
      }
      const member: WarehouseUserResponse = {
        id: newId(),
        warehouseId: id,
        userId: body.userId,
        role: body.role ?? 'STOREKEEPER',
        isManager: false,
        createdAt: nowIso(),
        userName: directoryName(body.userId),
        isActive: true,
      };
      members.push(member);
      audit(
        'WAREHOUSE_USER',
        member.id,
        'CREATE',
        [
          { field: 'userId', oldValue: null, newValue: member.userName },
          { field: 'role', oldValue: null, newValue: member.role },
        ],
        { entity: 'WAREHOUSE', id },
      );
      return ok(toMember(member), 201);
    },
  ),

  http.put(
    api(endpoints.warehouses.changeUserRole(':id', ':userId')),
    async ({ params, request }) => {
      const id = param(params, 'id');
      const member = members.find(
        (m) => m.warehouseId === id && m.userId === param(params, 'userId'),
      );
      if (!member) {
        return notFound(request);
      }
      const body = await readJson<WarehouseUserRoleRequest>(request);
      const oldRole = member.role;
      member.role = body.role;
      audit(
        'WAREHOUSE_USER',
        member.id,
        'UPDATE',
        [{ field: 'role', oldValue: oldRole, newValue: member.role }],
        { entity: 'WAREHOUSE', id },
      );
      return ok(toMember(member));
    },
  ),

  http.delete(
    api(endpoints.warehouses.removeUser(':id', ':userId')),
    async ({ params, request }) => {
      const id = param(params, 'id');
      const userId = param(params, 'userId');
      const index = members.findIndex(
        (m) => m.warehouseId === id && m.userId === userId,
      );
      if (index === -1) {
        return notFound(request);
      }
      const warehouse = warehouses.find((w) => w.id === id);
      if (warehouse?.managerUserId === userId) {
        return fail(
          request,
          409,
          'لا يمكن إزالة مدير المستودع، غيّر المدير أولاً',
          'The warehouse manager cannot be removed; change the manager first',
        );
      }
      const [removed] = members.splice(index, 1);
      if (removed) {
        audit(
          'WAREHOUSE_USER',
          removed.id,
          'DELETE',
          [{ field: 'userId', oldValue: removed.userName, newValue: null }],
          { entity: 'WAREHOUSE', id },
        );
      }
      return noContent();
    },
  ),
];
