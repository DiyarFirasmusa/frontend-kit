import { all } from './dom.ts'

const calm = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The steps beside the chat play by themselves once the section is seen: each step lights up,
 * its bar fills, and the chat shows what happens in it. Pressing a step jumps to it.
 * Nothing depends on scrolling, so the page reads the same however fast you move.
 */
export function initExample(signal: AbortSignal): void {
  const example = document.querySelector<HTMLElement>('[data-example]')
  if (!example || calm()) return
  const steps = all<HTMLElement>('[data-step]', example)
  const groups = all<HTMLElement>('[data-shows]', example)
  const body = example.querySelector<HTMLElement>('[data-body]')
  const status = example.querySelector<HTMLElement>('[data-status]')
  if (!body || steps.length === 0) return
  example.classList.add('is-playing')

  let seen = false
  let run = 0

  // Waits, but holds still while the section is off screen, and gives up when a newer run starts.
  const wait = (ms: number, mine: number): Promise<boolean> =>
    new Promise((resolve) => {
      let left = ms
      const tick = (): void => {
        if (signal.aborted || mine !== run) return resolve(false)
        if (seen) left -= 100
        if (left <= 0) return resolve(true)
        setTimeout(tick, 100)
      }
      setTimeout(tick, 100)
    })

  const follow = (): void => body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' })

  const lengthOf = (group: HTMLElement): number =>
    all<HTMLElement>('[data-ev]', group).reduce((sum, event) => sum + (event.dataset['ev'] === 'ask' ? 2300 : 900), 1800)

  const play = async (from: number): Promise<void> => {
    const mine = ++run
    for (let at = from; ; at = (at + 1) % steps.length) {
      // Earlier steps stay done, later ones wait, this one plays.
      for (const [i, step] of steps.entries()) {
        step.classList.toggle('is-done', i < at)
        step.classList.remove('is-now')
        if (i === at) step.setAttribute('aria-current', 'step')
        else step.removeAttribute('aria-current')
      }
      for (const [i, group] of groups.entries()) {
        group.classList.toggle('is-shown', i <= at)
        for (const event of all<HTMLElement>('[data-ev]', group)) {
          event.classList.toggle('is-in', i < at)
          event.classList.toggle('is-picked', i < at)
        }
      }
      const step = steps[at]!
      const group = groups[at]
      step.style.setProperty('--step-time', `${group ? lengthOf(group) : 3000}ms`)
      void step.offsetWidth
      step.classList.add('is-now')
      if (at === 0) body.scrollTop = 0
      follow()

      for (const event of group ? all<HTMLElement>('[data-ev]', group) : []) {
        const kind = event.dataset['ev']
        if (kind !== 'user' && status) {
          status.hidden = false
          follow()
        }
        if (!(await wait(kind === 'user' ? 500 : 700, mine))) return
        if (status) status.hidden = true
        event.classList.add('is-in')
        follow()
        if (kind === 'ask') {
          if (!(await wait(1300, mine))) return
          event.classList.add('is-picked')
          if (!(await wait(300, mine))) return
        } else if (!(await wait(200, mine))) return
      }
      if (!(await wait(1800, mine))) return
    }
  }

  for (const [i, step] of steps.entries()) {
    step.querySelector('[data-jump]')?.addEventListener('click', () => void play(i), { signal })
  }

  const watcher = new IntersectionObserver(
    ([entry]) => {
      seen = Boolean(entry?.isIntersecting)
      if (seen && run === 0) void play(0)
    },
    { threshold: 0.3 },
  )
  watcher.observe(example)
  signal.addEventListener('abort', () => watcher.disconnect())
}
