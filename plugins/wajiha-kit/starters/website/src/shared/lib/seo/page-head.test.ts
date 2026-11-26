import { describe, expect, it } from 'vitest';
import { getFixedT } from '@/shared/lib/i18n/create-i18n';
import { LOCALES } from '@/shared/lib/i18n/languages';
import { pageHead } from './page-head';

describe('pageHead', () => {
  it('builds title, description, canonical and a Home > page breadcrumb from the NAV entry', () => {
    for (const locale of LOCALES) {
      const t = getFixedT(locale);
      const head = pageHead(locale, '/$locale/about');
      expect(head.meta).toContainEqual({
        name: 'description',
        content: t('about.metaDescription'),
      });
      const title = head.meta.find((entry) => 'title' in entry);
      expect(title && 'title' in title ? title.title : '').toContain(t('about.metaTitle'));
      expect(head.links).toContainEqual({
        rel: 'canonical',
        href: `https://example.test/${locale}/about`,
      });
      const breadcrumb = head.scripts.map((script) => script.children).join('');
      expect(breadcrumb).toContain('BreadcrumbList');
      expect(breadcrumb).toContain(t('nav.home'));
      expect(breadcrumb).toContain(t('nav.about'));
    }
  });

  it('the other plain pages get a head too', () => {
    for (const to of ['/$locale/services', '/$locale/news', '/$locale/contact'] as const) {
      expect(pageHead('en', to).meta.length).toBeGreaterThan(5);
    }
  });
});
