/** WCAG 2.x helpers used by the contrast gate (contrast.test.ts). */

/** Relative luminance of a #rrggbb colour. */
export function luminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].toSorted((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}

/** Blends an `rgb(r g b / a)` colour over an opaque #rrggbb surface. */
export function blendOver(container: string, surfaceHex: string): string {
  const match = /rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\)/u.exec(container);
  if (!match) {
    throw new Error(`cannot parse ${container}`);
  }
  const alpha = Number(match[4]);
  return [1, 2, 3]
    .map((i, idx) => {
      const fg = Number(match[i]);
      const bg = parseInt(surfaceHex.slice(1 + idx * 2, 3 + idx * 2), 16);
      return Math.round(fg * alpha + bg * (1 - alpha))
        .toString(16)
        .padStart(2, '0');
    })
    .reduce((hex, part) => `${hex}${part}`, '#');
}
