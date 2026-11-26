// Types every translation key from the default-language bundles (DEFAULT_LOCALE), so a typo in a key is a
// compile error. Add one line per bundle (a new page or feature): `npm run i18n:validate` fails when a
// locales/ folder is not listed here, and `npm run typecheck` fails on a key that is not typed. The other
// languages are checked against the default one by the validator (parity, plurals, {{variables}}).
import type about from '@/features/website/about/locales/ar.json';
import type contact from '@/features/website/contact/locales/ar.json';
import type home from '@/features/website/home/locales/ar.json';
import type news from '@/features/website/news/locales/ar.json';
import type services from '@/features/website/services/locales/ar.json';
import type shared from '@/shared/locales/ar.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof shared &
        typeof home &
        typeof about &
        typeof services &
        typeof contact &
        typeof news;
    };
  }
}
