import { mergeBundles, type Bundle } from '@/shared/lib/i18n/create-i18n';
import type { Locale } from '@/shared/lib/i18n/languages';

// Every admin locale bundle, found by folder: src/features/admin/locales/*.json (the general admin text and
// the navigation labels) and src/features/admin/<feature>/locales/*.json. A new admin feature needs no
// line here; its locales folder is picked up by itself. Loaded lazily by load-admin-i18n.ts, so the
// public pages never download admin text. Group names must be unique across bundles (npm run i18n:validate).
const modules = {
  ar: import.meta.glob<Bundle>('../**/locales/ar.json', { eager: true, import: 'default' }),
  en: import.meta.glob<Bundle>('../**/locales/en.json', { eager: true, import: 'default' }),
};

export const adminBundles: Record<Locale, Bundle> = {
  ar: mergeBundles(...Object.values(modules.ar)),
  en: mergeBundles(...Object.values(modules.en)),
};
