import { all, required } from './dom.ts'

const RESET_AFTER_MS = 2200

export function initCopy(): void {
  for (const button of all<HTMLButtonElement>('[data-copy]')) {
    let timer = 0
    button.addEventListener('click', async () => {
      const status = required<HTMLElement>('[data-status]', button)
      try {
        await navigator.clipboard.writeText(button.dataset['copy'] ?? '')
        status.textContent = button.dataset['done'] ?? ''
      } catch {
        const code = button.previousElementSibling
        if (code) getSelection()?.selectAllChildren(code)
        status.textContent = button.dataset['failed'] ?? ''
      }
      clearTimeout(timer)
      timer = window.setTimeout(() => (status.textContent = button.dataset['label'] ?? ''), RESET_AFTER_MS)
    })
  }
}
