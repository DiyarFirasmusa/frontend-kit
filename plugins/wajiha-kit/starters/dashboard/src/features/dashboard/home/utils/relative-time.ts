import type { useTranslation as useTranslationType } from 'react-i18next';
import { formatDayMonth, formatLongDate, formatTime } from '@/utils/format';

type TFn = ReturnType<typeof useTranslationType>['t'];

export interface RelativeTimeContext {
  t: TFn;
  language: string;
  now?: Date;
}

type DateInput = string | Date | null | undefined;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

/** Parses API values; date-only strings are read as local midnight so the calendar day is kept. */
export function toValidDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const date =
    value instanceof Date
      ? value
      : new Date(DATE_ONLY.test(value) ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

/** Whole calendar days from `date` to `now` (0 = same day, 1 = yesterday). */
export function calendarDaysAgo(date: Date, now: Date): number {
  return Math.round((startOfDay(now) - startOfDay(date)) / (24 * HOUR_MS));
}

/** "18 مايو" / "18 May"; the year is added when it is not the current one. */
export function formatShortDate(
  value: DateInput,
  language: string,
  now: Date = new Date(),
): string {
  const date = toValidDate(value);
  if (!date) {
    return '—';
  }
  return date.getFullYear() === now.getFullYear()
    ? formatDayMonth(date, language)
    : formatLongDate(date, language);
}

/** "10:32": every clock on the dashboard is 24 h, so two times on one page never disagree. */
export function formatClock(value: DateInput): string {
  const date = toValidDate(value);
  return date ? formatTime(date) : '—';
}

/** "اليوم" / "أمس" / "18 مايو". */
export function formatRelativeDay(
  value: DateInput,
  { t, language, now = new Date() }: RelativeTimeContext,
): string {
  const date = toValidDate(value);
  if (!date) {
    return '—';
  }
  const days = calendarDaysAgo(date, now);
  if (days === 0) {
    return t('home.time.today');
  }
  if (days === 1) {
    return t('home.time.yesterday');
  }
  return formatShortDate(date, language, now);
}

/** "اليوم، 11:40" / "Today, 11:40". */
export function formatDayTime(
  value: DateInput,
  context: RelativeTimeContext,
): string {
  const date = toValidDate(value);
  if (!date) {
    return '—';
  }
  return context.t('home.time.dayTime', {
    day: formatRelativeDay(date, context),
    time: formatClock(date),
  });
}

/** "منذ 18 دقيقة" / "18 minutes ago", then "أمس" and the short date. */
export function formatTimeAgo(
  value: DateInput,
  context: RelativeTimeContext,
): string {
  const date = toValidDate(value);
  if (!date) {
    return '—';
  }
  const now = context.now ?? new Date();
  const elapsed = now.getTime() - date.getTime();
  if (elapsed < MINUTE_MS) {
    return context.t('home.time.justNow');
  }
  if (elapsed < HOUR_MS) {
    return context.t('home.time.minutesAgo', {
      count: Math.floor(elapsed / MINUTE_MS),
    });
  }
  if (calendarDaysAgo(date, now) === 0) {
    return context.t('home.time.hoursAgo', {
      count: Math.floor(elapsed / HOUR_MS),
    });
  }
  return formatRelativeDay(date, { ...context, now });
}
