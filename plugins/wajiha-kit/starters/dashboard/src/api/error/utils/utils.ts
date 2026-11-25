import i18n from '@/lib/i18n/i18n';

export function pickString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function isArabic(): boolean {
  return i18n.language.toLowerCase().startsWith('ar');
}
