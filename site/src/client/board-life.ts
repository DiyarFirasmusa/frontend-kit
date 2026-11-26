import { all } from './dom.ts'

const calm = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Small interactions that explain, not decorate:
 * - the journey lights one step at a time while it is on screen; hover, focus or a click chooses a step and stops the turn;
 * - a board wakes (its lit block pulses once) the first time it is seen;
 * - rows of a side column light up in turn as the board arrives.
 */
export function initBoardLife(signal: AbortSignal): void {
  // Boards wake once when they come into view.
  const boards = all<HTMLElement>('.board')
  if (boards.length > 0) {
    const waker = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (!isIntersecting) continue
          target.classList.add('is-awake')
          waker.unobserve(target)
        }
      },
      { threshold: 0.3 },
    )
    for (const board of boards) calm() ? board.classList.add('is-awake') : waker.observe(board)
    signal.addEventListener('abort', () => waker.disconnect())
  }

  // The journey: one current step.
  const path = document.querySelector<HTMLElement>('.path')
  if (!path) return
  const root = document.documentElement
  const stops = all<HTMLElement>('.path-stop', path)
  const turn = 3600 // a screen to read takes longer than a drawing
  if (stops.length === 0) return
  let current = -1
  let chosen = false // a step chosen by a click stays; hover only holds the turn while the pointer is on it
  let hovering = false
  let held = false
  let visible = false
  const show = (index: number): void => {
    current = index
    stops.forEach((stop, i) => {
      stop.classList.toggle('is-current', i === index)
      stop.classList.toggle('is-done', i < index)
      if (i === index) stop.setAttribute('aria-current', 'step')
      else stop.removeAttribute('aria-current')
    })
    path.style.setProperty('--current', String(index))
  }
  stops.forEach((stop, i) => {
    stop.addEventListener(
      'pointerenter',
      (event) => {
        if (event.pointerType === 'touch') return
        hovering = true
        show(i)
      },
      { signal },
    )
    stop.addEventListener(
      'click',
      () => {
        chosen = true
        show(i)
      },
      { signal },
    )
  })
  path.addEventListener('pointerleave', () => (hovering = false), { signal })
  show(0)
  if (calm()) return
  const watcher = new IntersectionObserver(([entry]) => (visible = Boolean(entry?.isIntersecting)), { threshold: 0.4 })
  watcher.observe(path)
  const timer = setInterval(() => {
    // The opening screen's pause button stops every moving thing on the page.
    if (!visible || chosen || hovering || document.hidden || root.classList.contains('is-paused')) return
    // The finished project stays on screen for one more turn before the story starts again.
    if (current === stops.length - 1 && !held) {
      held = true
      return
    }
    held = false
    show((current + 1) % stops.length)
  }, turn)
  signal.addEventListener('abort', () => (watcher.disconnect(), clearInterval(timer)))
}
