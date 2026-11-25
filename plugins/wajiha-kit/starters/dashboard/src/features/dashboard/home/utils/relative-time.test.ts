import { beforeAll, describe, expect, it } from 'vitest';
import i18n, { loadFeatureLocale } from '@/lib/i18n/i18n';
import { setTestLanguage } from '@/test/i18n';
import {
  calendarDaysAgo,
  formatClock,
  formatDayTime,
  formatRelativeDay,
  formatShortDate,
  formatTimeAgo,
  toValidDate,
} from './relative-time';

const NOW = new Date(2026, 9, 20, 12, 42);
const at = (day: number, hours: number, minutes: number) =>
  new Date(2026, 9, day, hours, minutes);

function context() {
  return { t: i18n.t.bind(i18n), language: i18n.language, now: NOW };
}

beforeAll(async () => {
  await loadFeatureLocale('dashboard/home');
});

describe('toValidDate and calendarDaysAgo', () => {
  it('reads date-only values as local midnight and rejects invalid input', () => {
    expect(toValidDate('2026-05-18')?.getDate()).toBe(18);
    expect(toValidDate('not a date')).toBeNull();
    expect(toValidDate(null)).toBeNull();
  });

  it('counts calendar days, not 24 hour blocks', () => {
    expect(calendarDaysAgo(at(19, 23, 59), NOW)).toBe(1);
    expect(calendarDaysAgo(at(20, 0, 1), NOW)).toBe(0);
  });
});

describe('relative time in English', () => {
  it('formats short and long dates', () => {
    expect(formatShortDate('2026-05-18', 'en', NOW)).toBe('18 May');
    expect(formatShortDate('2025-05-18', 'en', NOW)).toBe('18 May 2025');
    expect(formatShortDate(null, 'en', NOW)).toBe('—');
  });

  it('formats the clock in 24 h or 12 h', () => {
    expect(formatClock(at(20, 9, 5), 'en')).toBe('09:05');
    expect(formatClock(at(20, 12, 42), 'en', true)).toBe('12:42 PM');
  });

  it('names today and yesterday, then falls back to the date', () => {
    expect(formatRelativeDay(at(20, 10, 32), context())).toBe('Today');
    expect(formatRelativeDay(at(19, 14, 20), context())).toBe('Yesterday');
    expect(formatRelativeDay('2026-05-18T09:15:00', context())).toBe('18 May');
    expect(formatDayTime(at(20, 11, 40), context())).toBe('Today, 11:40');
    expect(formatDayTime(null, context())).toBe('—');
  });

  it('counts minutes and hours ago within the same day', () => {
    expect(formatTimeAgo(new Date(NOW.getTime() - 30_000), context())).toBe(
      'Just now',
    );
    expect(formatTimeAgo(at(20, 12, 24), context())).toBe('18 minutes ago');
    expect(formatTimeAgo(at(20, 11, 41), context())).toBe('1 hour ago');
    expect(formatTimeAgo(at(20, 10, 40), context())).toBe('2 hours ago');
    expect(formatTimeAgo(at(19, 23, 0), context())).toBe('Yesterday');
  });
});

describe('relative time in Arabic', () => {
  it('uses Arabic words with Western digits', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/home');
    expect(formatShortDate('2026-05-18', 'ar', NOW)).toBe('18 مايو');
    expect(formatShortDate('2025-06-04', 'ar', NOW)).toBe('4 يونيو 2025');
    expect(formatClock(at(20, 12, 42), 'ar', true)).toBe('12:42 م');
    expect(formatRelativeDay(at(20, 10, 32), context())).toBe('اليوم');
    expect(formatRelativeDay(at(19, 14, 20), context())).toBe('أمس');
    expect(formatDayTime(at(20, 11, 40), context())).toBe('اليوم، 11:40');
  });

  it('applies the Arabic plural forms', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/home');
    expect(formatTimeAgo(at(20, 12, 24), context())).toBe('منذ 18 دقيقة');
    expect(formatTimeAgo(at(20, 12, 37), context())).toBe('منذ 5 دقائق');
    expect(formatTimeAgo(at(20, 10, 40), context())).toBe('منذ ساعتين');
    expect(formatTimeAgo(at(20, 11, 41), context())).toBe('منذ ساعة');
    expect(formatTimeAgo(new Date(NOW.getTime() - 30_000), context())).toBe(
      'الآن',
    );
  });
});
