/**
 * Shapes most OpenAPI backends (Spring Data, problem+json) return. Mirror the
 * real spec: if yours says `items` / `total`, change these two types and the
 * services that read them; nothing else depends on the names.
 */

/** One page of a list. `number` is the 0-based page index. */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/** Field name (dotted for nested and array fields) to its messages. */
export type FieldErrors = Record<string, string[]>;

/** RFC 9457 problem details, with the common `errors` extension for 400/422. */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: FieldErrors;
}
