import { redraw } from './events.ts'

export function initProfiles(): void {
  const section = document.querySelector<HTMLElement>('#profiles')
  const slot = section?.querySelector<HTMLElement>('[data-stage]')
  if (!section || !slot) return
  const tabs = [...section.querySelectorAll<HTMLButtonElement>('[role="tab"]')]

  const select = (index: number, focus = false): void => {
    const selected = (index + tabs.length) % tabs.length
    tabs.forEach((tab, i) => {
      const on = i === selected
      tab.setAttribute('aria-selected', String(on))
      tab.tabIndex = on ? 0 : -1
      document.getElementById(tab.getAttribute('aria-controls') ?? '')?.toggleAttribute('hidden', !on)
      if (!on) return
      slot.dataset.stage = tab.dataset.formation
      section.dataset.world = tab.dataset.formation
      if (focus) tab.focus()
    })
    redraw()
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i))
    tab.addEventListener('keydown', (event) => {
      const forward = document.documentElement.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
      const back = forward === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight'
      const next = { [forward]: i + 1, [back]: i - 1, Home: 0, End: tabs.length - 1 }[event.key]
      if (next === undefined) return
      event.preventDefault()
      select(next, true)
    })
  })
  select(0)
}
