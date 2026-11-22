import { all, required } from './dom.ts'

export function initGate(): void {
  const demo = document.querySelector<HTMLElement>('[data-gate]')
  if (!demo) return
  const output = required<HTMLElement>('[data-output]', demo)
  const buttons = all<HTMLButtonElement>('[data-verdict]', demo)

  for (const button of buttons) {
    button.addEventListener('click', () => {
      for (const other of buttons) other.setAttribute('aria-pressed', String(other === button))
      const { verdict = '', reason = '', note = '' } = button.dataset
      output.dataset['result'] = verdict
      const title = verdict === 'deny' ? output.dataset['denied'] : output.dataset['allowed']
      required('[data-title]', output).textContent = title ?? ''
      required('[data-reason]', output).textContent = reason
      required('[data-note]', output).textContent = note
    })
  }
}
