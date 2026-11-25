/** Ids, dates and a seeded random generator shared by every seed file. */
import { PERMS } from '@/constants/permissions';

// Helpers
// ---------------------------------------------------------------------------

/** Stable, valid-looking UUID: `group` picks the entity, `n` the row. */
export function makeId(group: number, n: number): string {
  return `${group.toString(16).padStart(8, '0')}-0000-4000-8000-${n
    .toString(16)
    .padStart(12, '0')}`;
}

/** Fresh UUID for rows created at runtime. */
export function newId(): string {
  return crypto.randomUUID();
}

export const DAY_MS = 86_400_000;

/** Anchor for every seeded date. */
const NOW = Date.now();

/** Local calendar date (YYYY-MM-DD) of a Date. */
export function toLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** ISO date-time `days` before now at a given local time. */
export function isoDaysAgo(days: number, hour = 10, minute = 0): string {
  const date = new Date(NOW - days * DAY_MS);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

/** Local date `days` before today (negative = in the future). */
export function dateDaysAgo(days: number): string {
  return toLocalDate(new Date(NOW - days * DAY_MS));
}

/** Small deterministic PRNG so charts stay the same across refetches. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function hashString(value: string): number {
  let hash = 2_166_136_261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.codePointAt(i) ?? 0;
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

// ---------------------------------------------------------------------------
// Tenant, signed-in user, permissions
// ---------------------------------------------------------------------------

export const TENANT_ID = makeId(0x01, 1);

/** Every permission string the app knows; the mock user holds all of them. */
export const ALL_PERMISSIONS: string[] = Object.values(PERMS).flatMap((group) =>
  Object.values(group),
);

export const ROLES = ['SUPERADMIN'];

// ---------------------------------------------------------------------------
