import { all, required } from './dom.ts'

/** Marks the section in view, fills the progress line and keeps the place when the language changes. */
export function initNavigation(): void {
  const links = all<HTMLAnchorElement>('[data-nav]')
  const targets = links.map((link) => document.getElementById(link.hash.slice(1)))
  const sections = all<HTMLElement>('main section[id]')
  const progress = required<HTMLElement>('[data-progress]')
  const menu = required<HTMLDetailsElement>('[data-menu]')
  const language = required<HTMLAnchorElement>('[data-language]')
  const languageHome = language.pathname
  let queued = false

  const update = (): void => {
    queued = false
    const line = innerHeight * 0.4
    let current = -1
    targets.forEach((target, i) => {
      if (target && target.getBoundingClientRect().top <= line) current = i
    })
    links.forEach((link, i) => {
      if (i === current) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
    const range = document.documentElement.scrollHeight - innerHeight
    progress.style.transform = `scaleX(${range > 0 ? scrollY / range : 0})`
  }

  const request = (): void => {
    if (queued) return
    queued = true
    requestAnimationFrame(update)
  }

  addEventListener('scroll', request, { passive: true })
  addEventListener('resize', request)

  language.addEventListener('click', () => {
    const here = sections.findLast((section) => section.getBoundingClientRect().top <= innerHeight * 0.4)
    language.href = here && scrollY > 40 ? `${languageHome}#${here.id}` : languageHome
  })

  for (const link of all('a', menu)) link.addEventListener('click', () => (menu.open = false))
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !menu.open) return
    menu.open = false
    required<HTMLElement>('summary', menu).focus()
  })
  document.addEventListener('click', (event) => {
    if (event.target instanceof Node && !menu.contains(event.target)) menu.open = false
  })
  update()
}
