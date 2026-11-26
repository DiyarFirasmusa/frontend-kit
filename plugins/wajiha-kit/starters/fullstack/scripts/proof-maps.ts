// Source maps made for the bundle proof (npm run build:proof) and the rule that keeps them out of the
// deployable output. Plain file work with no build or network access, so a unit test can try it
// (proof-maps.test.ts). Node strips the types: erasable syntax only.
//
// A source map holds the original TypeScript (sourcesContent). The proof needs the maps to read which modules
// are in each chunk, but a server that serves .output/public would hand them to everyone. So the proof build
// moves every map out of .output into PROOF_MAPS_DIR (same relative paths), and nothing deployable has one.
import { existsSync, mkdirSync, readdirSync, renameSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

/** The deployable output (the Dockerfile copies it). It must never contain a source map. */
export const OUTPUT_DIR = '.output';

/** Where build:proof keeps the maps. Not served, not copied into an image (.dockerignore), not committed. */
export const PROOF_MAPS_DIR = '.proof-maps';

/** "x.js.map" and the compressed copies the build makes of it ("x.js.map.br", ".gz", ".zst"). */
const MAP_FILE = /\.map(?:\.(?:br|gz|zst))?$/;

export function isMapFile(name: string): boolean {
  return MAP_FILE.test(name);
}

/** Every map file below a folder, as paths relative to it with "/" separators (empty when it is missing). */
export function findMaps(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .map((name) => name.replaceAll('\\', '/'))
    .filter((name) => isMapFile(name) && statSync(join(dir, name)).isFile())
    .toSorted();
}

/** Moves every map from one folder to another, keeping the relative paths. Returns what it moved. */
export function moveMaps(from: string, to: string): string[] {
  const moved = findMaps(from);
  for (const name of moved) {
    const target = join(to, name);
    mkdirSync(dirname(target), { recursive: true });
    renameSync(join(from, name), target);
  }
  return moved;
}
