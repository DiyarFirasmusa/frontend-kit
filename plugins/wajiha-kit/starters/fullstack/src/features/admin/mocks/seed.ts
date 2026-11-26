import type { Profile, Supplier } from '../types/api';

// Demo data for the mock API. Every name, phone and address is invented; e-mails use example.com
// (reserved for documentation). It lives in memory and resets when the page reloads.

const ARABIC = ['النخيل', 'الواحة', 'الأفق', 'المنارة', 'السنبلة', 'الجسر', 'الندى', 'الريادة'];
const LATIN = ['Northwind', 'Bluefield', 'Cedar', 'Harbor', 'Summit', 'Brightway', 'Oakline'];
const KINDS_AR = ['للتجهيزات', 'للمواد الغذائية', 'للقرطاسية', 'للمستلزمات الطبية'];
const KINDS_EN = ['Supplies', 'Foods', 'Stationery', 'Medical'];
const CONTACTS = ['سارة أحمد', 'Omar Karim', 'ليلى حسن', 'Adam Noor', 'مريم علي', 'Yusuf Sami'];

const DAY_MS = 24 * 60 * 60 * 1000;
/** A fixed "now" so the demo list sorts the same way on every machine. */
const SEED_NOW = Date.UTC(2026, 0, 15, 9, 0, 0);

function seedSupplier(index: number): Supplier {
  const n = index + 1;
  const arabic = index % 3 !== 2;
  const name = arabic
    ? `شركة ${ARABIC[index % ARABIC.length] ?? ''} ${KINDS_AR[index % KINDS_AR.length] ?? ''}`
    : `${LATIN[index % LATIN.length] ?? ''} ${KINDS_EN[index % KINDS_EN.length] ?? ''}`;
  return {
    id: `sup-${String(n).padStart(3, '0')}`,
    code: `SUP-${String(n).padStart(3, '0')}`,
    name: `${name} ${n}`,
    contactName: index % 4 === 3 ? null : (CONTACTS[index % CONTACTS.length] ?? null),
    phone: index % 5 === 4 ? null : `+000 000 ${String(1000 + n).slice(-4)}`,
    email: index % 4 === 1 ? null : `supplier${String(n).padStart(2, '0')}@example.com`,
    notes: index % 6 === 0 ? 'مورد تجريبي' : null,
    isActive: index % 5 !== 3,
    updatedAt: new Date(SEED_NOW - index * DAY_MS).toISOString(),
  };
}

export const SUPPLIER_COUNT = 23;

/** Fresh copies, so a test or a reload starts from the same rows. */
export function seedSuppliers(): Supplier[] {
  return Array.from({ length: SUPPLIER_COUNT }, (_, index) => seedSupplier(index));
}

export function seedProfile(name: string): Profile {
  return { name, email: 'admin@example.com', jobTitle: '' };
}
