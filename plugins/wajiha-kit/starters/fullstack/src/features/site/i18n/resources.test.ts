import { describe, expect, it } from 'vitest';
import { NAV } from '@/features/site/config/nav.config';
import { LOCALES } from '@/shared/lib/i18n/languages';
import { createSiteI18n as createI18n, getFixedT, resources } from './resources';

const keysOf = (locale: 'ar' | 'en'): string[] =>
  Object.entries(resources[locale].translation).flatMap(([group, values]) =>
    Object.keys(values).map((name) => `${group}.${name}`),
  );

describe('translation resources', () => {
  it('Arabic and English have exactly the same keys', () => {
    expect(keysOf('ar').toSorted()).toEqual(keysOf('en').toSorted());
  });

  it('every navigation label exists in both languages', () => {
    for (const locale of LOCALES) {
      const t = getFixedT(locale);
      for (const item of NAV) {
        expect(t(item.labelKey)).not.toBe(item.labelKey);
      }
    }
  });

  it('a missing key is never filled from the other language', () => {
    expect(getFixedT('ar')('nav.doesNotExist')).toBe('nav.doesNotExist');
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
