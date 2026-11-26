// Hand-written mirror of the demo backend's OpenAPI schemas. With a real spec, generate
// these instead (for example `npx openapi-typescript docs/api/openapi.json -o src/types/api/schema.ts`).
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
