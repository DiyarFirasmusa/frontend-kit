import { redraw } from './events.ts'

export function initGate(): void {
  const section = document.querySelector<HTMLElement>('#gate')
  const slot = section?.querySelector<HTMLElement>('[data-stage]')
  const output = section?.querySelector<HTMLElement>('[data-output]')
  if (!section || !slot || !output) return
  const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-verdict]')]

  for (const button of buttons) {
    button.addEventListener('click', () => {
      for (const other of buttons) other.setAttribute('aria-pressed', String(other === button))
      const { verdict, reason = '', note = '' } = button.dataset
      const denied = verdict === 'deny'
      output.dataset.result = verdict
      output.querySelector('[data-title]')!.textContent = (denied ? output.dataset.denied : output.dataset.allowed) ?? ''
      output.querySelector('[data-reason]')!.textContent = reason
      output.querySelector('[data-note]')!.textContent = note
      slot.dataset.stage = denied ? 'gateShut' : 'gateOpen'
      redraw()
    })
  }
}
