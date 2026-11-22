import type { Playhead } from '../film/timeline.ts'
import { clamp, easeOut, smooth } from '../film/timeline.ts'
import { all, required } from './dom.ts'

const LEAVE_BY = 0.36
const ENTER_FROM = 0.4
/** The copy is gone before the explanation climbs into its place. */
const YIELD_BY = 0.55

interface Block {
  element: HTMLElement
  words: HTMLElement[]
  parts: HTMLElement[]
  active: HTMLElement[]
  /** What it last drew, so a still screen writes nothing to the page. */
  drawn: string
}

/** Words rise out of a mask as a scene arrives and blur away as it leaves, tied to the scroll. */
export class FilmCopy {
  private readonly blocks: Block[]
  private readonly drift: number

  constructor(sections: readonly HTMLElement[], rtl: boolean) {
    this.drift = rtl ? 1 : -1
    this.blocks = sections.map((section) => ({
      element: required<HTMLElement>('[data-copy-block]', section),
      words: all<HTMLElement>('[data-word]', section),
      parts: all<HTMLElement>('[data-part]', section),
      active: all<HTMLElement>('[data-active]', section),
      drawn: '',
    }))
  }

  show({ index, hold, aside, move }: Playhead, explained: number): void {
    this.blocks.forEach((block, i) => {
      let enter = 0
      let leave = 0
      if (i === index) {
        enter = 1
        leave = Math.max(clamp(move / LEAVE_BY), clamp(Math.max(aside, explained) / YIELD_BY))
      } else if (i === index + 1) {
        enter = clamp((move - ENTER_FROM) / (1 - ENTER_FROM))
      }
      const visible = enter > 0 && leave < 1
      const current = i === index ? Math.min(block.active.length - 1, Math.floor(hold * block.active.length)) : 0
      const drawn = visible ? `${enter.toFixed(3)} ${leave.toFixed(3)} ${current}` : 'hidden'
      if (drawn === block.drawn) return
      block.drawn = drawn

      const { element, words, parts, active } = block
      element.classList.toggle('is-shown', visible)
      element.style.opacity = visible ? String(1 - smooth(leave)) : '0'
      element.style.filter = visible && leave > 0 ? `blur(${leave * 10}px)` : ''
      if (!visible) return

      words.forEach((word, n) => {
        const t = easeOut(clamp(enter * 1.8 - (n / words.length) * 0.6))
        word.style.transform = t < 1 || leave > 0 ? `translateY(${(1 - t) * 112 - leave * 60}%) rotate(${(1 - t) * -5 * this.drift}deg)` : ''
        word.style.opacity = t < 1 ? String(t) : ''
      })
      parts.forEach((part, n) => {
        const t = easeOut(clamp(enter * 2 - 0.45 - (n / Math.max(1, parts.length)) * 0.5))
        part.style.opacity = t < 1 ? String(t) : ''
        part.style.transform = t < 1 ? `translateX(${(1 - t) * 28 * this.drift}px)` : ''
      })
      active.forEach((item, n) => {
        item.classList.toggle('is-now', n === current)
        item.classList.toggle('is-past', n < current)
      })
    })
  }

  /** Hands the page back as the still layout. */
  reset(): void {
    for (const block of this.blocks) {
      block.drawn = ''
      block.element.classList.remove('is-shown')
      for (const element of [block.element, ...block.words, ...block.parts]) {
        element.style.opacity = ''
        element.style.transform = ''
        element.style.filter = ''
      }
    }
  }
}
