// Writes public/og-default.png (1200x630), the default share image, without any image library.
// It is a plain brand-colour placeholder with three bars: replace the PNG with real artwork.
// Chat apps (WhatsApp, Telegram, X) do not read SVG, so the share image must be a PNG or JPEG.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const WIDTH = 1200;
const HEIGHT = 630;
const BACKGROUND = [15, 107, 92];
const BARS = [
  { x: 150, y: 330, w: 280, h: 180, alpha: 0.85 },
  { x: 460, y: 250, w: 280, h: 260, alpha: 0.65 },
  { x: 770, y: 170, w: 280, h: 340, alpha: 0.45 },
];

const raw = Buffer.alloc((WIDTH * 3 + 1) * HEIGHT);
for (let y = 0; y < HEIGHT; y += 1) {
  const row = y * (WIDTH * 3 + 1);
  raw[row] = 0; // filter: none
  for (let x = 0; x < WIDTH; x += 1) {
    const bar = BARS.find((b) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);
    for (let channel = 0; channel < 3; channel += 1) {
      const base = BACKGROUND[channel] ?? 0;
      raw[row + 1 + x * 3 + channel] =
        bar === undefined ? base : Math.round(base + (255 - base) * bar.alpha);
    }
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) {
    c = (crcTable[(c ^ byte) & 0xff] ?? 0) ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

const header = Buffer.alloc(13);
header.writeUInt32BE(WIDTH, 0);
header.writeUInt32BE(HEIGHT, 4);
header[8] = 8; // bit depth
header[9] = 2; // colour type: RGB

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', header),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);
writeFileSync(new URL('../public/og-default.png', import.meta.url), png);
console.log(`wrote public/og-default.png (${png.length} bytes)`);
