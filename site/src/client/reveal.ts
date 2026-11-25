import { all } from './dom.ts'

/** What arrives as it is scrolled to. The words of a scored cue have their own timing and are not here. */
const ARRIVING = [
  '.doc-article .block > *',
  '.doc-article .rows > div',
  '.doc-article .index li',
  '.doc-article :is(.ticks, .crosses, .numbered, .tags, .timeline, .recipes, .cards) > li',
  '.doc-article .glance > div',
  '.doc-article .source-doc > *',
  '.section-head > *',
  '.example-head > *',
  '.journey-card',
  '.show',
  '.start-panel > *',
  '.points li',
  '.start-cases li',
  '.kinds',
  '.inside-body',
  '.get-it :is(.install-steps, .works-for, .fit)',
  '.get-it-title',
  '.foot > *',
].join(',')
const STAGGER_MS = 55
const MOST_STAGGERED = 9

/** Nothing on the page just sits there: each piece arrives as it is reached. */
export function initReveal(signal: AbortSignal): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const watcher = new IntersectionObserver(
    (entries) => {
      let order = 0
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue
        const element = target as HTMLElement
        element.style.setProperty('--arrive-after', `${Math.min(order++, MOST_STAGGERED) * STAGGER_MS}ms`)
        element.classList.add('has-arrived')
        watcher.unobserve(element)
      }
    },
    { rootMargin: '0px 0px -4% 0px' },
  )
  for (const element of all<HTMLElement>(ARRIVING)) {
    element.classList.add('arrives')
    watcher.observe(element)
  }
  signal.addEventListener('abort', () => watcher.disconnect())
}
