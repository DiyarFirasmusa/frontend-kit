// Fails when the deployable output holds a source map (.map, or a compressed copy of one). A map carries the
// original source (sourcesContent) and anything served from .output/public is public. A plain "npm run
// build" makes none; "npm run build:proof" moves its maps to .proof-maps. The Dockerfile runs this after its
// build, so an image can never carry one. Usage: node scripts/check-no-maps.mjs [folder] (default .output).
import { findMaps, OUTPUT_DIR } from './proof-maps.ts';

const dir = process.argv[2] ?? OUTPUT_DIR;
const maps = findMaps(dir);
if (maps.length > 0) {
  console.error(
    `check:maps: ${maps.length} source map file(s) in ${dir}, which is served or shipped:`,
  );
  for (const name of maps.slice(0, 10)) {
    console.error(`  ${name}`);
  }
  process.exit(1);
}
console.log(`check:maps ok: no source map in ${dir}`);
