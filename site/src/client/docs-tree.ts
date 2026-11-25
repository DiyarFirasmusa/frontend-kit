import { all, fold, required } from './dom.ts'

/** Where the tree was scrolled to, so moving between pages does not move the tree. */
let scrolled = 0

/** The tree of the documentation: it filters as you type and keeps its place. */
export function initTree(signal: AbortSignal): void {
  const tree = document.querySelector<HTMLDetailsElement>('[data-tree]')
  if (!tree) return
  // A tablet turned, or a window widened: the list is open beside the page and folded away above it.
  const wide = matchMedia('(min-width: 901px)')
  tree.open = wide.matches
  wide.addEventListener('change', (change) => (tree.open = change.matches), { signal })
  const list = required<HTMLElement>('[data-tree-list]', tree)
  const input = required<HTMLInputElement>('[data-tree-input]', tree)
  const empty = required<HTMLElement>('[data-tree-empty]', tree)
  const groups = all<HTMLDetailsElement>('[data-tree-group]', tree)
  const announce = document.createElement('p')
  announce.className = 'sr-only'
  announce.setAttribute('role', 'status')
  tree.append(announce)
  const openAtFirst = groups.map((group) => group.open)
  const items = groups.map((group) => all<HTMLElement>('[data-tree-item]', group).map((item) => ({ item, text: fold(item.dataset['search'] ?? '') })))

  list.scrollTop = scrolled
  const current = list.querySelector<HTMLElement>('a[aria-current="page"]')
  if (current?.getClientRects().length) {
    const box = current.getBoundingClientRect()
    const frame = list.getBoundingClientRect()
    if (box.top < frame.top || box.bottom > frame.bottom) list.scrollTop += box.top - frame.top - frame.height / 3
  }
  list.addEventListener('scroll', () => (scrolled = list.scrollTop), { passive: true })

  input.addEventListener('input', () => {
    const words = fold(input.value).split(/\s+/).filter(Boolean)
    let found = 0
    groups.forEach((group, i) => {
      let shown = 0
      for (const { item, text } of items[i] ?? []) {
        item.hidden = !words.every((word) => text.includes(word))
        if (!item.hidden) shown++
      }
      group.hidden = shown === 0
      group.open = words.length > 0 || (openAtFirst[i] ?? false)
      found += shown
    })
    empty.hidden = found > 0
    // A permanent status line: it says "3 pages found" or "Nothing matches" every time the words change.
    announce.textContent = words.length === 0 ? '' : found > 0 ? `${found} ${tree.dataset['found'] ?? ''}` : (empty.textContent ?? '')
  })
}
