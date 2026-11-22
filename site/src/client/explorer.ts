import { all, required } from './dom.ts'
import { cueStage } from './stage/host.ts'

const NARROW = 820

/** Press a name and it is explained in place; the stage turns to it. */
export function initExplorer(): void {
  const explorer = document.querySelector<HTMLElement>('[data-explorer]')
  if (!explorer) return
  const tabs = all<HTMLButtonElement>('[data-kind]', explorer)
  const lists = all<HTMLElement>('[data-kind-list]', explorer)
  const picks = all<HTMLAnchorElement>('[data-choice]', explorer)
  const panels = all<HTMLElement>('[data-panel]', explorer)
  const detail = required<HTMLElement>('[data-detail]', explorer)

  /** `whole` keeps all of its kind on the stage, each to press; a pick becomes its own shape. */
  const choose = (pick: HTMLAnchorElement, whole = false): void => {
    const { choice, kindOf, shape } = pick.dataset
    for (const tab of tabs) tab.setAttribute('aria-pressed', String(tab.dataset['kind'] === kindOf))
    for (const list of lists) list.hidden = list.dataset['kindList'] !== kindOf
    for (const other of picks) other.setAttribute('aria-current', String(other === pick))
    for (const panel of panels) panel.hidden = panel.dataset['panel'] !== choice
    explorer.dataset['stageShape'] = whole ? kindOf : shape
    cueStage()
  }

  for (const pick of picks) {
    pick.addEventListener('click', (event) => {
      // A press with a key held still opens its page, as any link does.
      if (event.metaKey || event.ctrlKey || event.shiftKey) return
      event.preventDefault()
      choose(pick)
      // On a phone the stage is the top of the section, so the section comes back to the top.
      if (innerWidth < NARROW) return explorer.scrollIntoView({ block: 'start', behavior: 'smooth' })
      const { top } = detail.getBoundingClientRect()
      if (top < 90 || top > innerHeight * 0.75) detail.scrollIntoView({ block: 'start', behavior: 'smooth' })
    })
  }
  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      const first = picks.find((pick) => pick.dataset['kindOf'] === tab.dataset['kind'])
      if (first) choose(first, true)
    })
  }
  if (picks[0]) choose(picks[0], true)
}
