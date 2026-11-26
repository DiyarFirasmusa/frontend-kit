import { describe, expect, it } from 'vitest';
import {
  ALLOWED_ADMIN_SOURCES,
  forbiddenSources,
  normalizeSource,
  pagePath,
  sitemapPaths,
} from './bundle-sources.ts';

describe('forbiddenSources', () => {
  it('lets the public site, shared code and the allow-listed admin helpers through', () => {
    const clean = [
      '../../../src/features/site/about/index.tsx',
      '../../../src/shared/lib/seo/seo.ts',
      '../../../src/components/common/container.tsx',
      '../../node_modules/react/index.js',
      '../../node_modules/zod/v4/core/schemas.js',
      ...ALLOWED_ADMIN_SOURCES.map((source) => `../../../${source}`),
    ];
    expect(forbiddenSources(clean)).toEqual([]);
  });

  it('flags admin feature files that are not on the allow-list, whatever the chunk is called', () => {
    const leaked = [
      '../../../src/features/admin/suppliers/supplier-columns.tsx',
      '../../../src/features/admin/suppliers/validations.ts',
      '../../../src/features/admin/store/auth-store.ts',
    ];
    expect(forbiddenSources(leaked)).toEqual([
      'src/features/admin/suppliers/supplier-columns.tsx',
      'src/features/admin/suppliers/validations.ts',
      'src/features/admin/store/auth-store.ts',
    ]);
  });

  it('flags the admin-only UI folders but not src/components/common', () => {
    expect(
      forbiddenSources([
        '../../../src/components/table/data-table.tsx',
        '../../../src/components/dialog/form-dialog.tsx',
        '../../../src/components/fields/text-field.tsx',
        '../../../src/components/ui/dropdown-menu.tsx',
        '../../../src/components/common/container.tsx',
      ]),
    ).toHaveLength(4);
  });

  it('flags the admin packages, also from a nested node_modules', () => {
    expect(
      forbiddenSources([
        '../../node_modules/axios/lib/core/AxiosError.js',
        '../../node_modules/@tanstack/query-core/build/modern/retryer.js',
        '../../node_modules/@tanstack/react-query/build/modern/useQuery.js',
        '../../node_modules/msw/lib/browser/index.mjs',
        '../../node_modules/.pnpm/axios@1.0.0/node_modules/axios/index.js',
        '../../node_modules/@tanstack/react-router/dist/esm/router.js',
      ]),
    ).toHaveLength(5);
  });

  it('takes the allow-list as a parameter, so an extra file must be named on purpose', () => {
    const source = '../../../src/features/admin/layout/admin-shell.tsx';
    expect(forbiddenSources([source])).toHaveLength(1);
    expect(forbiddenSources([source], ['src/features/admin/layout/admin-shell.tsx'])).toEqual([]);
  });
});

describe('normalizeSource', () => {
  it('cuts the relative prefix and a query string', () => {
    expect(normalizeSource('../../../src/routes/$locale/about.tsx?tsr-split=component')).toBe(
      'src/routes/$locale/about.tsx',
    );
    expect(normalizeSource('../../node_modules/axios/index.js')).toBe(
      'node_modules/axios/index.js',
    );
  });
});

describe('sitemapPaths and pagePath', () => {
  it('lists the path of every <loc>, once', () => {
    const xml =
      '<urlset><url><loc>https://example.com/ar</loc></url><url><loc>https://example.com/en/news/a-b</loc></url>' +
      '<url><loc>https://example.com/ar</loc></url></urlset>';
    expect(sitemapPaths(xml)).toEqual(['/ar', '/en/news/a-b']);
  });

  it('turns a path into its language-free page path', () => {
    expect(pagePath('/ar')).toBe('/');
    expect(pagePath('/en/contact')).toBe('/contact');
    expect(pagePath('/ar/news/some-slug')).toBe('/news/some-slug');
    expect(pagePath('/arabic')).toBe('/arabic');
  });
});
