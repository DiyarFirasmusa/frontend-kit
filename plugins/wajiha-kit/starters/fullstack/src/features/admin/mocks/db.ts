import type { Profile, Supplier } from '../types/api';
import { seedProfile, seedSuppliers } from './seed';

/** The mock API's memory. resetMockDb() puts the demo data back (tests call it between cases). */
export const db: { suppliers: Supplier[]; profile: Profile; nextId: number } = {
  suppliers: seedSuppliers(),
  profile: seedProfile('Demo Admin'),
  nextId: 1000,
};

export function resetMockDb(): void {
  db.suppliers = seedSuppliers();
  db.profile = seedProfile('Demo Admin');
  db.nextId = 1000;
}
