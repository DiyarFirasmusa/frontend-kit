import { isAxiosError } from 'axios';

/** HTTP status from an Axios error response, if any. */
export function getErrorStatus(error: unknown): number | undefined {
  if (!isAxiosError(error)) {
    return undefined;
  }
  return error.response?.status;
}

/** Response body from an Axios error, if any. */
export function getErrorData(error: unknown): unknown {
  if (!isAxiosError(error)) {
    return undefined;
  }
  return error.response?.data;
}

/** True when the error is an Axios 404 response. */
export function isNotFoundError(error: unknown): boolean {
  return getErrorStatus(error) === 404;
}
