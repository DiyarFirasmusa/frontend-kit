/** A point in CSS pixels as -1 to 1 on both axes, or nothing while the surface has no size. */
export function toClip(x: number, y: number, width: number, height: number): [x: number, y: number] | undefined {
  if (width <= 0 || height <= 0) return undefined
  return [(x / width) * 2 - 1, 1 - (y / height) * 2]
}
