// The admin's API contract: what the backend sends and accepts. The mock API (../mocks) implements it.

export type LoginRequest = { username: string; password: string };

export type LoginResponse = {
  accessToken: string;
  user: { id: string; username: string; name: string };
  roles: string[];
  permissions: string[];
};

export type Profile = { name: string; email: string; jobTitle: string };

export type Supplier = {
  id: string;
  code: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  isActive: boolean;
  /** ISO date-time */
  updatedAt: string;
};

export type SupplierRequest = {
  code: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  notes?: string;
  isActive: boolean;
};

export type SupplierStatus = 'active' | 'inactive';

/** Query string of GET /suppliers. `page` starts at 1. */
export type SupplierListParams = {
  q?: string;
  status?: SupplierStatus;
  page: number;
  pageSize: number;
};

export type Page<T> = { items: T[]; total: number; page: number; pageSize: number };

export type Overview = {
  suppliers: { total: number; active: number; inactive: number };
  recentlyUpdated: Supplier[];
};
