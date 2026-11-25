import { all, required } from './dom.ts'

const RESET_AFTER_MS = 2200

/**
 * Copies the button's text. Where the clipboard API is not allowed (a plain-http address, an older browser),
 * it copies through a hidden text box instead; only if that fails too does it select the words for the visitor.
 */
async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const box = document.createElement('textarea')
    box.value = text
    box.setAttribute('readonly', '')
    box.style.position = 'fixed'
    box.style.opacity = '0'
    document.body.append(box)
    box.select()
    let done = false
    try {
      done = document.execCommand('copy')
    } catch {
      done = false
    }
    box.remove()
    return done
  }
}

export function initCopy(): void {
  for (const button of all<HTMLButtonElement>('[data-copy]')) {
    let timer = 0
    button.addEventListener('click', async () => {
      const status = required<HTMLElement>('[data-status]', button)
      if (await copy(button.dataset['copy'] ?? '')) {
        status.textContent = button.dataset['done'] ?? ''
      } else {
        // Select only the words to copy: the element named by data-copy-from, or the one just before the button.
        const from = button.dataset['copyFrom'] ? document.querySelector(button.dataset['copyFrom']) : button.previousElementSibling
        if (from) getSelection()?.selectAllChildren(from)
        status.textContent = button.dataset['failed'] ?? ''
      }
      clearTimeout(timer)
      timer = window.setTimeout(() => (status.textContent = button.dataset['label'] ?? ''), RESET_AFTER_MS)
    })
  }
}
