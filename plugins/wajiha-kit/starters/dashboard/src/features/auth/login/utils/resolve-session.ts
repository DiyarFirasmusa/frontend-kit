import { decodeJwt } from '@/lib/jwt';
import type { LoginResponse } from '@/types/auth';

export interface ResolvedSession {
  userId: string;
  tenantId: string | null;
  roles: string[];
  permissions: string[];
}

/**
 * The login body may carry only `access`, `refresh` and `permissions`; the
 * user id, tenant and roles are always inside the access token. Read the
 * token first and fall back to the body, so either response shape works.
 */
export function resolveLoginSession(res: LoginResponse): ResolvedSession {
  const claims = decodeJwt(res.access);
  return {
    userId: res.userId ?? claims?.sub ?? '',
    tenantId: res.tenantId ?? claims?.tenant_id ?? null,
    roles: res.roles ?? claims?.roles ?? [],
    permissions: res.permissions ?? claims?.permissions ?? [],
  };
}
