import { all, fold, required } from './dom.ts'

/** Filters the skill list as you type, in either language. */
export function initFinder(): void {
  const finder = document.querySelector<HTMLElement>('[data-finder]')
  if (!finder) return
  const input = required<HTMLInputElement>('[data-finder-input]', finder)
  const empty = required<HTMLElement>('[data-finder-empty]', finder)
  // A status line that is always there, so a screen reader hears the count each time the words change.
  const status = document.createElement('p')
  status.className = 'sr-only'
  status.setAttribute('role', 'status')
  finder.append(status)
  const groups = all<HTMLElement>('[data-finder-group]').map((element) => ({
    element,
    items: all<HTMLElement>('[data-finder-item]', element).map((item) => ({ item, text: fold(item.dataset['search'] ?? '') })),
  }))

  input.addEventListener('input', () => {
    const words = fold(input.value).split(/\s+/).filter(Boolean)
    let found = 0
    for (const { element, items } of groups) {
      let shown = 0
      for (const { item, text } of items) {
        item.hidden = !words.every((word) => text.includes(word))
        if (!item.hidden) shown++
      }
      element.hidden = shown === 0
      found += shown
    }
    empty.hidden = found > 0
    status.textContent = words.length === 0 ? '' : found > 0 ? `${found} ${finder.dataset['found'] ?? ''}`.trim() : (empty.textContent ?? '')
    const more = document.querySelector<HTMLDetailsElement>('[data-finder-more]')
    if (more && words.length) more.open = true
  })
}
