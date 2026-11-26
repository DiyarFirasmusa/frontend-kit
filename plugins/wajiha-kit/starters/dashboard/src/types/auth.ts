export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  /** Absent when the backend keeps the refresh token in an HttpOnly cookie. */
  refresh?: string;
  /** Optional: when absent, read from the access token (`sub`). */
  userId?: string;
  /** Optional: when absent, read from the access token (`tenant_id`). */
  tenantId?: string;
  /** Optional: when absent, read from the access token (`roles`). */
  roles?: string[];
  permissions?: string[];
}

export interface RefreshResponse {
  access: string;
  /** Absent when the backend keeps the refresh token in an HttpOnly cookie. */
  refresh?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface AccessTokenPayload {
  token_type?: string;
  exp?: number;
  iat?: number;
  jti?: string;
  sub?: string;
  tenant_id?: string;
  roles?: string[];
  permissions?: string[];
  scopes?: Record<string, string>;
}
