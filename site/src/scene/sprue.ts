import { bot } from './bot.ts'
import { plastic as c } from './palette.ts'
import { bar, block, REST, type Formation, type Part, type Pose } from './parts.ts'

const ROW_WIDTH = 9
const GAP = 0.3
const RAIL = 0.17

interface Row {
  items: { index: number; part: Part; width: number; height: number }[]
  width: number
  height: number
}

/**
 * The bot taken apart on its runner, like a model kit. Parts keep their slot index, so each one
 * flies from the robot to its own place on the frame.
 */
function layOut(): Omit<Formation, 'tilt'> {
  const source = bot(REST).parts
  const ordered = source
    .map((part, index) => {
      const width = Math.max(part.size[0], part.size[1]) * 0.8
      const height = Math.min(part.size[0], part.size[1]) * 0.8
      return { index, part, width, height }
    })
    .sort((a, b) => b.height - a.height)

  const rows: Row[] = []
  for (const item of ordered) {
    let row = rows.at(-1)
    if (!row || row.width + item.width + GAP > ROW_WIDTH) {
      row = { items: [], width: GAP, height: 0 }
      rows.push(row)
    }
    row.items.push(item)
    row.width += item.width + GAP
    row.height = Math.max(row.height, item.height)
  }

  const height = rows.reduce((sum, row) => sum + row.height + GAP * 2 + RAIL, RAIL)
  const parts: Part[] = [...source]
  const frame: Part[] = []
  const edge = ROW_WIDTH / 2 + RAIL
  let top = height / 2

  for (const row of rows) {
    frame.push(bar([-edge, top, 0], [edge, top, 0], RAIL, c.steel))
    let x = -row.width / 2 + GAP
    for (const { index, part, width, height: thickness } of row.items) {
      const tall = part.size[1] > part.size[0]
      const size = part.size.map((n) => n * 0.8) as Part['size']
      parts[index] = block(
        [x + width / 2, top - RAIL / 2 - GAP - thickness / 2, 0],
        [size[0], size[1], Math.min(size[2], 0.6)],
        part.color,
        part.radius * 0.8,
        [0, 0, tall ? Math.PI / 2 : 0],
      )
      x += width + GAP
    }
    top -= row.height + GAP * 2 + RAIL
  }

  frame.push(
    bar([-edge, top, 0], [edge, top, 0], RAIL, c.steel),
    bar([-edge, height / 2, 0], [-edge, top, 0], RAIL, c.steel),
    bar([edge, height / 2, 0], [edge, top, 0], RAIL, c.steel),
    block([edge - 0.75, height / 2 + 0.32, 0], [1.2, 0.5, 0.16], c.steel, 0.12),
  )

  return { width: ROW_WIDTH + 1.2, height: height + 1.2, parts: [...parts, ...frame] }
}

let cached: Omit<Formation, 'tilt'> | undefined

export function sprue({ time, lookX, lookY }: Pose): Formation {
  cached ??= layOut()
  return { ...cached, tilt: [-0.12 + lookY * 0.16, 0.2 + lookX * 0.22 + Math.sin(time * 0.5) * 0.1, -0.06] }
}
