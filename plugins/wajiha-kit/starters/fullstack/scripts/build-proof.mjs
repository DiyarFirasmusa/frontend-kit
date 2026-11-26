// The build for the bundle proof: the production build plus hidden source maps, then every map is moved out
// of .output into .proof-maps (scripts/proof-maps.ts says why). "npm run check:bundle" reads them from there.
// The same build as "npm run build" otherwise, through the Vite API so no shell or binary path is involved.
import { rmSync } from 'node:fs';
import { createBuilder } from 'vite';
import { findMaps, moveMaps, OUTPUT_DIR, PROOF_MAPS_DIR } from './proof-maps.ts';

const builder = await createBuilder({ build: { sourcemap: 'hidden' } });
await builder.buildApp();

rmSync(PROOF_MAPS_DIR, { recursive: true, force: true });
const moved = moveMaps(OUTPUT_DIR, PROOF_MAPS_DIR);
const left = findMaps(OUTPUT_DIR);
if (moved.length === 0 || left.length > 0) {
  console.error(
    `build:proof: ${moved.length} maps moved, ${left.length} left in ${OUTPUT_DIR} (expected some moved and none left)`,
  );
  process.exit(1);
}
console.log(
  `build:proof: ${moved.length} source map files moved to ${PROOF_MAPS_DIR}/, none left in ${OUTPUT_DIR}/`,
);
