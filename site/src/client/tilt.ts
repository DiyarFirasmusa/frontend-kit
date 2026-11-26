import { all } from './dom.ts'

/**
 * A window leans toward the mouse pointer while it is over it, and settles back when the pointer leaves
 * (the CSS reads --rx and --ry). Only for a mouse, and not for a visitor who asked for less motion.
 */
export function initTilt(signal: AbortSignal): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover)').matches) return
  for (const element of all<HTMLElement>('[data-tilt]')) {
    let frame = 0
    let x = 0.5
    let y = 0.5
    const lean = (): void => {
      frame = 0
      element.style.setProperty('--rx', `${((0.5 - y) * 8).toFixed(2)}deg`)
      element.style.setProperty('--ry', `${((x - 0.5) * 10).toFixed(2)}deg`)
    }
    element.addEventListener(
      'pointermove',
      (event) => {
        if (event.pointerType !== 'mouse') return
        const box = element.getBoundingClientRect()
        x = (event.clientX - box.left) / box.width
        y = (event.clientY - box.top) / box.height
        if (!frame) frame = requestAnimationFrame(lean)
      },
      { passive: true, signal },
    )
    element.addEventListener(
      'pointerleave',
      () => {
        cancelAnimationFrame(frame)
        frame = 0
        element.style.setProperty('--rx', '0deg')
        element.style.setProperty('--ry', '0deg')
      },
      { signal },
    )
  }
}
