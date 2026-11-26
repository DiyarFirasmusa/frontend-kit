// Every site locale bundle is imported statically, so server-rendered text is never a raw key and no
// request ever waits for a translation file. Add a feature bundle here when you add a site feature.
// The admin's bundles are not here: the admin layout adds them when it loads (src/features/admin/i18n),
// so the public pages never download admin text.
import type { i18n as I18n, TFunction } from 'i18next';
import uiAr from '@/components/locales/ar.json';
import uiEn from '@/components/locales/en.json';
import aboutAr from '@/features/site/about/locales/ar.json';
import aboutEn from '@/features/site/about/locales/en.json';
import contactAr from '@/features/site/contact/locales/ar.json';
import contactEn from '@/features/site/contact/locales/en.json';
import homeAr from '@/features/site/home/locales/ar.json';
import homeEn from '@/features/site/home/locales/en.json';
import newsAr from '@/features/site/news/locales/ar.json';
import newsEn from '@/features/site/news/locales/en.json';
import servicesAr from '@/features/site/services/locales/ar.json';
import servicesEn from '@/features/site/services/locales/en.json';
import { createI18n, mergeBundles, type Resources } from '@/shared/lib/i18n/create-i18n';
import { DEFAULT_LOCALE, type Locale } from '@/shared/lib/i18n/languages';
import sharedAr from '@/shared/locales/ar.json';
import sharedEn from '@/shared/locales/en.json';

export const resources: Resources = {
  ar: {
    translation: mergeBundles(sharedAr, uiAr, homeAr, aboutAr, servicesAr, contactAr, newsAr),
  },
  en: {
    translation: mergeBundles(sharedEn, uiEn, homeEn, aboutEn, servicesEn, contactEn, newsEn),
  },
};

/** The per-request instance the router holds (both parts of the project use it). */
export function createSiteI18n(locale: Locale = DEFAULT_LOCALE): I18n {
  return createI18n(resources, locale);
}

let fixedInstance: I18n | undefined;

/**
 * A translator bound to one language, for code that runs outside React (route head()).
 * getFixedT never changes the shared instance's language, so this is safe across requests.
 */
export function getFixedT(locale: Locale): TFunction {
  fixedInstance ??= createSiteI18n();
  return fixedInstance.getFixedT(locale);
}
