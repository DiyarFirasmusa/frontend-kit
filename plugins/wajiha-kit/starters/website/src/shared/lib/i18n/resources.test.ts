import { readdirSync, readFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { NAV } from '@/config/nav.config';
import { createI18n, getFixedT } from './create-i18n';
import { DEFAULT_LOCALE, LOCALES, otherLocales, type Locale } from './languages';
import { buildResources, resources, type Bundle } from './resources';

const SRC = join(process.cwd(), 'src');

/** Every locales/<language>.json on disk, read without Vite, so this test does not share the loader's blind spots. */
function bundlesOnDisk(): { file: string; locale: string; bundle: Bundle }[] {
  return readdirSync(SRC, { recursive: true, encoding: 'utf8' })
    .map((file) => file.split(sep).join('/'))
    .filter((file) => /(^|\/)locales\/[^/]+\.json$/.test(file))
    .map((file) => ({
      file,
      locale: file.slice(file.lastIndexOf('/') + 1, -'.json'.length),
      bundle: JSON.parse(readFileSync(join(SRC, file), 'utf8')) as Bundle,
    }));
}

const keysOf = (locale: Locale): string[] =>
  Object.entries(resources[locale].translation).flatMap(([group, values]) =>
    Object.keys(values).map((name) => `${group}.${name}`),
  );

describe('translation resources', () => {
  it('every language has exactly the same keys as the default language', () => {
    for (const locale of LOCALES) {
      expect(keysOf(locale).toSorted()).toEqual(keysOf(DEFAULT_LOCALE).toSorted());
    }
  });

  it('every navigation label exists in every language', () => {
    for (const locale of LOCALES) {
      const t = getFixedT(locale);
      for (const item of NAV) {
        expect(t(item.labelKey)).not.toBe(item.labelKey);
      }
    }
  });

  it('a missing key is never filled from another language', () => {
    // The one deliberately wrong key: the typed t() would refuse it at compile time.
    const missing = 'nav.doesNotExist' as never;
    expect(getFixedT('ar')(missing)).toBe('nav.doesNotExist');
  });
});

describe('registration: every bundle on disk is loaded', () => {
  it('finds bundles to check (so the loop below cannot pass by checking nothing)', () => {
    expect(bundlesOnDisk().length).toBeGreaterThanOrEqual(LOCALES.length * 2);
  });

  it('every group.key of every locales/*.json file resolves at runtime to its own text', () => {
    for (const { file, locale, bundle } of bundlesOnDisk()) {
      expect(LOCALES as readonly string[], `${file} is not a registered language`).toContain(
        locale,
      );
      const loaded = resources[locale as Locale].translation;
      for (const [group, keys] of Object.entries(bundle)) {
        for (const [name, text] of Object.entries(keys)) {
          expect(loaded[group]?.[name], `${file}: ${group}.${name} is not loaded`).toBe(text);
        }
      }
    }
  });

  it('a group name lives in one bundle only (a shared group hides which file owns a key)', () => {
    const owner = new Map<string, string>();
    for (const { file, locale, bundle } of bundlesOnDisk()) {
      for (const group of Object.keys(bundle)) {
        const id = `${locale}:${group}`;
        expect(
          owner.get(id),
          `group "${group}" is in ${owner.get(id)} and ${file}`,
        ).toBeUndefined();
        owner.set(id, file);
      }
    }
  });
});

describe('buildResources', () => {
  // One file per language in LOCALES (whatever they are), the default language holding `ar`, the others `en`.
  const pair = (dir: string, ar: Bundle, en: Bundle): Record<string, Bundle> =>
    Object.fromEntries(
      LOCALES.map((locale) => [`${dir}/${locale}.json`, locale === DEFAULT_LOCALE ? ar : en]),
    );

  it('merges bundles key by key: a second bundle never replaces a group', () => {
    const built = buildResources({
      ...pair('/src/a/locales', { page: { one: 'ا' } }, { page: { one: 'a' } }),
      ...pair('/src/b/locales', { page: { two: 'ب' } }, { page: { two: 'b' } }),
    });
    expect(built[DEFAULT_LOCALE].translation['page']).toEqual({ one: 'ا', two: 'ب' });
    for (const locale of otherLocales(DEFAULT_LOCALE)) {
      expect(built[locale].translation['page']).toEqual({ one: 'a', two: 'b' });
    }
  });

  it('throws when a key is defined in two bundles', () => {
    expect(() =>
      buildResources({
        ...pair('/src/a/locales', { page: { one: 'ا' } }, { page: { one: 'a' } }),
        ...pair('/src/b/locales', { page: { one: 'ب' } }, { page: { one: 'b' } }),
      }),
    ).toThrow(/"page.one" is defined twice/);
  });

  it('throws on a file that is not a registered language', () => {
    expect(() =>
      buildResources({
        ...pair('/src/a/locales', { page: { one: 'ا' } }, { page: { one: 'a' } }),
        '/src/a/locales/zz.json': { page: { one: 'z' } },
      }),
    ).toThrow(/not a registered language/);
  });

  it('throws when a folder lacks one language', () => {
    const [missing] = otherLocales(DEFAULT_LOCALE);
    expect(() =>
      buildResources({ [`/src/a/locales/${DEFAULT_LOCALE}.json`]: { page: { one: 'ا' } } }),
    ).toThrow(`/src/a/locales/${missing}.json is missing`);
  });

  it('throws on a path that is not locales/<language>.json', () => {
    expect(() => buildResources({ '/src/a/ar.json': { page: { one: 'ا' } } })).toThrow(
      /not a locales\/<language>\.json file/,
    );
  });
});

describe('plurals', () => {
  it('Arabic picks the right form for 0, 1, 2, few, many and other', () => {
    const t = getFixedT('ar');
    expect(t('news.readTime', { count: 0 })).toBe('أقل من دقيقة قراءة');
    expect(t('news.readTime', { count: 1 })).toBe('دقيقة قراءة');
    expect(t('news.readTime', { count: 2 })).toBe('دقيقتان قراءة');
    expect(t('news.readTime', { count: 3 })).toBe('3 دقائق قراءة');
    expect(t('news.readTime', { count: 11 })).toBe('11 دقيقة قراءة');
  });

  it('English has one and other', () => {
    const t = getFixedT('en');
    expect(t('news.readTime', { count: 1 })).toBe('1 minute read');
    expect(t('news.readTime', { count: 4 })).toBe('4 minute read');
  });
});

describe('createI18n', () => {
  it('makes an independent instance per call, so visitors never share a language', async () => {
    const first = createI18n('ar');
    const second = createI18n('en');
    expect(first.language).toBe('ar');
    expect(second.language).toBe('en');
    await second.changeLanguage('ar');
    expect(first.language).toBe('ar');
    await first.changeLanguage('en');
    expect(second.language).toBe('ar');
  });
});
