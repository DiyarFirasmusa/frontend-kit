/** On a guide page, the search in the header filters the page list; Ctrl or Cmd + K puts the cursor in it. */
export function initTopSearch(signal: AbortSignal): void {
  const top = document.querySelector<HTMLInputElement>('[data-top-search]')
  const tree = document.querySelector<HTMLInputElement>('[data-tree-input]')
  if (!top || !tree) return

  // The hint beside the box names the key this computer has.
  const hint = top.parentElement?.querySelector('kbd')
  if (hint && /mac|iphone|ipad/i.test(navigator.userAgent)) hint.textContent = '⌘ K'

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
      if (event.key !== 'Enter' || !top.value.trim()) return
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
      if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return
      // Below the width where the header box is shown, the page list's own box takes the key.
      const target = top.getClientRects().length > 0 ? top : tree
      if (target === tree) {
        const list = tree.closest('details')
        if (list) list.open = true
        if (!tree.getClientRects().length) return
      }
      event.preventDefault()
      target.focus()
    },
    { signal },
  )
}
