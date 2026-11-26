import { all } from './dom.ts'

/** The site's own addresses: a link to any of them stays in this tab. */
const own = new Set(['wajihakit.com', 'www.wajihakit.com'])

/**
 * A link that leaves the site (GitHub, the Claude download, other people's pages) opens in a new tab, so the visitor
 * never loses their place in the guide. `noopener` keeps the other page from reaching this one.
 */
export function initExternalLinks(): void {
  for (const link of all<HTMLAnchorElement>('a[href^="http"]')) {
    if (link.target || link.hostname === location.hostname || own.has(link.hostname)) continue
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
  }
}
