/** The light/dark button: the choice is kept, and the button says what it would switch to. */
export function initTheme(signal: AbortSignal): void {
  const root = document.documentElement
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    const paint = (): void => {
      const light = root.dataset['theme'] === 'light'
      button.setAttribute('aria-label', (light ? button.dataset['light'] : button.dataset['dark']) ?? '')
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f4f0ea' : '#050607')
    }
    paint()
    button.addEventListener(
      'click',
      () => {
        if (root.dataset['theme'] === 'light') delete root.dataset['theme']
        else root.dataset['theme'] = 'light'
        try {
          localStorage.setItem('wajiha-theme', root.dataset['theme'] === 'light' ? 'light' : 'dark')
        } catch {
          // Private browsing: the choice lasts for this visit only.
        }
        paint()
      },
      { signal },
    )
  }
}
