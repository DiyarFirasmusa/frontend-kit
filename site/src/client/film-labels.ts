import { IMPACT } from '../film/direction.ts'
import type { Film, Shot } from '../film/film.ts'
import { CENTRE } from '../film/shapes/blocks.ts'
import { clamp, easeOut } from '../film/timeline.ts'
import { all, required } from './dom.ts'

const THROW_FROM = 0.12
const DOOR = [0, CENTRE, 1.6] as [number, number, number]

interface Label {
  element: HTMLElement
  shape: string
  index: number
  order: number
}

/** Names written on the objects, and the command thrown at the vault. */
export class FilmLabels {
  private readonly labels: Label[]
  private readonly attack = required<HTMLElement>('[data-attack]')
  private readonly verdict = required<HTMLElement>('[data-verdict-card]')
  private readonly rtl: boolean

  constructor(rtl: boolean) {
    this.rtl = rtl
    const elements = all<HTMLElement>('[data-label-for]')
    this.labels = elements.map((element) => {
      const shape = element.dataset['labelFor'] ?? ''
      const index = Number(element.dataset['index'])
      const siblings = elements.filter((other) => other.dataset['labelFor'] === shape).length
      return { element, shape, index, order: index / siblings }
    })
  }

  show(film: Film, shot: Shot, width: number, height: number): void {
    const { from, to, move } = shot
    for (const { element, shape, index, order } of this.labels) {
      const strength = shape === from ? 1 - clamp(move * 5) : shape === to ? clamp((move - 0.82) * 7 - order * 0.25) : 0
      const point = strength > 0 ? film.anchors[shape as Shot['from']]?.[index] : undefined
      if (!point) {
        if (!element.hidden) element.hidden = true
        continue
      }
      const { x, y, behind, distance } = film.project(point)
      element.hidden = behind || x < -140 || x > width + 140
      if (element.hidden) continue
      const size = shape === 'skills' ? Math.min(1.2, (22 / distance) * Math.min(1, width / 560 + 0.05)) : 1
      element.style.opacity = String(strength)
      element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${size})`
    }
    this.throwCommand(film, shot, width, height)
  }

  private throwCommand(film: Film, { from, hold, move }: Shot, width: number, height: number): void {
    const { attack, verdict } = this
    const active = from === 'gate' && move < 0.12
    attack.hidden = !active || hold < 0.1
    verdict.hidden = !active || hold < IMPACT
    if (!active) return

    const side = this.rtl ? -1 : 1
    const door = film.project(DOOR)
    const flight = clamp((hold - THROW_FROM) / (IMPACT - THROW_FROM))
    const back = easeOut(clamp((hold - IMPACT) / 0.2))
    const startX = width < 820 ? width / 2 : width * (0.5 + 0.02 * side)
    const startY = height * (width < 820 ? 0.62 : 0.86)
    const x = startX + (door.x - startX) * flight * flight + back * 90 * side
    const y = startY + (door.y - startY) * flight * flight + back * 170
    attack.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${1.15 - flight * 0.3}) rotate(${back * 16 * side}deg)`
    attack.style.opacity = String(clamp((hold - 0.1) * 14) * (1 - back))
    verdict.style.transform = `translate(${door.x}px, ${door.y}px) translate(-50%, -50%) scale(${0.7 + back * 0.3})`
    verdict.style.opacity = String(back)
  }

  reset(): void {
    for (const { element } of this.labels) element.hidden = true
    this.attack.hidden = true
    this.verdict.hidden = true
  }
}
