import { all } from './dom.ts'

/** The session beside the steps plays along: each step read adds its lines. */
export function initExample(signal: AbortSignal): void {
  const example = document.querySelector<HTMLElement>('[data-example]')
  if (!example) return
  const steps = all<HTMLElement>('[data-step]', example)
  const groups = all<HTMLElement>('[data-shows]', example)
  example.classList.add('is-playing')

  const show = (at: number): void => {
    for (const step of steps) {
      const index = Number(step.dataset['step'])
      if (index === at) step.setAttribute('aria-current', 'step')
      else step.removeAttribute('aria-current')
    }
    for (const group of groups) {
      const index = Number(group.dataset['shows'])
      group.classList.toggle('is-shown', index <= at)
      group.classList.toggle('is-now', index === at)
    }
  }

  // A step counts once it crosses the middle of the screen.
  const watcher = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        if (isIntersecting) show(Number((target as HTMLElement).dataset['step']))
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  )
  for (const step of steps) watcher.observe(step)
  show(0)
  signal.addEventListener('abort', () => watcher.disconnect())
}
