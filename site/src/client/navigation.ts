import { all, required } from './dom.ts'

/** The progress line, the menu, and the place kept when the language changes. */
export function initNavigation(): void {
  const progress = required<HTMLElement>('[data-progress]')
  const menu = required<HTMLDetailsElement>('[data-menu]')
  const language = required<HTMLAnchorElement>('[data-language]')
  const languageHome = language.pathname
  const details = document.querySelector<HTMLElement>('[data-details]')
  const sections = all<HTMLElement>('main section[id], main .moment-slot[id]')
  let queued = false

  const update = (): void => {
    queued = false
    const range = document.documentElement.scrollHeight - innerHeight
    progress.style.transform = `scaleX(${range > 0 ? scrollY / range : 0})`
    if (details) document.documentElement.classList.toggle('past-film', details.getBoundingClientRect().top <= 0)
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
