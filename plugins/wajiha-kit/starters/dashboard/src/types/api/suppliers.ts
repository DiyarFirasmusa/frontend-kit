// Hand-written mirror of the demo backend's OpenAPI schemas. With a real spec, generate
// these instead (for example `npx openapi-typescript docs/api/openapi.json -o src/types/api/schema.ts`).
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
  /** True when documents reference the supplier: the backend refuses to delete it. */
  inUse: boolean | null;
  /** date-time */
  createdAt: string | null;
  /** date-time */
  updatedAt: string | null;
}
