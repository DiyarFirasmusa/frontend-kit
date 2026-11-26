// Every locale bundle under src/**/locales/<language>.json is loaded here by one glob, so adding a page or a
// feature never needs a registration line, and server-rendered text is never a raw key (everything is bundled,
// no request waits for a translation file). Rules, all checked by buildResources and `npm run i18n:validate`:
//   - the file name is a language in LOCALES (fr.json without 'fr' in LOCALES is an error, not ignored)
//   - a folder with one language file has all of them
//   - bundles are merged key by key (never one group replacing another); a key in two bundles is an error
import { LOCALES, isLocale, localeRecord, type Locale } from './languages';

export type Bundle = Record<string, Record<string, string>>;
export type Resources = Record<Locale, { translation: Bundle }>;

/** `/src/features/x/locales/ar.json` gives the folder and the language, or undefined for another shape. */
function parsePath(file: string): { dir: string; language: string } | undefined {
  const match = /^(.*\/locales)\/([^/]+)\.json$/.exec(file);
  return match === null ? undefined : { dir: match[1] ?? '', language: match[2] ?? '' };
}

/**
 * Builds the translation resources from `{ path: bundle }`. Throws, with the file names, on anything that
 * would silently show a raw key in production.
 */
export function buildResources(files: Readonly<Record<string, Bundle>>): Resources {
  const merged = localeRecord((): Bundle => ({}));
  const origin = new Map<string, string>();
  const present = new Map<string, Set<string>>();

  for (const [file, bundle] of Object.entries(files)) {
    const parsed = parsePath(file);
    if (parsed === undefined) {
      throw new Error(`i18n: ${file} is not a locales/<language>.json file`);
    }
    const { dir, language } = parsed;
    if (!isLocale(language)) {
      throw new Error(
        `i18n: ${file} is not a registered language: add "${language}" to LOCALES in languages.ts, or rename the file`,
      );
    }
    present.set(dir, (present.get(dir) ?? new Set<string>()).add(language));
    const target = merged[language];
    for (const [group, keys] of Object.entries(bundle)) {
      const into = (target[group] ??= {});
      for (const [name, text] of Object.entries(keys)) {
        const id = `${language}:${group}.${name}`;
        if (Object.hasOwn(into, name)) {
          throw new Error(
            `i18n: "${group}.${name}" is defined twice (${origin.get(id)} and ${file})`,
          );
        }
        into[name] = text;
        origin.set(id, file);
      }
    }
  }

  for (const [dir, languages] of present) {
    for (const locale of LOCALES) {
      if (!languages.has(locale)) {
        throw new Error(
          `i18n: ${dir}/${locale}.json is missing (every language needs every bundle)`,
        );
      }
    }
  }
  return localeRecord((locale) => ({ translation: merged[locale] }));
}

export const resources: Resources = buildResources(
  import.meta.glob<Bundle>('/src/**/locales/*.json', { eager: true, import: 'default' }),
);
