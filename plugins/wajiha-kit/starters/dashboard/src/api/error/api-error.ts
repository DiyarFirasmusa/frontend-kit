import { isAxiosError } from 'axios';
import { GENERIC_ERROR_KEY } from '@/constants/errors';
import i18n from '@/lib/i18n/i18n';
import type { ApiErrorBody } from './types/types';
import { translateKnownMessage } from './utils/known-messages';
import { statusFallbackMessage } from './utils/status-fallback';
import { isArabic, pickString } from './utils/utils';

export { getErrorData, getErrorStatus, isNotFoundError } from './utils/http';

export function extractApiErrorMessage(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }
  const errorBody = body as ApiErrorBody;

  const localized = isArabic()
    ? (pickString(errorBody.ar_error) ?? pickString(errorBody.en_error))
    : (pickString(errorBody.en_error) ?? pickString(errorBody.ar_error));

  const direct =
    localized ??
    pickString(errorBody.message) ??
    pickString(errorBody.detail) ??
    pickString(errorBody.error_description);
  if (direct) {
    return direct;
  }

  if (Array.isArray(errorBody.details)) {
    for (const item of errorBody.details) {
      const reason = isArabic()
        ? (pickString(item?.ar_reason) ??
          pickString(item?.en_reason) ??
          pickString(item?.reason))
        : (pickString(item?.en_reason) ??
          pickString(item?.ar_reason) ??
          pickString(item?.reason));
      if (reason) {
        return reason;
      }
    }
  }

  if (Array.isArray(errorBody.non_field_errors)) {
    const first = pickString(errorBody.non_field_errors[0]);
    if (first) {
      return first;
    }
  }

  if (errorBody.errors && typeof errorBody.errors === 'object') {
    for (const value of Object.values(errorBody.errors)) {
      const candidate = Array.isArray(value) ? value[0] : value;
      const str = pickString(candidate);
      if (str) {
        return str;
      }
    }
  }

  return undefined;
}

export function displayBackendMessage(raw: unknown): string | undefined {
  const message = pickString(raw);
  if (!message) {
    return undefined;
  }
  return (
    translateKnownMessage(message) ??
    (i18n.exists(message) ? i18n.t(message) : message)
  );
}

export function resolveApiErrorMessage(
  error: unknown,
  fallback = i18n.t(GENERIC_ERROR_KEY),
): string {
  if (isAxiosError(error)) {
    return (
      displayBackendMessage(extractApiErrorMessage(error.response?.data)) ??
      statusFallbackMessage(error.response?.status) ??
      fallback
    );
  }
  return fallback;
}
