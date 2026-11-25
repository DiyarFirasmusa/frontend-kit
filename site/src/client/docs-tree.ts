import { all, required } from './dom.ts'

/** Where the tree was scrolled to, so moving between pages does not move the tree. */
let scrolled = 0

/** The tree of the documentation: it filters as you type and keeps its place. */
export function initTree(): void {
  const tree = document.querySelector<HTMLDetailsElement>('[data-tree]')
  if (!tree) return
  if (innerWidth < 900) tree.open = false
  // A tablet turned, or a window widened: the list is open beside the page and folded away above it.
  matchMedia('(min-width: 901px)').addEventListener('change', (wide) => (tree.open = wide.matches))
  const list = required<HTMLElement>('[data-tree-list]', tree)
  const input = required<HTMLInputElement>('[data-tree-input]', tree)
  const empty = required<HTMLElement>('[data-tree-empty]', tree)
  const groups = all<HTMLDetailsElement>('[data-tree-group]', tree)
  const openAtFirst = groups.map((group) => group.open)
  const items = groups.map((group) => all<HTMLElement>('[data-tree-item]', group))

  list.scrollTop = scrolled
  const current = list.querySelector<HTMLElement>('a[aria-current="page"]')
  if (current?.getClientRects().length) {
    const box = current.getBoundingClientRect()
    const frame = list.getBoundingClientRect()
    if (box.top < frame.top || box.bottom > frame.bottom) list.scrollTop += box.top - frame.top - frame.height / 3
  }
  list.addEventListener('scroll', () => (scrolled = list.scrollTop), { passive: true })

  input.addEventListener('input', () => {
    const words = input.value.toLowerCase().split(/\s+/).filter(Boolean)
    let found = 0
    groups.forEach((group, i) => {
      let shown = 0
      for (const item of items[i]!) {
        item.hidden = !words.every((word) => item.dataset['search']?.includes(word))
        if (!item.hidden) shown++
      }
      group.hidden = shown === 0
      group.open = words.length > 0 || openAtFirst[i]!
      found += shown
    })
    empty.hidden = found > 0
  })
}
