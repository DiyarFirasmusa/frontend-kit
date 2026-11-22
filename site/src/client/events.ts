declare global {
  interface DocumentEventMap {
    /** The kit jumps. */
    'kit:jump': CustomEvent<void>
    /** An agent is highlighted; -1 for none. */
    'kit:focus': CustomEvent<number>
    /** Something changed that needs a new frame while motion is off. */
    'kit:redraw': CustomEvent<void>
  }
}

export const jump = (): boolean => document.dispatchEvent(new CustomEvent('kit:jump'))
export const focusAgent = (index: number): boolean => document.dispatchEvent(new CustomEvent('kit:focus', { detail: index }))
export const redraw = (): boolean => document.dispatchEvent(new CustomEvent('kit:redraw'))
