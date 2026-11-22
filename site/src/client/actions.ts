import { focusAgent, jump } from './events.ts'

export function initJump(): void {
  for (const button of document.querySelectorAll('[data-jump]')) button.addEventListener('click', jump)

  for (const pad of document.querySelectorAll('[data-stage="bot"], [data-stage="cheer"]')) {
    pad.addEventListener('click', jump)
  }
}

export function initCrew(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-agent]').forEach((button, i, all) => {
    const on = (): void => {
      for (const other of all) other.setAttribute('aria-pressed', String(other === button))
      focusAgent(i)
    }
    button.addEventListener('pointerenter', on)
    button.addEventListener('focus', on)
    button.addEventListener('click', on)
  })
}

export function initCopy(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
    let timer = 0
    button.addEventListener('click', async () => {
      const status = button.querySelector<HTMLElement>('[data-status]')
      if (!status) return
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? '')
        status.textContent = button.dataset.done ?? ''
        jump()
      } catch {
        const code = button.previousElementSibling
        if (code) getSelection()?.selectAllChildren(code)
        status.textContent = button.dataset.failed ?? ''
      }
      clearTimeout(timer)
      timer = window.setTimeout(() => (status.textContent = button.dataset.label ?? ''), 2200)
    })
  }
}
