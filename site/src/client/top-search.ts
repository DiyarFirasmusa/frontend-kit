/** On a guide page, the search in the header filters the page list; "/" puts the cursor in it. */
export function initTopSearch(signal: AbortSignal): void {
  const top = document.querySelector<HTMLInputElement>('[data-top-search]')
  const tree = document.querySelector<HTMLInputElement>('[data-tree-input]')
  if (!top || !tree) return

  top.addEventListener(
    'input',
    () => {
      tree.value = top.value
      tree.dispatchEvent(new Event('input'))
    },
    { signal },
  )

  top.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Enter') return
      const first = document.querySelector<HTMLAnchorElement>('[data-tree-item]:not([hidden]) a')
      if (!first) return
      event.preventDefault()
      first.click()
    },
    { signal },
  )

  addEventListener(
    'keydown',
    (event) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, [contenteditable]')) return
      event.preventDefault()
      top.focus()
    },
    { signal },
  )
}
