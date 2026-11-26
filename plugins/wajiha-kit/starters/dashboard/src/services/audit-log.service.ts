import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type { PageResponseAuditLogResponse } from '@/types/api/audit';
import type { AuditEntity } from '@/types/api/enums';

export interface AuditLogParams {
  entity: AuditEntity;
  entityId?: string;
  page: number;
  size: number;
}

/** `signal` comes from TanStack Query, so a cancelled query aborts the request. */
interface RequestOptions {
  signal?: AbortSignal;
}

export async function fetchAuditLog(
  params: AuditLogParams,
  options?: RequestOptions,
): Promise<PageResponseAuditLogResponse> {
  const { data } = await privateApi.get<PageResponseAuditLogResponse>(
    endpoints.auditLog.list,
    { params, signal: options?.signal },
  );
  return data;
}
