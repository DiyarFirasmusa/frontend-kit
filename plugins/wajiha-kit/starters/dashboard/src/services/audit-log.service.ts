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

export async function fetchAuditLog(
  params: AuditLogParams,
): Promise<PageResponseAuditLogResponse> {
  const { data } = await privateApi.get<PageResponseAuditLogResponse>(
    endpoints.auditLog.list,
    { params },
  );
  return data;
}
