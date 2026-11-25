import { afterEach, describe, expect, it } from 'vitest';
import {
  currencyLabel,
  formatDate,
  formatDayMonth,
  formatLongDate,
  formatLongDateTime,
  formatMonthYear,
  formatWeekdayDate,
  formatDateTime,
  formatMoney,
  formatNumber,
  formatPlainNumber,
  formatQuantity,
  formatShortId,
  formatTime,
  localIsoDate,
} from './format';

describe('localIsoDate', () => {
  const previousTz = process.env.TZ;

  afterEach(() => {
    process.env.TZ = previousTz;
  });

  it('returns the local calendar date at 00:30 in UTC+3, not the previous UTC day', () => {
    process.env.TZ = 'Asia/Baghdad';
    const now = new Date('2026-09-28T21:30:00.000Z');

    expect(now.toISOString().slice(0, 10)).toBe('2026-09-28');
    expect(localIsoDate(now)).toBe('2026-09-29');
  });
});

describe('formatDate', () => {
  it('formats an ISO string as YYYY-MM-DD', () => {
    expect(formatDate('2026-03-07T10:20:30.000Z')).toMatch(/^2026-03-0[67]$/);
  });

  it('accepts a Date instance', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('renders an em dash for empty input', () => {
    expect(formatDate()).toBe('—');
    expect(formatDate('')).toBe('—');
  });
});

describe('formatTime', () => {
  it('formats hours and minutes', () => {
    expect(formatTime(new Date(2026, 0, 5, 9, 5))).toBe('09:05');
  });

  it('renders an em dash for empty input', () => {
    expect(formatTime()).toBe('—');
    expect(formatTime('')).toBe('—');
  });
});

describe('formatPlainNumber', () => {
  it('renders the number verbatim', () => {
    expect(formatPlainNumber(1234)).toBe('1234');
    expect(formatPlainNumber(0)).toBe('0');
  });

  it('renders an em dash for null or undefined', () => {
    expect(formatPlainNumber(null)).toBe('—');
    expect(formatPlainNumber()).toBe('—');
  });
});

describe('formatNumber', () => {
  it('groups thousands with Western numerals', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('renders an em dash for undefined', () => {
    expect(formatNumber()).toBe('—');
  });
});

describe('formatShortId', () => {
  it('returns the first eight characters', () => {
    expect(formatShortId('abcdef12-3456')).toBe('abcdef12');
  });

  it('renders an em dash for empty input', () => {
    expect(formatShortId(null)).toBe('—');
    expect(formatShortId('')).toBe('—');
  });
});

describe('formatMoney', () => {
  it('formats with grouping, Western digits and the default IQD suffix', () => {
    const result = formatMoney(1234.5);
    expect(result).toContain('د.ع');
    expect(result).toBe('1,234.5 د.ع');
    expect(result).toMatch(/[0-9]/);
    expect(result).not.toMatch(/[٠-٩]/);
  });

  it('uses the given currency', () => {
    expect(formatMoney(10, 'USD')).toBe('10 USD');
  });

  it('renders an em dash for null or undefined', () => {
    expect(formatMoney(null)).toBe('—');
    expect(formatMoney()).toBe('—');
  });
});

describe('formatQuantity', () => {
  it('appends the unit of measure code', () => {
    expect(formatQuantity(2.5, 'pcs')).toBe('2.5 pcs');
  });

  it('omits the unit when none is given', () => {
    expect(formatQuantity(2.5)).toBe('2.5');
  });

  it('renders an em dash for null or undefined', () => {
    expect(formatQuantity(null, 'pcs')).toBe('—');
    expect(formatQuantity()).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('formats the local date and time', () => {
    expect(formatDateTime(new Date(2026, 0, 5, 9, 5))).toBe('2026-01-05 09:05');
  });

  it('renders an em dash for empty or invalid input', () => {
    expect(formatDateTime('')).toBe('—');
    expect(formatDateTime()).toBe('—');
    expect(formatDateTime('not-a-date')).toBe('—');
  });
});

describe('long dates', () => {
  it('uses the Gregorian MSA month names in Arabic with Western digits', () => {
    expect(formatLongDate('2025-05-25', 'ar')).toBe('25 مايو 2025');
    expect(formatLongDate('2026-06-30', 'ar')).toBe('30 يونيو 2026');
    expect(formatLongDate('2026-10-04', 'ar')).toBe('4 أكتوبر 2026');
    expect(formatLongDate('2025-05-25', 'en')).toBe('25 May 2025');
  });

  it('keeps the calendar day of a date-only value and renders — for bad input', () => {
    expect(formatLongDate(new Date(2026, 0, 1), 'en')).toBe('1 January 2026');
    expect(formatLongDate(null, 'ar')).toBe('—');
    expect(formatLongDate('not-a-date', 'en')).toBe('—');
  });

  it('formats the day-month, date-time, weekday and month-year variants', () => {
    const at = new Date(2025, 4, 25, 10, 32);
    expect(formatDayMonth(at, 'ar')).toBe('25 مايو');
    expect(formatDayMonth(at, 'en')).toBe('25 May');
    expect(formatLongDateTime(at, 'ar')).toBe('25 مايو 2025، 10:32');
    expect(formatLongDateTime(at, 'en')).toBe('25 May 2025, 10:32');
    expect(formatWeekdayDate(new Date(2026, 9, 4), 'ar')).toBe(
      'الأحد، 4 أكتوبر 2026',
    );
    expect(formatWeekdayDate(new Date(2026, 9, 4), 'en')).toBe(
      'Sunday, 4 October 2026',
    );
    expect(formatMonthYear(2026, 6, 'ar')).toBe('يونيو 2026');
    expect(formatMonthYear(2026, 7, 'en')).toBe('July 2026');
    expect(formatDayMonth(undefined, 'en')).toBe('—');
  });
});

describe('currencyLabel', () => {
  it('writes IQD as د.ع in Arabic and keeps ISO codes otherwise', () => {
    expect(currencyLabel('IQD', 'ar')).toBe('د.ع');
    expect(currencyLabel('IQD', 'en')).toBe('IQD');
    expect(currencyLabel('USD', 'ar')).toBe('USD');
    expect(currencyLabel(null, 'ar')).toBeNull();
  });
});
