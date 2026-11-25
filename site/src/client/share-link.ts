import { all } from './dom.ts'

/** The phone card in the hero: send yourself the page. The share sheet where there is one, otherwise the link is copied. */
export function initShareLink(signal: AbortSignal): void {
  for (const button of all<HTMLButtonElement>('[data-share-link]')) {
    const label = button.textContent ?? ''
    button.addEventListener(
      'click',
      async () => {
        const data = { title: document.title, url: location.href.split('#')[0] ?? location.href }
        try {
          if (navigator.share) await navigator.share(data)
          else await navigator.clipboard.writeText(data.url)
          button.textContent = button.dataset['done'] ?? label
          setTimeout(() => (button.textContent = label), 3000)
        } catch {
          // The person closed the share sheet: nothing to say.
        }
      },
      { signal },
    )
  }
}
