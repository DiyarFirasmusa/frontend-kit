import { all } from './dom.ts'

const calm = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Small interactions that explain, not decorate:
 * - the road of “how it works” follows the scroll: the step in the middle of the screen is current, and each step turns in;
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

  // The road: the step in the middle of the screen is the current one, and the road fills as far as you have scrolled.
  const path = document.querySelector<HTMLElement>('.path')
  if (!path) return
  const stops = all<HTMLElement>('.path-stop', path)
  if (stops.length === 0) return
  let current = -1
  const show = (index: number): void => {
    if (index === current) return
    current = index
    stops.forEach((stop, i) => {
      stop.classList.toggle('is-current', i === index)
      stop.classList.toggle('is-done', i < index)
      if (i === index) stop.setAttribute('aria-current', 'step')
      else stop.removeAttribute('aria-current')
    })
    path.style.setProperty('--current', String(index))
  }
  // A click also shows a step (and the step stays lit until the page is scrolled again).
  stops.forEach((stop, i) => stop.addEventListener('click', () => show(i), { signal }))

  const pins = stops.map((stop) => stop.querySelector<HTMLElement>('.road-pin'))
  const centre = (element: HTMLElement | null): number => {
    const box = element?.getBoundingClientRect()
    return box ? box.top + box.height / 2 : 0
  }
  let frame = 0
  const follow = (): void => {
    frame = 0
    const middle = innerHeight * 0.55
    let index = 0
    stops.forEach((stop, i) => {
      if (centre(pins[i] ?? stop) < middle) index = i
    })
    show(index)
    // The road runs from the first stop to the last; its lit part ends level with the middle of the screen.
    const top = path.getBoundingClientRect().top
    const first = centre(pins[0] ?? null)
    const last = centre(pins[pins.length - 1] ?? null)
    path.style.setProperty('--road-top', `${first - top}px`)
    path.style.setProperty('--road-length', `${Math.max(0, last - first)}px`)
    path.style.setProperty('--fill', String(Math.min(1, Math.max(0, (middle - first) / Math.max(1, last - first)))))
  }
  const soon = (): void => {
    if (!frame) frame = requestAnimationFrame(follow)
  }
  addEventListener('scroll', soon, { passive: true, signal })
  addEventListener('resize', soon, { passive: true, signal })
  follow()

  // Each step turns in from its side as it is scrolled to; for less motion it is simply there.
  if (calm()) {
    for (const stop of stops) stop.classList.add('is-in')
    signal.addEventListener('abort', () => cancelAnimationFrame(frame))
    return
  }
  path.classList.add('is-scrolly')
  const arrive = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue
        target.classList.add('is-in')
        arrive.unobserve(target)
      }
    },
    { threshold: 0.3 },
  )
  for (const stop of stops) arrive.observe(stop)
  signal.addEventListener('abort', () => {
    arrive.disconnect()
    cancelAnimationFrame(frame)
  })
}
