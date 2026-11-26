import { mergeBundles, type Bundle } from '@/shared/lib/i18n/create-i18n';
import type { Locale } from '@/shared/lib/i18n/languages';
// Every admin locale bundle. Loaded lazily by the admin layout (load-admin-i18n.ts), so the public pages
// never download admin text. Add a bundle here when you add an admin feature.
import authAr from '../auth/locales/ar.json';
import authEn from '../auth/locales/en.json';
import adminAr from '../locales/ar.json';
import adminEn from '../locales/en.json';
import overviewAr from '../overview/locales/ar.json';
import overviewEn from '../overview/locales/en.json';
import settingsAr from '../settings/locales/ar.json';
import settingsEn from '../settings/locales/en.json';
import suppliersAr from '../suppliers/locales/ar.json';
import suppliersEn from '../suppliers/locales/en.json';

export const adminBundles: Record<Locale, Bundle> = {
  ar: mergeBundles(adminAr, authAr, overviewAr, suppliersAr, settingsAr),
  en: mergeBundles(adminEn, authEn, overviewEn, suppliersEn, settingsEn),
};
