import { all } from './dom.ts'

/** The tabs of "What can you build": a click or the arrow keys pick a kind, and its panel shows. */
export function initTabs(signal: AbortSignal): void {
  for (const root of all<HTMLElement>('[data-tabs]')) {
    const tabs = all<HTMLButtonElement>('[data-tab]', root)
    const panels = all<HTMLElement>('[data-panel]', root)

    const pick = (at: number, focus = false): void => {
      for (const [i, tab] of tabs.entries()) {
        tab.setAttribute('aria-selected', String(i === at))
        tab.tabIndex = i === at ? 0 : -1
      }
      for (const [i, panel] of panels.entries()) panel.toggleAttribute('data-hidden', i !== at)
      if (focus) tabs[at]?.focus()
    }

    for (const [i, tab] of tabs.entries()) {
      tab.addEventListener('click', () => pick(i), { signal })
      tab.addEventListener(
        'keydown',
        (event) => {
          const rtl = getComputedStyle(root).direction === 'rtl'
          const next = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[event.key]
          if (next === undefined) return
          event.preventDefault()
          pick((i + next + tabs.length) % tabs.length, true)
        },
        { signal },
      )
    }
  }
}
