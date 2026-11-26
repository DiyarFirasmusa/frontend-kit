/**
 * The page answers the pointer:
 * - the faint grid under the page lights up in orange around a mouse pointer (the grid is the site's own mark);
 * - every press on something pressable sends out a ring from the exact spot: orange for what you do (buttons, tabs,
 *   disclosures), turquoise for a place you go (links).
 * Nothing runs for a visitor who asked for less motion, and the grid light never follows a finger.
 */
const pressable = 'a[href], button, summary, [role="tab"], label[for], .hero-start, .note-cta'

export function initPointer(signal: AbortSignal): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const root = document.documentElement

  let frame = 0
  let x = 0
  let y = 0
  const paint = (): void => {
    frame = 0
    root.style.setProperty('--px', `${x}px`)
    root.style.setProperty('--py', `${y}px`)
  }
  document.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return
      x = event.clientX
      y = event.clientY
      root.classList.add('has-pointer')
      if (!frame) frame = requestAnimationFrame(paint)
    },
    { passive: true, signal },
  )
  document.documentElement.addEventListener('pointerleave', () => root.classList.remove('has-pointer'), { signal })

  document.addEventListener(
    'pointerdown',
    (event) => {
      if (event.button !== 0 || !(event.target instanceof Element)) return
      const target = event.target.closest<HTMLElement>(pressable)
      if (!target || target.matches(':disabled, [aria-disabled="true"]')) return
      const ring = document.createElement('span')
      ring.className = target.matches('a[href]:not(.hero-start, .note-cta, .top-install)') ? 'press-ring is-go' : 'press-ring'
      ring.style.left = `${event.clientX}px`
      ring.style.top = `${event.clientY}px`
      ring.setAttribute('aria-hidden', 'true')
      ring.addEventListener('animationend', () => ring.remove(), { once: true })
      document.body.append(ring)
    },
    { passive: true, signal },
  )
  signal.addEventListener('abort', () => {
    if (frame) cancelAnimationFrame(frame)
    root.classList.remove('has-pointer')
    for (const ring of document.querySelectorAll('.press-ring')) ring.remove()
  })
}
