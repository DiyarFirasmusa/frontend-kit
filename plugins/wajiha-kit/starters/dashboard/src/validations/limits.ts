import { z } from 'zod';

export type TextLimit = 10 | 20 | 30 | 50 | 100 | 150 | 200 | 300 | 500 | 1000;

/** Trimmed text capped at the API's max length, with a translated message. */
export function limited(max: TextLimit) {
  return z
    .string()
    .trim()
    .max(max, { message: `common.validation.maxLength${max}` });
}

export const NON_NEGATIVE_MESSAGE = 'common.validation.nonNegative';
export const WHOLE_NUMBER_MESSAGE = 'common.validation.wholeNumber';
export const PERCENT_MESSAGE = 'common.validation.percentRange';
