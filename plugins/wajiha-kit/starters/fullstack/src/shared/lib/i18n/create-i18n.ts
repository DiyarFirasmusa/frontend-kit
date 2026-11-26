import { createInstance, type i18n as I18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, LOCALES, type Locale } from './languages';

/** Translation bundles: group.key, two levels, one object per language. */
export type Bundle = Record<string, Record<string, string>>;
export type Resources = Record<Locale, { translation: Bundle }>;

/** Shallow-merges bundles. Group names must be unique across bundles (npm run i18n:validate checks it). */
export const mergeBundles = (...bundles: Bundle[]): Bundle => Object.assign({}, ...bundles);

/**
 * A fresh i18next instance. getRouter() makes one per request, so two visitors can never share
 * a language: a module-level instance that switches language per request is a race.
 */
export function createI18n(resources: Resources, locale: Locale = DEFAULT_LOCALE): I18n {
  const instance = createInstance();
  void instance.use(initReactI18next).init({
    resources,
    lng: locale,
    fallbackLng: false,
    supportedLngs: [...LOCALES],
    defaultNS: 'translation',
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  return instance;
}
