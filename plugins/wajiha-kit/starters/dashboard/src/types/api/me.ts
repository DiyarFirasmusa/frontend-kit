// Generated from docs/api/openapi.json by scripts/gen-api-types.py — do not edit by hand.
export interface MeResponse {
  /** uuid */
  userId: string | null;
  /** uuid */
  tenantId: string | null;
  username: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  jobTitle: string | null;
  orgUnitName: string | null;
  avatarUrl: string | null;
  roles: string[] | null;
  permissions: string[] | null;
  scopes: Record<string, string> | null;
}
