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
  const stops = all<HTMLElement>('.path-stop', path)
  if (stops.length === 0) return
  let current = -1
  let chosen = false
  let visible = false
  const show = (index: number): void => {
    current = index
    stops.forEach((stop, i) => {
      stop.classList.toggle('is-current', i === index)
      stop.classList.toggle('is-done', i < index)
    })
    path.style.setProperty('--current', String(index))
  }
  const choose = (index: number): void => {
    chosen = true
    show(index)
  }
  stops.forEach((stop, i) => {
    stop.tabIndex = 0
    stop.addEventListener('pointerenter', () => choose(i), { signal })
    stop.addEventListener('focus', () => choose(i), { signal })
    stop.addEventListener('click', () => choose(i), { signal })
  })
  path.addEventListener('pointerleave', () => (chosen = false), { signal })
  path.addEventListener('focusout', () => (chosen = false), { signal })
  show(0)
  if (calm()) return
  const watcher = new IntersectionObserver(([entry]) => (visible = Boolean(entry?.isIntersecting)), { threshold: 0.4 })
  watcher.observe(path)
  const timer = setInterval(() => {
    if (!visible || chosen || document.hidden) return
    show((current + 1) % stops.length)
  }, 2600)
  signal.addEventListener('abort', () => (watcher.disconnect(), clearInterval(timer)))
}
