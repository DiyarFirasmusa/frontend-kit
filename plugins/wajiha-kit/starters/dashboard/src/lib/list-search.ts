import { catch as withFallback, z } from 'zod';

/**
 * TanStack Router JSON-parses search values before the schema sees them, so
 * `?q=100553` arrives as a number and `?q=true` as a boolean. Free text and
 * ids go through this so they stay strings.
 */
export const looseText = z.preprocess(
  (value) =>
    typeof value === 'number' || typeof value === 'boolean'
      ? String(value)
      : value,
  z.string().trim(),
);

/** Page sizes every list offers; the schema accepts only these. */
export const PAGE_SIZES = [10, 20, 50] as const;

/**
 * `schema.catch(value)` as a function: a bad URL value falls back instead of
 * throwing. (The method form reads like a promise chain to the linter.)
 */
export { withFallback };

export const pageSchema = withFallback(
  z.coerce.number().int().min(1),
  1,
).default(1);

export const pageSizeSchema = withFallback(
  z.coerce.number().pipe(z.literal(PAGE_SIZES)),
  PAGE_SIZES[0],
).default(PAGE_SIZES[0]);
