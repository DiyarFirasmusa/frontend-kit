import { all } from './dom.ts'

/**
 * The guide pages follow the reader: the part you are reading now is marked .is-reading, so its title lights
 * (the CSS is in docs/live.css). It follows the scroll and goes back when you scroll back. (How far you have read is
 * the header's progress line, page-chrome.ts.)
 */
export function initLive(signal: AbortSignal): void {
  const blocks = all<HTMLElement>('main.doc .doc-article > section.block')
  if (blocks.length === 0) return

  let frame = 0
  let reading: HTMLElement | undefined
  const follow = (): void => {
    frame = 0
    const room = document.documentElement.scrollHeight - innerHeight
    // The part whose top has passed a third of the screen last; at the very end of the page, the last part.
    const line = innerHeight * 0.33
    let now: HTMLElement | undefined
    for (const block of blocks) if (block.getBoundingClientRect().top <= line) now = block
    if (room > 0 && scrollY >= room - 2) now = blocks.at(-1)
    now ??= blocks[0]
    if (now !== reading) {
      reading?.classList.remove('is-reading')
      now?.classList.add('is-reading')
      reading = now
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
