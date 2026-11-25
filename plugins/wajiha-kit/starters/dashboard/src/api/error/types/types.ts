export type ApiErrorBody = {
  message?: unknown;
  detail?: unknown;
  error_description?: unknown;
  en_error?: unknown;
  ar_error?: unknown;
  non_field_errors?: unknown[];
  details?: Array<{
    field?: unknown;
    reason?: unknown;
    en_reason?: unknown;
    ar_reason?: unknown;
  }> | null;
  errors?: Record<string, unknown> | null;
};
