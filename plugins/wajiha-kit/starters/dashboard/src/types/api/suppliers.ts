// Generated from docs/api/openapi.json by scripts/gen-api-types.py — do not edit by hand.
export interface SupplierRequest {
  /** max 30 chars */
  code: string;
  /** max 255 chars */
  name: string;
  /** max 150 chars */
  contactName?: string;
  /** max 50 chars */
  phone?: string;
  /** max 150 chars */
  email?: string;
  /** max 500 chars */
  address?: string;
  /** max 50 chars */
  taxNumber?: string;
  /** max 2000 chars */
  notes?: string;
  isActive?: boolean;
}

export interface SupplierResponse {
  /** uuid */
  id: string;
  code: string | null;
  name: string | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxNumber: string | null;
  notes: string | null;
  isActive: boolean | null;
  registered: boolean | null;
  inUse: boolean | null;
  /** date-time */
  createdAt: string | null;
  /** date-time */
  updatedAt: string | null;
}
