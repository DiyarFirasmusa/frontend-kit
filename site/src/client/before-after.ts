import { all } from './dom.ts'

/** The before-and-after frame: the range under it moves the line; a first small sweep shows it can move. */
export function initBeforeAfter(signal: AbortSignal): void {
  for (const frame of all<HTMLElement>('[data-ba]')) {
    const range = frame.querySelector<HTMLInputElement>('[data-ba-range]')
    if (!range) continue
    const rtl = getComputedStyle(frame).direction === 'rtl'
    const set = (value: number): void => frame.style.setProperty('--pos', `${rtl ? 100 - value : value}%`)
    range.addEventListener('input', () => set(Number(range.value)), { signal })
    set(Number(range.value))

    // Once, when it is first seen: the line moves a little each way, so people know they can drag it.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) continue
    const watcher = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        watcher.disconnect()
        frame.classList.add('is-hinting')
        setTimeout(() => frame.classList.remove('is-hinting'), 2400)
      },
      { threshold: 0.5 },
    )
    watcher.observe(frame)
    signal.addEventListener('abort', () => watcher.disconnect())
  }
}
