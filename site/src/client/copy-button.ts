import { all, required } from './dom.ts'

const RESET_AFTER_MS = 2200

/**
 * Copies the button's text. Where the clipboard API is not allowed (a plain-http address, an older browser),
 * it copies through a hidden text box instead; only if that fails too does it select the words for the visitor.
 */
async function copy(words: string): Promise<boolean> {
  // The marks that keep English words in order inside Arabic text are invisible, and a command that starts
  // with one fails, so they never go to the clipboard.
  const marks = new RegExp('[\\u200e\\u200f\\u2066-\\u2069\\u202a-\\u202e]', 'g')
  const text = words.replace(marks, '')
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // The hidden box takes the focus while it copies; it goes back to the button afterwards.
    const focused = document.activeElement as HTMLElement | null
    const box = document.createElement('textarea')
    box.value = text
    box.setAttribute('readonly', '')
    box.style.position = 'fixed'
    box.style.opacity = '0'
    document.body.append(box)
    box.select()
    let done = false
    try {
      // The old copy command, kept only for pages where the clipboard API is refused (plain http, older
      // browsers). It is called through a narrow type of its own: same call, without the editor's deprecation note.
      done = (document as { execCommand(command: 'copy'): boolean }).execCommand('copy')
    } catch {
      done = false
    }
    box.remove()
    focused?.focus()
    return done
  }
}

export function initCopy(): void {
  for (const button of all<HTMLButtonElement>('[data-copy]').filter((candidate) => candidate.dataset['copy'])) {
    let timer = 0
    button.addEventListener('click', async () => {
      const status = required<HTMLElement>('[data-status]', button)
      // What a screen reader hears is in a place of its own beside the button, so the button keeps its name.
      const announce = button.parentElement?.querySelector<HTMLElement>('[data-announce]')
      if (await copy(button.dataset['copy'] ?? '')) {
        status.textContent = button.dataset['done'] ?? ''
        if (announce) announce.textContent = button.dataset['done'] ?? ''
      } else {
        // Select only the words to copy: the element named by data-copy-from, or the one just before the button.
        const from = button.dataset['copyFrom'] ? document.querySelector(button.dataset['copyFrom']) : button.previousElementSibling
        if (from) getSelection()?.selectAllChildren(from)
        status.textContent = button.dataset['failed'] ?? ''
        if (announce) announce.textContent = button.dataset['failed'] ?? ''
      }
      clearTimeout(timer)
      timer = window.setTimeout(() => {
        status.textContent = button.dataset['label'] ?? ''
        if (announce) announce.textContent = ''
      }, RESET_AFTER_MS)
    })
  }
}
