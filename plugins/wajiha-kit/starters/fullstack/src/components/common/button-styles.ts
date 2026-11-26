import { cx } from '@/shared/utils/cx';

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';

export const buttonPrimary = cx(base, 'bg-primary text-primary-foreground hover:bg-primary-hover');
export const buttonSecondary = cx(
  base,
  'border border-stroke bg-surface text-text-primary hover:bg-muted',
);
export const card = 'rounded-lg border border-stroke bg-surface p-6 shadow-mid';
