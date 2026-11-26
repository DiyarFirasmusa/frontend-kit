// Hand-written mirror of the demo backend's OpenAPI schemas. With a real spec, generate
// these instead (for example `npx openapi-typescript docs/api/openapi.json -o src/types/api/schema.ts`).
export interface DirectoryResolveRequest {
  userIds?: string[];
  employeeIds?: string[];
  orgUnitIds?: string[];
}

export interface DirectoryEntryResponse {
  /** uuid */
  id: string;
  name: string | null;
  avatarUrl: string | null;
  subtitle: string | null;
  employmentStatus: string | null;
}

export interface RoleResponse {
  code: string | null;
  name: string | null;
  description: string | null;
}
