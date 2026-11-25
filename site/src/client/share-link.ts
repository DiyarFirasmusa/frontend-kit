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
          try {
            if (navigator.share) await navigator.share(data)
            else await navigator.clipboard.writeText(data.url)
          } catch (error) {
            // Closing the share sheet is a choice. Any other refusal falls back to copying the link.
            if ((error as DOMException).name === 'AbortError') return
            await navigator.clipboard.writeText(data.url)
          }
          button.textContent = button.dataset['done'] ?? label
          setTimeout(() => (button.textContent = label), 3000)
        } catch {
          // Neither sharing nor copying was allowed: the link is still in the address bar.
        }
      },
      { signal },
    )
  }
}
