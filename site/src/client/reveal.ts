import { all } from './dom.ts'

/**
 * The parts of a page arrive as the visitor reaches them: a short rise and fade, once. Only what is still below the fold
 * when the page loads is marked, so nothing in view is ever hidden first, and nothing is hidden at all for a visitor who
 * asked for less motion (or when the script does not run).
 */
const targets = [
  // The road of "how it works" brings in its own steps as they are scrolled to (board-life.ts).
  'main.home > section:not(#intro, #example) > .column',
  'main.doc .doc-article > section.block',
  'main.doc .doc-article > .finder',
  'main.doc .doc-article > .pager',
  '.foot-columns',
].join(',')

export function initReveal(signal: AbortSignal): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const fold = innerHeight * 0.92
  const below = all<HTMLElement>(targets).filter((element) => element.getBoundingClientRect().top > fold)
  if (below.length === 0) return
  const watcher = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue
        target.classList.add('is-seen')
        watcher.unobserve(target)
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
  )
  for (const element of below) {
    element.setAttribute('data-reveal', '')
    watcher.observe(element)
  }
  signal.addEventListener('abort', () => watcher.disconnect())
}
