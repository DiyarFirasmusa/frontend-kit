import { cx } from '@/shared/utils/cx';

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';

export const buttonPrimary = cx(base, 'bg-primary text-on-primary hover:bg-primary-hover');
export const buttonSecondary = cx(
  base,
  'border border-border bg-surface text-text hover:bg-surface-sunken',
);
export const card = 'rounded-lg border border-border bg-surface p-6 shadow-card';
