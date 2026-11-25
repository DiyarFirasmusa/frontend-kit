// One list drives the header, the footer and the sitemap, so a page cannot be in the menu
// and missing from the sitemap. `path` is language-free: the locale prefix is added by the code that uses it.
// `to` is the matching route id, kept next to it so links stay type-checked.
export type NavItem = {
  id: 'home' | 'about' | 'services' | 'news' | 'contact';
  /** '' is the language root (/ar). Otherwise a lowercase kebab-case path starting with "/". */
  path: '' | '/about' | '/services' | '/news' | '/contact';
  to: '/$locale' | '/$locale/about' | '/$locale/services' | '/$locale/news' | '/$locale/contact';
  labelKey: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
};

export const NAV: readonly NavItem[] = [
  { id: 'home', path: '', to: '/$locale', labelKey: 'nav.home', changefreq: 'weekly', priority: 1 },
  {
    id: 'about',
    path: '/about',
    to: '/$locale/about',
    labelKey: 'nav.about',
    changefreq: 'monthly',
    priority: 0.7,
  },
  {
    id: 'services',
    path: '/services',
    to: '/$locale/services',
    labelKey: 'nav.services',
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    id: 'news',
    path: '/news',
    to: '/$locale/news',
    labelKey: 'nav.news',
    changefreq: 'weekly',
    priority: 0.7,
  },
  {
    id: 'contact',
    path: '/contact',
    to: '/$locale/contact',
    labelKey: 'nav.contact',
    changefreq: 'yearly',
    priority: 0.6,
  },
];
