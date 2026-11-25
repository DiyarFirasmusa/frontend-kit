// Generated from docs/api/openapi.json by scripts/gen-api-types.py — do not edit by hand.
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
