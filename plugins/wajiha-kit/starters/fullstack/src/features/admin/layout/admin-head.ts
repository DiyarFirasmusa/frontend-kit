import type { i18n as I18n } from 'i18next';

// Imports nothing but a type: the route files use this and they are part of the public entry chunk.

/**
 * The document title of an admin page: "<page> | <admin name>" in the page's language. Every admin route
 * sets one (WCAG 2.4.2), and the route announcer reads it after a page change.
 * Use in a route: head: adminHead('suppliers.title').
 */
export function adminHead(titleKey: string) {
  return ({ match }: { match: { context: { i18n: I18n } } }) => {
    const { i18n } = match.context;
    return { meta: [{ title: `${i18n.t(titleKey)} | ${i18n.t('admin.title')}` }] };
  };
}
