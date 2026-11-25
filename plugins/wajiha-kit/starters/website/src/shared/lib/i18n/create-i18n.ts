import { createInstance, type i18n as I18n, type TFunction } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, LOCALES, type Locale } from './languages';
import { resources } from './resources';

/**
 * A fresh i18next instance. getRouter() makes one per request, so two visitors can never share
 * a language: a module-level instance that switches language per request is a race.
 */
export function createI18n(locale: Locale = DEFAULT_LOCALE): I18n {
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

let fixedInstance: I18n | undefined;

/**
 * A translator bound to one language, for code that runs outside React (route head()).
 * getFixedT never changes the shared instance's language, so this is safe across requests.
 */
export function getFixedT(locale: Locale): TFunction {
  fixedInstance ??= createI18n();
  return fixedInstance.getFixedT(locale);
}
