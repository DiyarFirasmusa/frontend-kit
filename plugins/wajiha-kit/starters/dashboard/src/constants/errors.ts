export const HTTP_STATUS_MESSAGE_KEYS: Record<number, string> = {
  400: 'common.errors.badRequest',
  401: 'common.errors.forbidden',
  403: 'common.errors.forbidden',
  404: 'common.errors.notFound',
  409: 'common.errors.conflict',
  422: 'common.errors.unprocessable',
  500: 'common.errors.server',
  502: 'common.errors.unavailable',
  503: 'common.errors.unavailable',
  504: 'common.errors.unavailable',
};

export const SERVER_ERROR_KEY = 'common.errors.server';
export const GENERIC_ERROR_KEY = 'common.errors.generic';
