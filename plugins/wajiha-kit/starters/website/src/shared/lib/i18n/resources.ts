// Every locale bundle is imported statically, so server-rendered text is never a raw key and no
// request ever waits for a translation file. Add a feature bundle here when you add a feature.
import aboutAr from '@/features/website/about/locales/ar.json';
import aboutEn from '@/features/website/about/locales/en.json';
import contactAr from '@/features/website/contact/locales/ar.json';
import contactEn from '@/features/website/contact/locales/en.json';
import homeAr from '@/features/website/home/locales/ar.json';
import homeEn from '@/features/website/home/locales/en.json';
import newsAr from '@/features/website/news/locales/ar.json';
import newsEn from '@/features/website/news/locales/en.json';
import servicesAr from '@/features/website/services/locales/ar.json';
import servicesEn from '@/features/website/services/locales/en.json';
import sharedAr from '@/shared/locales/ar.json';
import sharedEn from '@/shared/locales/en.json';
import type { Locale } from './languages';

type Bundle = Record<string, Record<string, string>>;

const merge = (...bundles: Bundle[]): Bundle => Object.assign({}, ...bundles);

export const resources: Record<Locale, { translation: Bundle }> = {
  ar: { translation: merge(sharedAr, homeAr, aboutAr, servicesAr, contactAr, newsAr) },
  en: { translation: merge(sharedEn, homeEn, aboutEn, servicesEn, contactEn, newsEn) },
};
