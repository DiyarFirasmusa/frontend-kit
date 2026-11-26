// Hand-written mirror of the demo backend's OpenAPI schemas. With a real spec, generate
// these instead (for example `npx openapi-typescript docs/api/openapi.json -o src/types/api/schema.ts`).
import type { AuditAction, AuditEntity } from './enums';

export interface AuditChange {
  field: string | null;
  oldValue: unknown | null;
  newValue: unknown | null;
}

export interface AuditLogResponse {
  /** uuid */
  id: string;
  entity: AuditEntity | null;
  /** uuid */
  entityId: string | null;
  parentEntity: string | null;
  /** uuid */
  parentId: string | null;
  action: AuditAction | null;
  /** uuid */
  changedBy: string | null;
  /** date-time */
  changedAt: string | null;
  changes: AuditChange[] | null;
}

export interface PageResponseAuditLogResponse {
  content: AuditLogResponse[] | null;
  /** int32 */
  page: number | null;
  /** int32 */
  size: number | null;
  /** int64 */
  totalElements: number | null;
  /** int32 */
  totalPages: number | null;
}
