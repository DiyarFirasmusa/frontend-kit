import { all, required } from './dom.ts'

/** Filters the skill list as you type, in either language. */
export function initFinder(): void {
  const finder = document.querySelector<HTMLElement>('[data-finder]')
  if (!finder) return
  const input = required<HTMLInputElement>('[data-finder-input]', finder)
  const empty = required<HTMLElement>('[data-finder-empty]', finder)
  const groups = all<HTMLElement>('[data-finder-group]').map((element) => ({ element, items: all<HTMLElement>('[data-finder-item]', element) }))

  input.addEventListener('input', () => {
    const words = input.value.toLowerCase().split(/\s+/).filter(Boolean)
    let found = 0
    for (const { element, items } of groups) {
      let shown = 0
      for (const item of items) {
        item.hidden = !words.every((word) => item.dataset['search']?.includes(word))
        if (!item.hidden) shown++
      }
      element.hidden = shown === 0
      found += shown
    }
    empty.hidden = found > 0
  })
}
