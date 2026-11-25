import { all } from './dom.ts'

/**
 * "What can you build": the three kinds sit one after another and the page scrolls freely past them.
 * Each kind plays its entrance the first time it is reached, and the small bar at the top marks the one
 * in view. Nothing holds the page still.
 */
export function initTabs(signal: AbortSignal): void {
  for (const root of all<HTMLElement>('[data-kinds]')) {
    const links = all<HTMLAnchorElement>('[data-kind-link]', root)
    const kinds = all<HTMLElement>('[data-kind]', root)
    root.classList.add('is-live')

    const mark = (at: number): void => {
      for (const [i, link] of links.entries()) {
        if (i === at) link.setAttribute('aria-current', 'true')
        else link.removeAttribute('aria-current')
      }
    }

    // A kind plays its entrance once, when a good part of it is on screen.
    const arrive = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (!isIntersecting) continue
          target.classList.add('is-seen')
          arrive.unobserve(target)
        }
      },
      { threshold: 0.35 },
    )

    // The kind crossing the middle of the screen is the one the bar marks.
    const spy = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (isIntersecting) mark(Number((target as HTMLElement).dataset['kind']))
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )

    for (const kind of kinds) {
      arrive.observe(kind)
      spy.observe(kind)
    }
    signal.addEventListener('abort', () => (arrive.disconnect(), spy.disconnect()))
  }
}
