import { all } from './dom.ts'

/** "On this page": the parts of a guide page, built from its headings, with the one being read lit. */
export function initToc(signal: AbortSignal): void {
  const toc = document.querySelector<HTMLElement>('[data-toc]')
  const list = toc?.querySelector<HTMLOListElement>('[data-toc-list]')
  if (!toc || !list) return
  const parts = all<HTMLElement>('.doc-article > .block[id]').filter((part) => part.querySelector('h2'))
  if (parts.length < 2) return

  list.replaceChildren(
    ...parts.map((part) => {
      const item = document.createElement('li')
      const link = document.createElement('a')
      link.href = `#${part.id}`
      link.textContent = part.querySelector('h2')!.firstChild?.textContent?.trim() ?? ''
      item.append(link)
      return item
    }),
  )
  toc.hidden = false
  const links = all<HTMLAnchorElement>('a', list)

  const watcher = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue
        const at = links.findIndex((link) => link.hash === `#${target.id}`)
        links.forEach((link, i) => {
          if (i === at) link.setAttribute('aria-current', 'location')
          else link.removeAttribute('aria-current')
          link.toggleAttribute('data-passed', i < at)
        })
        toc.style.setProperty('--reached', String((at + 0.5) / links.length))
      }
    },
    { rootMargin: '-20% 0px -70% 0px' },
  )
  for (const part of parts) watcher.observe(part)
  signal.addEventListener('abort', () => watcher.disconnect())
}
