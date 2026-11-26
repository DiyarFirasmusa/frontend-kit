import { isAxiosError } from 'axios';
import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';
import type { FieldErrors } from '@/types/api/page';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toMessages(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

/**
 * Field errors from a 400/422 body. Reads the two shapes OpenAPI backends use
 * most: `errors: { field: string[] | string }` (problem+json extension, Rails,
 * Laravel) and `errors: [{ field, message }]` (Spring validation).
 */
export function getApiFieldErrors(error: unknown): FieldErrors {
  if (!isAxiosError(error)) {
    return {};
  }
  const body: unknown = error.response?.data;
  if (!isRecord(body)) {
    return {};
  }
  const raw = body.errors;
  const result: FieldErrors = {};
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (isRecord(item) && typeof item.field === 'string') {
        const messages = toMessages(item.message ?? item.defaultMessage);
        result[item.field] = [...(result[item.field] ?? []), ...messages];
      }
    }
    return result;
  }
  if (isRecord(raw)) {
    for (const [field, value] of Object.entries(raw)) {
      const messages = toMessages(value);
      if (messages.length > 0) {
        result[field] = messages;
      }
    }
  }
  return result;
}

/**
 * Puts every backend field error under its input (`setError`) and returns
 * whether any landed. `fields` lists the form's own field names, so an error
 * for a field the form does not show is left to the toast the client already
 * raised. Backend text is shown as sent: it arrives in the UI language
 * (Accept-Language); map codes to i18n keys here if your backend sends codes.
 */
export function applyApiFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly FieldPath<T>[],
): boolean {
  const errors = getApiFieldErrors(error);
  let applied = false;
  let first = true;
  for (const field of fields) {
    const message = errors[field]?.[0];
    if (message) {
      setError(field, { type: 'server', message }, { shouldFocus: first });
      first = false;
      applied = true;
    }
  }
  return applied;
}
