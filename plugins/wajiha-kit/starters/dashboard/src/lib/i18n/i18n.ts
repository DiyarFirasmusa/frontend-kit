import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from '@/locales/ar.json';
import en from '@/locales/en.json';
import {
  DEFAULT_LANGUAGE,
  directionOf,
  FALLBACK_LANGUAGE,
  isSupportedLanguage,
  LANGUAGE_CODES,
  type SupportedLanguage,
} from './languages';

export type { SupportedLanguage } from './languages';

const defaultNS = 'translation' as const;

export const LANG_COOKIE = 'lng';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const FALLBACK_LNG = FALLBACK_LANGUAGE;

/* A language missing here is a type error, so config and bundles cannot drift. */
const RESOURCES: Record<SupportedLanguage, { [defaultNS]: object }> = {
  ar: { [defaultNS]: ar },
  en: { [defaultNS]: en },
};

const featureLoaders = import.meta.glob<{ default: Record<string, unknown> }>(
  '../../features/**/locales/*.json',
);

const loadedBundles = new Set<string>();
const loadedFeatures = new Set<string>();

function bundleKeyFor(feature: string, lng: string): string | undefined {
  const suffix = `/features/${feature}/locales/${lng}.json`;
  return Object.keys(featureLoaders).find((key) => key.endsWith(suffix));
}

async function mergeBundle(feature: string, lng: string): Promise<void> {
  const tag = `${feature}:${lng}`;
  if (loadedBundles.has(tag)) {
    return;
  }
  const key = bundleKeyFor(feature, lng);
  if (!key) {
    loadedBundles.add(tag);
    return;
  }
  const mod = await featureLoaders[key]();
  i18n.addResourceBundle(lng, defaultNS, mod.default, true, true);
  loadedBundles.add(tag);
}

export async function loadFeatureLocale(feature: string): Promise<void> {
  loadedFeatures.add(feature);
  const lng = i18n.resolvedLanguage ?? i18n.language ?? FALLBACK_LNG;
  await Promise.all([
    mergeBundle(feature, lng),
    mergeBundle(feature, FALLBACK_LNG),
  ]);
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }
  const match = document.cookie.match(
    new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'),
  );
  return match?.[1];
}

function getInitialLanguage(): SupportedLanguage {
  const stored = readCookie(LANG_COOKIE);
  return isSupportedLanguage(stored) ? stored : DEFAULT_LANGUAGE;
}

function setLanguageCookie(lng: SupportedLanguage) {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${LANG_COOKIE}=${lng}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
}

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => Promise<void> | void) => {
    finished: Promise<void>;
  };
};

async function applyLanguage(lng: SupportedLanguage): Promise<void> {
  await Promise.all(
    [...loadedFeatures].map((feature) => mergeBundle(feature, lng)),
  );

  setLanguageCookie(lng);
  await i18n.changeLanguage(lng);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
    document.documentElement.dir = getDir(lng);
  }
}

export async function setLanguage(lng: SupportedLanguage) {
  const doc =
    typeof document === 'undefined'
      ? undefined
      : (document as DocumentWithViewTransition);
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!doc?.startViewTransition || prefersReduced) {
    await applyLanguage(lng);
    return;
  }

  doc.documentElement.dataset.langSwitching = 'true';
  const transition = doc.startViewTransition(() => applyLanguage(lng));
  try {
    await transition.finished;
  } finally {
    delete doc.documentElement.dataset.langSwitching;
  }
}

export function getDir(lng?: string): 'ltr' | 'rtl' {
  return directionOf(lng ?? i18n.resolvedLanguage ?? i18n.language);
}

i18n.use(initReactI18next).init({
  resources: RESOURCES,
  defaultNS,
  lng: getInitialLanguage(),
  fallbackLng: FALLBACK_LNG,
  react: { useSuspense: false },
  nonExplicitSupportedLngs: true,
  interpolation: { escapeValue: false },
  supportedLngs: LANGUAGE_CODES,
});

export default i18n;
