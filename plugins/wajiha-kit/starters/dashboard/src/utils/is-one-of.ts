/**
 * Narrows a string to one of an `as const` list, so a value from the outside
 * (a select, a query param, a response) becomes the union without an `as`.
 */
export function isOneOf<const T extends readonly string[]>(
  values: T,
  value: unknown,
): value is T[number] {
  return typeof value === 'string' && values.some((item) => item === value);
}
