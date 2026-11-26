import { all } from './dom.ts'

/**
 * "What can you build": a press or the arrow keys pick a kind, and its window slides in from the side it lies on (the
 * windows before it wait on one side, the ones after it on the other; the CSS reads --side).
 * While the board is on screen the kinds take turns by themselves: the line under the picked one fills (CSS), and when
 * it is full the next one comes. Once the visitor picks one, they stay in charge and the turns stop.
 */
export function initTabs(signal: AbortSignal): void {
  for (const root of all<HTMLElement>('[data-kinds]')) {
    const tabs = all<HTMLButtonElement>('[data-kind-tab]', root)
    const panels = all<HTMLElement>('[data-kind]', root)
    let current = Math.max(
      0,
      tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true'),
    )
    root.classList.add('is-live')
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) root.classList.add('is-turning')

    const pick = (at: number, focus = false): void => {
      current = at
      for (const [i, tab] of tabs.entries()) {
        tab.setAttribute('aria-selected', String(i === at))
        tab.tabIndex = i === at ? 0 : -1
      }
      for (const [i, panel] of panels.entries()) {
        panel.toggleAttribute('data-hidden', i !== at)
        panel.style.setProperty('--side', String(Math.sign(i - at)))
      }
      if (focus) tabs[at]?.focus()
    }
    const choose = (at: number, focus = false): void => {
      root.classList.remove('is-turning')
      pick(at, focus)
    }
    pick(current)

    // The line under the picked kind is full: the next kind's turn.
    root.addEventListener(
      'animationend',
      (event) => {
        if (!root.classList.contains('is-turning')) return
        if (!(event.target instanceof HTMLElement) || !event.target.classList.contains('make-time')) return
        pick((current + 1) % tabs.length)
      },
      { signal },
    )

    for (const [i, tab] of tabs.entries()) {
      tab.addEventListener('click', () => choose(i), { signal })
      tab.addEventListener(
        'keydown',
        (event) => {
          const rtl = getComputedStyle(root).direction === 'rtl'
          if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault()
            choose(event.key === 'Home' ? 0 : tabs.length - 1, true)
            return
          }
          const next = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: 1, ArrowUp: -1 }[event.key]
          if (next === undefined) return
          event.preventDefault()
          choose((i + next + tabs.length) % tabs.length, true)
        },
        { signal },
      )
    }
  }
}
