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

function toLinear(channel: number): number {
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function fromLinear(value: number): number {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped <= 0.0031308
    ? clamped * 12.92
    : 1.055 * clamped ** (1 / 2.4) - 0.055;
}

type Triple = readonly [number, number, number];

function toOklab(hex: string): Triple {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) =>
    toLinear(parseInt(hex.slice(i, i + 2), 16) / 255),
  );
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromOklab([lightness, a, b]: Triple): string {
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].reduce(
    (hex, channel) =>
      `${hex}${Math.round(fromLinear(channel) * 255)
        .toString(16)
        .padStart(2, '0')}`,
    '#',
  );
}

/**
 * CSS `color-mix(in oklab, <top> <percent>%, <base>)` for two opaque #rrggbb
 * colours, like the `.control` fill (4% of the text colour over the surface).
 */
export function mixOklab(top: string, percent: number, base: string): string {
  const [t1, t2, t3] = toOklab(top);
  const [b1, b2, b3] = toOklab(base);
  const weight = percent / 100;
  return fromOklab([
    t1 * weight + b1 * (1 - weight),
    t2 * weight + b2 * (1 - weight),
    t3 * weight + b3 * (1 - weight),
  ]);
}
