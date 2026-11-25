import { all } from './dom.ts'

const TURN_MS = 6000

/**
 * "What can you build": one kind at a time. While the section is on screen the kinds take turns by
 * themselves, and a line under the chosen tab shows the time left. A press or a key picks a kind and
 * stops the turns; hovering pauses them. Nothing moves the page.
 */
export function initTabs(signal: AbortSignal): void {
  for (const root of all<HTMLElement>('[data-kinds]')) {
    const tabs = all<HTMLButtonElement>('[data-kind-tab]', root)
    const panels = all<HTMLElement>('[data-kind]', root)
    const show = root.querySelector<HTMLElement>('.show')
    if (tabs.length === 0 || !show) continue
    root.classList.add('is-live')
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
    let current = 0
    let chosen = calm
    let held = false
    let seen = false
    let left = TURN_MS

    const pick = (at: number, focus = false): void => {
      current = at
      left = TURN_MS
      for (const [i, tab] of tabs.entries()) {
        tab.setAttribute('aria-selected', String(i === at))
        tab.tabIndex = i === at ? 0 : -1
      }
      for (const [i, panel] of panels.entries()) panel.toggleAttribute('data-hidden', i !== at)
      root.classList.toggle('is-turning', !chosen)
      // Restart the line under the tab.
      root.classList.remove('is-ticking')
      void root.offsetWidth
      root.classList.add('is-ticking')
      if (focus) tabs[at]?.focus()
    }

    const choose = (at: number, focus = false): void => {
      chosen = true
      pick(at, focus)
    }

    for (const [i, tab] of tabs.entries()) {
      tab.addEventListener('click', () => choose(i), { signal })
      tab.addEventListener(
        'keydown',
        (event) => {
          const rtl = getComputedStyle(root).direction === 'rtl'
          const next = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[event.key]
          if (next === undefined) return
          event.preventDefault()
          choose((i + next + tabs.length) % tabs.length, true)
        },
        { signal },
      )
    }

    show.addEventListener('pointerenter', () => ((held = true), root.classList.add('is-held')), { signal })
    show.addEventListener('pointerleave', () => ((held = false), root.classList.remove('is-held')), { signal })

    const watcher = new IntersectionObserver(
      ([entry]) => {
        seen = Boolean(entry?.isIntersecting)
        root.classList.toggle('is-held-away', !seen)
      },
      { threshold: 0.3 },
    )
    watcher.observe(show)

    // One clock: it counts only while the section is seen, not hovered, and nobody has chosen.
    const clock = setInterval(() => {
      if (chosen || held || !seen) return
      left -= 100
      if (left <= 0) pick((current + 1) % tabs.length)
    }, 100)

    signal.addEventListener('abort', () => (clearInterval(clock), watcher.disconnect()))
    pick(0)
  }
}
