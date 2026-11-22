import { all, required } from './dom.ts'

/** The line the visitor reads along, as a share of the screen's height. */
const READING_LINE = 0.55

/** Says which chapter this is, how far through it, and what comes next. */
export function initGuideBar(): void {
  const bar = document.querySelector<HTMLElement>('[data-guide-bar]')
  if (!bar) return
  const links = all<HTMLAnchorElement>('[data-chapter-link]', bar)
  const name = required<HTMLElement>('[data-chapter-name]', bar)
  const count = required<HTMLElement>('[data-chapter-count]', bar)
  const next = required<HTMLAnchorElement>('[data-chapter-next]', bar)
  const nextName = required<HTMLElement>('[data-chapter-next-name]', bar)
  const starts = all<HTMLElement>('[data-chapter]')
  const counted = new Map(starts.map((start) => [start, all<HTMLElement>('[data-count]', start)]))
  let queued = false

  const update = (): void => {
    queued = false
    const line = innerHeight * READING_LINE
    let current = 0
    starts.forEach((start, i) => {
      if (start.getBoundingClientRect().top <= line) current = i
    })
    links.forEach((link, i) => {
      link.classList.toggle('is-past', i < current)
      if (i === current) link.setAttribute('aria-current', 'step')
      else link.removeAttribute('aria-current')
    })
    name.textContent = links[current]?.title ?? ''

    const items = counted.get(starts[current]!) ?? []
    let reached = 0
    for (const item of items) {
      if (item.getBoundingClientRect().top > line) break
      reached++
    }
    count.textContent = reached > 0 ? `${reached} / ${items.length}` : `${current + 1} / ${links.length}`

    const after = links[current + 1]
    next.hidden = !after
    if (after) {
      next.setAttribute('href', after.hash)
      nextName.textContent = after.title
    }
  }
  const request = (): void => {
    if (queued) return
    queued = true
    requestAnimationFrame(update)
  }
  addEventListener('scroll', request, { passive: true })
  addEventListener('resize', request)
  update()
}
