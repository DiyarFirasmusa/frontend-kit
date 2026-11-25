import {
  GENERIC_ERROR_KEY,
  HTTP_STATUS_MESSAGE_KEYS,
  SERVER_ERROR_KEY,
} from '@/constants/errors';
import i18n from '@/lib/i18n/i18n';

export function statusFallbackMessage(
  status: number | undefined,
): string | undefined {
  if (!status) {
    return undefined;
  }
  const key =
    HTTP_STATUS_MESSAGE_KEYS[status] ??
    (status >= 500 ? SERVER_ERROR_KEY : GENERIC_ERROR_KEY);
  return i18n.t(key);
}
