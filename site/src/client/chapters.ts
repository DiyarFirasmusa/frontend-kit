import { chapterAt } from '../scene/timeline.ts'

/** Repaints the page in the colour of the chapter in view and marks it in the header. */
export function initChapters(chapters: HTMLElement[]): void {
  const root = document.documentElement
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav]')]
  let queued = false

  const update = (): void => {
    queued = false
    const index = Math.round(chapterAt(chapters.map((c) => c.getBoundingClientRect().top), innerHeight))
    const chapter = chapters[index]
    if (!chapter) return
    root.dataset.world = chapter.dataset.world
    const scrollable = root.scrollHeight - innerHeight
    root.style.setProperty('--read', String(scrollable > 0 ? scrollY / scrollable : 0))
    for (const link of links) {
      if (link.hash === `#${chapter.id}`) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    }
  }
  const request = (): void => {
    if (queued) return
    queued = true
    requestAnimationFrame(update)
  }

  addEventListener('scroll', request, { passive: true })
  addEventListener('resize', request)
  document.addEventListener('kit:redraw', request)
  update()
}
