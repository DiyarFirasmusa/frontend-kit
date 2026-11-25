// Generated from docs/api/openapi.json by scripts/gen-api-types.py — do not edit by hand.
import type { WarehouseUserRole } from './enums';

export interface WarehouseRequest {
  /** max 30 chars */
  code: string;
  /** max 200 chars */
  name: string;
  /** max 300 chars */
  address?: string;
  /** uuid */
  hrOrgUnitId?: string;
  /** uuid */
  managerEmployeeId?: string;
  /** uuid */
  managerUserId?: string;
  isTransit?: boolean;
  isActive?: boolean;
}

export interface WarehouseResponse {
  /** uuid */
  id: string;
  code: string | null;
  name: string | null;
  address: string | null;
  /** uuid */
  hrOrgUnitId: string | null;
  /** uuid */
  managerEmployeeId: string | null;
  /** uuid */
  managerUserId: string | null;
  isTransit: boolean | null;
  isActive: boolean | null;
  /** date-time */
  createdAt: string | null;
  /** date-time */
  updatedAt: string | null;
  /** int64 */
  locationCount: number | null;
  /** int64 */
  memberCount: number | null;
  managerName: string | null;
}

export interface LocationRequest {
  /** uuid */
  warehouseId: string;
  /** uuid */
  parentId?: string;
  /** uuid */
  locationTypeId: string;
  /** max 50 chars */
  code: string;
  /** max 150 chars */
  name?: string;
  /** max 80 chars */
  barcode?: string;
  isBlocked?: boolean;
  isActive?: boolean;
}

export interface LocationResponse {
  /** uuid */
  id: string;
  /** uuid */
  warehouseId: string | null;
  /** uuid */
  parentId: string | null;
  parentCode: string | null;
  /** uuid */
  locationTypeId: string | null;
  locationTypeName: string | null;
  code: string | null;
  name: string | null;
  barcode: string | null;
  isBlocked: boolean | null;
  isActive: boolean | null;
  /** int64 */
  childCount: number | null;
}

export interface LocationTypeRequest {
  /** max 30 chars */
  code: string;
  /** max 100 chars */
  name: string;
  /** int32, range 1–… */
  rank: number;
  canHoldStock?: boolean;
  isActive?: boolean;
}

export interface LocationTypeResponse {
  /** uuid */
  id: string;
  code: string | null;
  name: string | null;
  /** int32 */
  rank: number | null;
  canHoldStock: boolean | null;
  isActive: boolean | null;
  /** int64 */
  usageCount: number | null;
}

export interface WarehouseUserRequest {
  /** uuid */
  userId: string;
  role?: WarehouseUserRole;
}

export interface WarehouseUserRoleRequest {
  role: WarehouseUserRole;
}

export interface WarehouseUserResponse {
  /** uuid */
  id: string;
  /** uuid */
  warehouseId: string | null;
  /** uuid */
  userId: string | null;
  role: WarehouseUserRole | null;
  isManager: boolean | null;
  /** date-time */
  createdAt: string | null;
  userName: string | null;
  isActive: boolean | null;
}

export interface PageResponseLocationResponse {
  content: LocationResponse[] | null;
  /** int32 */
  page: number | null;
  /** int32 */
  size: number | null;
  /** int64 */
  totalElements: number | null;
  /** int32 */
  totalPages: number | null;
}
