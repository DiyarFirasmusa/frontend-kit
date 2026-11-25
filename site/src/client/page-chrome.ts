import { all, required } from './dom.ts'

/** The header: its ground, the section being read, the progress line, the menu and the language. Lives as long as its page. */
export function initChrome(signal: AbortSignal): void {
  // The page that is not there carries a header in each language; only the one in view is the header.
  const bar = all<HTMLElement>('.top').find((candidate) => !candidate.closest('[hidden]')) ?? required<HTMLElement>('.top')
  const progress = required<HTMLElement>('[data-progress]', bar)
  const menu = required<HTMLDetailsElement>('[data-menu]', bar)
  const language = required<HTMLAnchorElement>('[data-language]', bar)
  const languageHome = language.pathname
  const sections = all<HTMLElement>('main section[id]')
  const reading = (): HTMLElement | undefined => sections.findLast((section) => section.getBoundingClientRect().top <= innerHeight * 0.4)
  // Only the links into this page can be the place being read.
  const places = all<HTMLAnchorElement>('.top-nav a, .menu nav a', bar).filter((link) => link.hash && link.pathname === location.pathname)

  const update = (): void => {
    bar.classList.toggle('is-scrolled', scrollY > 8)
    if (places.length) {
      const here = reading()?.id
      for (const link of places) {
        if (link.hash === `#${here}`) link.setAttribute('aria-current', 'location')
        else link.removeAttribute('aria-current')
      }
    }
    const range = document.documentElement.scrollHeight - innerHeight
    progress.style.transform = `scaleX(${range > 0 ? scrollY / range : 0})`
  }
  // The scroll event can fire several times a frame: read the page once per frame.
  let queued = 0
  const soon = (): void => {
    if (queued) return
    queued = requestAnimationFrame(() => {
      queued = 0
      update()
    })
  }
  addEventListener('scroll', soon, { passive: true, signal })
  addEventListener('resize', update, { signal })

  language.addEventListener('click', () => {
    const here = reading()
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
