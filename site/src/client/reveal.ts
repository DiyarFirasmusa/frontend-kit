import { all } from './dom.ts'

/**
 * Motion tied to the scroll, like the road of "how it works": a part rises and comes into focus as far as it has come up
 * the screen, and goes back if you scroll back. Nothing is triggered once; everything follows the scroll.
 * - rise: the parts of a page come up and sharpen (section titles, boards, the guide's blocks, the footer);
 * - flip: the "start" window turns in from its side;
 * - leave: the opening screen's window leans back a little as you scroll away from it.
 * For a visitor who asked for less motion nothing is marked, so nothing moves.
 */
const kinds: [string, string][] = [
  ['main.home > section:not(#intro, #example, #get) > .column', 'rise'],
  ['main.home #get > .section-head', 'rise'],
  ['main.home #get .gets-item', 'rise'],
  ['main.home #install .start-window', 'flip'],
  ['main.home #intro .hero-side', 'leave'],
  ['main.doc .doc-article > section.block', 'rise'],
  ['main.doc .doc-article > .finder', 'rise'],
  ['main.doc .doc-article > .pager', 'rise'],
  ['.foot-columns', 'rise'],
]

export function initReveal(signal: AbortSignal): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const parts: HTMLElement[] = []
  for (const [selector, kind] of kinds) {
    for (const element of all<HTMLElement>(selector)) {
      element.dataset['scroll'] = kind
      parts.push(element)
    }
  }
  if (parts.length === 0) return

  let frame = 0
  const follow = (): void => {
    frame = 0
    const height = innerHeight
    // How much more the page can scroll: a part near the end of the page must still reach 1 when the page is at its end.
    const left = Math.max(0, document.documentElement.scrollHeight - height - scrollY)
    for (const part of parts) {
      if (part.dataset['scroll'] === 'leave') {
        // 0 at the top of the page, 1 once the opening screen is mostly scrolled away.
        part.style.setProperty('--q', Math.min(1, Math.max(0, scrollY / (height * 0.9))).toFixed(3))
        continue
      }
      const top = part.getBoundingClientRect().top
      // 0 when its top reaches the bottom edge of the screen, 1 once it is a little above the middle (or, near the end of
      // the page, once the page cannot scroll any further).
      const done = Math.max(height * 0.45, top - left)
      const rise = Math.min(1, Math.max(0, (height - top) / Math.max(1, height - done)))
      part.style.setProperty('--p', (1 - (1 - rise) ** 2).toFixed(3))
    }
  }
  const soon = (): void => {
    if (!frame) frame = requestAnimationFrame(follow)
  }
  addEventListener('scroll', soon, { passive: true, signal })
  addEventListener('resize', soon, { passive: true, signal })
  follow()
  signal.addEventListener('abort', () => cancelAnimationFrame(frame))
}
