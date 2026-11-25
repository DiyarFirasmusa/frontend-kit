import { z } from 'zod';
import type { TextLimit } from './limits';

export type FormatKind =
  | 'code'
  | 'digits'
  | 'personName'
  | 'labelText'
  | 'phone'
  | 'alphanumeric'
  | 'identifier'
  | 'username'
  | 'currency'
  | 'bloodType';

interface FormatRule {
  /** Accepts the whole (trimmed, non-empty) value. */
  test: (value: string) => boolean;
  inputMode: 'text' | 'numeric' | 'tel';
  message: string;
}

const PHONE_DIGITS = /\d/g;

const RULES: Record<FormatKind, FormatRule> = {
  code: {
    test: (v) => /^[A-Za-z]+$/.test(v),
    inputMode: 'text',
    message: 'common.validation.format.code',
  },
  digits: {
    test: (v) => /^\d+$/.test(v),
    inputMode: 'numeric',
    message: 'common.validation.format.digits',
  },
  personName: {
    test: (v) => /^[\p{L}\p{M}]+(?:[ '’.-]+[\p{L}\p{M}]+)*\.?$/u.test(v),
    inputMode: 'text',
    message: 'common.validation.format.personName',
  },
  labelText: {
    test: (v) => /^(?=.*\p{L})[\p{L}\p{M}\p{N} .,'’&()/-]+$/u.test(v),
    inputMode: 'text',
    message: 'common.validation.format.labelText',
  },
  phone: {
    test: (v) => {
      const digits = v.match(PHONE_DIGITS)?.length ?? 0;
      return /^\+?[\d ()-]+$/.test(v) && digits >= 7 && digits <= 15;
    },
    inputMode: 'tel',
    message: 'common.validation.format.phone',
  },
  alphanumeric: {
    test: (v) => /^[A-Za-z0-9]+$/.test(v),
    inputMode: 'text',
    message: 'common.validation.format.alphanumeric',
  },
  identifier: {
    test: (v) => /^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(v),
    inputMode: 'text',
    message: 'common.validation.format.identifier',
  },
  username: {
    test: (v) => /^[A-Za-z0-9][A-Za-z0-9._@-]*$/.test(v),
    inputMode: 'text',
    message: 'common.validation.format.username',
  },
  currency: {
    test: (v) => /^[A-Za-z]{3,10}$/.test(v),
    inputMode: 'text',
    message: 'common.validation.format.currency',
  },
  bloodType: {
    test: (v) => /^(?:A|B|AB|O)[+-]$/.test(v),
    inputMode: 'text',
    message: 'common.validation.format.bloodType',
  },
};

export function formatInputMode(kind: FormatKind): FormatRule['inputMode'] {
  return RULES[kind].inputMode;
}

export function matchesFormat(kind: FormatKind, value: string): boolean {
  return RULES[kind].test(value.trim());
}

/**
 * Trimmed text capped at `max` characters that, when not empty, must match the
 * format. Chain `.min(1, …)` for required fields and `.optional()` as needed.
 */
export function formatted(kind: FormatKind, max: TextLimit | 3) {
  const rule = RULES[kind];
  return z
    .string()
    .trim()
    .max(max, {
      message: max === 3 ? rule.message : `common.validation.maxLength${max}`,
    })
    .refine((value) => value === '' || rule.test(value), {
      message: rule.message,
    });
}
