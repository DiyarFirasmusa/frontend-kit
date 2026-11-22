import { formations, type FormationName } from './formations.ts'
import { REST } from './parts.ts'

const round = (n: number): number => Math.round(n * 100) / 100

/** A flat front view of a formation, drawn at build time for no-JS, no-WebGL and first paint. */
export function poster(name: FormationName): { viewBox: string; body: string } {
  const { width, height, parts } = formations[name](REST)
  const body = [...parts]
    .sort((a, b) => a.at[2] + a.size[2] / 2 - (b.at[2] + b.size[2] / 2))
    .map(({ at, size, turn, radius, color }) => {
      const [x, y] = [round(at[0]), round(-at[1])]
      const spin = turn[2] ? ` transform="rotate(${round((-turn[2] * 180) / Math.PI)} ${x} ${y})"` : ''
      const box = `x="${round(x - size[0] / 2)}" y="${round(y - size[1] / 2)}" width="${round(size[0])}" height="${round(size[1])}"`
      return `<rect ${box} rx="${round(radius)}" fill="${color}"${spin}/>`
    })
    .join('')
  return { viewBox: `${-width / 2} ${-height / 2} ${width} ${height}`, body }
}
