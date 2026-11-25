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
  // On a phone or a tablet the rail is not there: the same list opens from one line under the title.
  const mini = document.querySelector<HTMLDetailsElement>('[data-toc-mini]')
  const miniList = mini?.querySelector<HTMLOListElement>('[data-toc-mini-list]')
  if (mini && miniList) {
    miniList.replaceChildren(...[...list.children].map((item) => item.cloneNode(true)))
    mini.hidden = false
    miniList.addEventListener('click', () => (mini.open = false), { signal })
  }
  const links = all<HTMLAnchorElement>('a', list)

  // A skill group the finder hides takes its line in the list with it, so no link jumps to a hidden part.
  const groups = parts.filter((part) => part.hasAttribute('data-finder-group'))
  if (groups.length) {
    const lists = [list, ...(miniList ? [miniList] : [])]
    const match = (): void => {
      parts.forEach((part, i) => {
        for (const each of lists) {
          const item = each.children[i] as HTMLElement | undefined
          if (item) item.hidden = part.hidden
        }
      })
    }
    const groupWatcher = new MutationObserver(match)
    for (const group of groups) groupWatcher.observe(group, { attributes: true, attributeFilter: ['hidden'] })
    signal.addEventListener('abort', () => groupWatcher.disconnect())
    match()
  }

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
  const atEnd = (): void => {
    if (innerHeight + scrollY < document.documentElement.scrollHeight - 4) return
    const last = links.length - 1
    links.forEach((link, i) => {
      if (i === last) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
      link.toggleAttribute('data-passed', i < last)
    })
    toc.style.setProperty('--reached', String((last + 0.5) / links.length))
  }
  addEventListener('scroll', atEnd, { passive: true, signal })
  signal.addEventListener('abort', () => watcher.disconnect())
}
