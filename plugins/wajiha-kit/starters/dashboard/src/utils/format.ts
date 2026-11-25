function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toDate(input: string | Date): Date {
  return input instanceof Date ? input : new Date(input);
}

/**
 * Calendar date in the device's local timezone, not UTC.
 * `toISOString().slice(0, 10)` is the previous day for a user near
 * midnight east of UTC (for example 00:30 in Baghdad, UTC+3).
 *
 * Attendance check-in/out instants are still built from this device
 * clock. The API has no tenant timezone of record to use instead.
 */
export function localIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDate(input?: string | Date): string {
  if (!input) {
    return '—';
  }
  return localIsoDate(toDate(input));
}

export function formatTime(input?: string | Date): string {
  if (!input) {
    return '—';
  }
  const d = toDate(input);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatPlainNumber(value?: number | null): string {
  if (value === undefined || value === null) {
    return '—';
  }
  return String(value);
}

export function formatIqd(value: number | null | undefined): string {
  if (value === undefined || value === null) {
    return '—';
  }
  return String(value);
}

export function formatNumber(value?: number): string {
  if (value === undefined || value === null) {
    return '—';
  }

  return new Intl.NumberFormat('en-US').format(value);
}

export function formatShortId(id: string | null | undefined): string {
  if (!id) {
    return '—';
  }
  return id.slice(0, 8);
}

export function formatMoney(
  value?: number | null,
  currency?: string | null,
): string {
  if (value === undefined || value === null) {
    return '—';
  }
  const amount = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value);
  return `${amount} ${currency || 'د.ع'}`;
}

export function formatQuantity(
  value?: number | null,
  uomCode?: string | null,
): string {
  if (value === undefined || value === null) {
    return '—';
  }
  const amount = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 3,
  }).format(value);
  return uomCode ? `${amount} ${uomCode}` : amount;
}

export function formatDateTime(input?: string | Date): string {
  if (!input) {
    return '—';
  }
  const d = toDate(input);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return `${localIsoDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/* One Arabic month style app-wide: the Gregorian MSA names of the frames
   (يناير … مايو، يونيو …), never the Levantine/Iraqi ones (أيار، حزيران).
   Digits stay Western. The pieces are joined by hand because ICU builds
   differ on the separators they put between them. */
function longDateLocale(language: string): string {
  return language.startsWith('ar') ? 'ar-EG-u-nu-latn' : 'en-GB';
}

function isArabic(language: string): boolean {
  return language.startsWith('ar');
}

/** API dates; a `yyyy-MM-dd` value is read as local midnight so its calendar day is kept. */
function toValidDate(input: string | Date | null | undefined): Date | null {
  if (input === null || input === undefined || input === '') {
    return null;
  }
  const date =
    input instanceof Date
      ? input
      : new Date(DATE_ONLY.test(input) ? `${input}T00:00:00` : input);
  return Number.isNaN(date.getTime()) ? null : date;
}

type DatePart = 'weekday' | 'day' | 'month' | 'year';

function dateParts(
  date: Date,
  language: string,
  options: Intl.DateTimeFormatOptions,
): Partial<Record<DatePart, string>> {
  const parts = new Intl.DateTimeFormat(longDateLocale(language), {
    ...options,
    numberingSystem: 'latn',
  }).formatToParts(date);
  const picked: Partial<Record<DatePart, string>> = {};
  for (const part of parts) {
    if (
      part.type === 'weekday' ||
      part.type === 'day' ||
      part.type === 'month' ||
      part.type === 'year'
    ) {
      picked[part.type] = part.value;
    }
  }
  return picked;
}

/** "25 مايو 2025" / "25 May 2025"; '—' when empty or malformed. */
export function formatLongDate(
  input: string | Date | null | undefined,
  language: string,
): string {
  const date = toValidDate(input);
  if (!date) {
    return '—';
  }
  const { day, month, year } = dateParts(date, language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `${day} ${month} ${year}`;
}

/** "25 مايو" / "25 May"; '—' when empty or malformed. */
export function formatDayMonth(
  input: string | Date | null | undefined,
  language: string,
): string {
  const date = toValidDate(input);
  if (!date) {
    return '—';
  }
  const { day, month } = dateParts(date, language, {
    day: 'numeric',
    month: 'long',
  });
  return `${day} ${month}`;
}

/** "25 مايو 2025، 10:32" / "25 May 2025, 10:32" (24 h). */
export function formatLongDateTime(
  input: string | Date | null | undefined,
  language: string,
): string {
  const date = toValidDate(input);
  if (!date) {
    return '—';
  }
  const separator = isArabic(language) ? '،' : ',';
  return `${formatLongDate(date, language)}${separator} ${formatTime(date)}`;
}

/** "الأحد، 4 أكتوبر 2026" / "Sunday, 4 October 2026". */
export function formatWeekdayDate(
  input: string | Date | null | undefined,
  language: string,
): string {
  const date = toValidDate(input);
  if (!date) {
    return '—';
  }
  const { weekday } = dateParts(date, language, { weekday: 'long' });
  const separator = isArabic(language) ? '،' : ',';
  return `${weekday}${separator} ${formatLongDate(date, language)}`;
}

/** "يونيو 2026" / "June 2026" for a calendar month (1-12). */
export function formatMonthYear(
  year: number,
  month: number,
  language: string,
): string {
  const { month: name, year: yearLabel } = dateParts(
    new Date(year, month - 1, 1),
    language,
    { month: 'long', year: 'numeric' },
  );
  return `${name} ${yearLabel}`;
}

/** Arabic screens write the Iraqi dinar as "د.ع"; other codes and English keep the ISO code. */
export function currencyLabel(
  code: string | null | undefined,
  language: string,
): string | null {
  if (!code) {
    return null;
  }
  return code === 'IQD' && isArabic(language) ? 'د.ع' : code;
}
