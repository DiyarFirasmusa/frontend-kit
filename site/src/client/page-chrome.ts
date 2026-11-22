import { all, required } from './dom.ts'

/** The progress line, the menu, and the place kept when the language changes. Lives as long as its page. */
export function initChrome(signal: AbortSignal): void {
  const progress = required<HTMLElement>('[data-progress]')
  const menu = required<HTMLDetailsElement>('[data-menu]')
  const language = required<HTMLAnchorElement>('[data-language]')
  const languageHome = language.pathname
  const sections = all<HTMLElement>('main section[id]')

  const update = (): void => {
    const range = document.documentElement.scrollHeight - innerHeight
    progress.style.transform = `scaleX(${range > 0 ? scrollY / range : 0})`
  }
  addEventListener('scroll', update, { passive: true, signal })
  addEventListener('resize', update, { signal })

  language.addEventListener('click', () => {
    const here = sections.findLast((section) => section.getBoundingClientRect().top <= innerHeight * 0.4)
    language.href = here && scrollY > 40 ? `${languageHome}#${here.id}` : languageHome
  })

  for (const link of all('a', menu)) link.addEventListener('click', () => (menu.open = false))
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Escape' || !menu.open) return
      menu.open = false
      required<HTMLElement>('summary', menu).focus()
    },
    { signal },
  )
  document.addEventListener(
    'click',
    (event) => {
      if (event.target instanceof Node && !menu.contains(event.target)) menu.open = false
    },
    { signal },
  )
  update()
}
