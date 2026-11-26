/**
 * What an error body may carry. Every field is `unknown` because the body is
 * the network's: each reader narrows what it uses.
 */
export type ApiErrorBody = {
  message?: unknown;
  /** RFC 9457 problem+json: `detail` explains, `title` summarises. */
  detail?: unknown;
  title?: unknown;
  error_description?: unknown;
  en_error?: unknown;
  ar_error?: unknown;
  /** Array of messages. */
  non_field_errors?: unknown;
  /** Array of `{ field, reason, en_reason, ar_reason }`. */
  details?: unknown;
  /** Record of field name to message or messages. */
  errors?: unknown;
};
