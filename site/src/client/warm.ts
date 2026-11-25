import { prefetch } from 'astro:prefetch'

/** How many pages the home page prepares ahead, so a slow phone is not kept busy. */
const MOST = 4

type Deadline = { timeRemaining: () => number; didTimeout?: boolean }
type Idle = (callback: (deadline: Deadline) => void, options?: { timeout: number }) => number
const whenIdle: Idle =
  (globalThis as { requestIdleCallback?: Idle }).requestIdleCallback ??
  ((callback) => window.setTimeout(() => callback({ timeRemaining: () => 8 }), 200))

/**
 * While the home page is open and the browser has nothing else to do, the pages it links to are fetched
 * one at a time in its idle moments: the guide first, then the rest. When the visitor clicks, the page is
 * already there. Nothing is fetched on a data-saving or very slow connection.
 */
export function warmPages(signal: AbortSignal): void {
  if (!document.querySelector('main.home')) return
  const connection = (navigator as { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  // Only on a fast connection: a phone on 3G keeps its data, and hover still prepares a page before a click.
  if (connection?.saveData || (connection?.effectiveType && connection.effectiveType !== '4g')) return

  const here = location.pathname
  const seen = new Set<string>()
  const queue: string[] = []
  for (const link of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    const url = new URL(link.href, location.href)
    if (url.origin !== location.origin || url.pathname === here || link.hasAttribute('data-astro-reload')) continue
    if (seen.has(url.pathname)) continue
    seen.add(url.pathname)
    queue.push(url.pathname)
  }
  // Only the likely next pages: the guide, getting started and the questions.
  const likely = /\/(docs|get-started|questions)\/$/
  queue.splice(0, queue.length, ...queue.filter((path) => likely.test(path)))
  queue.splice(MOST)

  const next = (): void => {
    if (signal.aborted || queue.length === 0) return
    whenIdle(
      (deadline) => {
        if (signal.aborted) return
        // A fetch starts when the browser has a moment to spare, or when it has waited long enough for one.
        if (deadline.didTimeout || deadline.timeRemaining() > 4) prefetch(queue.shift()!)
        next()
      },
      { timeout: 4000 },
    )
  }

  // Start after the page has settled, so the opening screen gets the network first.
  if (document.readyState === 'complete') whenIdle(next)
  else addEventListener('load', () => whenIdle(next), { once: true, signal })
}
