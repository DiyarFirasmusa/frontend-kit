import { isAxiosError } from 'axios';

/**
 * What a failed request says, whatever shape the backend uses. Three shapes are understood:
 *   - Spring's default error body        { timestamp, status, error, message, path }
 *   - RFC 9457 Problem Details           { type, title, status, detail, errors? }
 *   - a validation list (Spring or not)  { message, errors: [{ field, defaultMessage | message }] }
 *     or a map                           { errors: { code: 'already used' } }  ("fieldErrors" works too)
 * The mock API sends `{ message, errors }` (see mocks/http.ts).
 */
export type ApiProblem = {
  /** HTTP status; undefined for a network error or a non-HTTP error. */
  status: number | undefined;
  /** One sentence for the whole request, in the language the backend answered in. */
  message: string | undefined;
  /** Field name -> what is wrong with it. Only read from 400, 409 and 422 answers. */
  fields: Readonly<Record<string, string>>;
};

/** The statuses whose body may blame single fields. */
const FIELD_STATUSES = new Set([400, 409, 422]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const text = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;

/** The first text of a string or of a list of strings. */
function firstText(value: unknown): string | undefined {
  return Array.isArray(value) ? value.map(text).find((item) => item !== undefined) : text(value);
}

/** { field | property | name, message | defaultMessage | detail | reason } -> [field, message] */
function fieldEntry(item: unknown): [string, string] | undefined {
  if (!isRecord(item)) {
    return undefined;
  }
  const field = text(item['field']) ?? text(item['property']) ?? text(item['name']);
  const message =
    text(item['message']) ??
    text(item['defaultMessage']) ??
    text(item['detail']) ??
    text(item['reason']);
  return field === undefined || message === undefined ? undefined : [field, message];
}

function fieldsOf(body: Record<string, unknown>): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const source of [body['errors'], body['fieldErrors']]) {
    if (Array.isArray(source)) {
      for (const item of source) {
        const entry = fieldEntry(item);
        // The first message for a field is the one shown.
        if (entry !== undefined && fields[entry[0]] === undefined) {
          fields[entry[0]] = entry[1];
        }
      }
    } else if (isRecord(source)) {
      for (const [field, value] of Object.entries(source)) {
        const message = firstText(value);
        if (message !== undefined && fields[field] === undefined) {
          fields[field] = message;
        }
      }
    }
  }
  return fields;
}

/**
 * Reads a failed request. "title" is not used on purpose: Problem Details titles are generic English
 * phrases ("Bad Request") that would be worse than the short translated text chosen by status.
 */
export function parseApiProblem(error: unknown): ApiProblem {
  if (!isAxiosError(error)) {
    return { status: undefined, message: undefined, fields: {} };
  }
  const status = error.response?.status;
  const body: unknown = error.response?.data;
  if (!isRecord(body)) {
    return { status, message: undefined, fields: {} };
  }
  return {
    status,
    message: text(body['message']) ?? text(body['detail']),
    fields: status !== undefined && FIELD_STATUSES.has(status) ? fieldsOf(body) : {},
  };
}
