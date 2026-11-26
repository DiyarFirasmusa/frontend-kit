// Which modules may a PUBLIC page load? The rule behind "npm run check:bundle", kept free of file and
// network access so a unit test can try it (bundle-sources.test.ts). Node strips the types: erasable syntax only.
//
// The check reads the source map of every script a public page loads (a build made with
// "npm run build:proof") and lists the modules inside it. A chunk NAME or a text marker can be fooled (a
// leaked chunk called "validations-*" passed the old check); the list of source files cannot.

/** Code that belongs to the admin: its feature folder and the UI folders only the admin uses. */
const ADMIN_SOURCE = /(?:^|\/)src\/(?:features\/admin|components\/(?:table|dialog|fields|ui))\//;

/** Packages the admin (and its mock) owns. The public site never bundles them. */
const ADMIN_PACKAGE = /node_modules\/(?:axios|@tanstack\/(?:react-)?query[^/]*|@mswjs|msw)\//;

/**
 * The few admin files that are MEANT to be in the public graph: tiny, import-free (see their file
 * headers). Anything else under the admin folders on a public page fails the check. Add a file here only
 * on purpose, in the same commit that explains why.
 */
export const ALLOWED_ADMIN_SOURCES: readonly string[] = [
  // The route files import these statically (routing.md): a loading text, the suppliers URL parser,
  // the head() helper and the permission names.
  'src/features/admin/layout/admin-loading.tsx',
  'src/features/admin/layout/admin-head.ts',
  'src/features/admin/suppliers/supplier-search.ts',
  'src/features/admin/constants/permissions.ts',
];

/** "../../../src/a/b.ts" -> "src/a/b.ts"; a package path keeps its node_modules/ part. */
export function normalizeSource(source: string): string {
  const cleaned = source.split('?')[0] ?? source;
  const node = cleaned.lastIndexOf('node_modules/');
  if (node >= 0) {
    return cleaned.slice(node);
  }
  const src = cleaned.indexOf('src/');
  return src >= 0 ? cleaned.slice(src) : cleaned;
}

/** The sources of one chunk that must not be on a public page (empty = clean). */
export function forbiddenSources(
  sources: readonly string[],
  allowed: readonly string[] = ALLOWED_ADMIN_SOURCES,
): string[] {
  const bad: string[] = [];
  for (const raw of sources) {
    const source = normalizeSource(raw);
    if (ADMIN_PACKAGE.test(source) || (ADMIN_SOURCE.test(source) && !allowed.includes(source))) {
      bad.push(source);
    }
  }
  return bad;
}

/** The <loc> paths of a sitemap with the origin cut off: "https://example.com/ar/news" -> "/ar/news". */
export function sitemapPaths(xml: string): string[] {
  const paths = new Set<string>();
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    try {
      paths.add(new URL(match[1] ?? '', 'http://x.invalid').pathname);
    } catch {
      // A malformed <loc> is the sitemap's own test to catch, not this one.
    }
  }
  return [...paths];
}

/** "/ar/news/some-slug" -> "/news/some-slug" (the language-free page path); "/ar" -> "/". */
export function pagePath(path: string): string {
  return path.replace(/^\/(?:ar|en)(?=\/|$)/, '') || '/';
}
