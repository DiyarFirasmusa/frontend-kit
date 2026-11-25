import { all } from './dom.ts'

/** The three steps to start: pressing or pointing at a step shows its screen in the Claude window beside it. */
export function initStartSteps(signal: AbortSignal): void {
  for (const root of all<HTMLElement>('[data-start]')) {
    const picks = all<HTMLButtonElement>('[data-start-pick]', root)
    const screens = all<HTMLElement>('[data-start-screen]', root)
    root.classList.add('is-live')

    const show = (at: number): void => {
      for (const [i, pick] of picks.entries()) pick.setAttribute('aria-pressed', String(i === at))
      for (const [i, screen] of screens.entries()) screen.toggleAttribute('data-hidden', i !== at)
    }

    for (const [i, pick] of picks.entries()) {
      pick.addEventListener('click', () => show(i), { signal })
      pick.addEventListener('pointerenter', () => show(i), { signal })
      pick.addEventListener('focus', () => show(i), { signal })
    }
  }
}
