/**
 * Writes src/style/theme.css and src/style/preset.css from src/style/tokens.
 * Run with `npm run tokens` (Node 22.18+ runs TypeScript files directly).
 * `tokens.test.ts` fails when the committed CSS is out of date.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  generatePreset,
  generateTheme,
} from '../src/style/tokens/generate-css.ts';

const out = (name: string): string =>
  fileURLToPath(new URL(`../src/style/${name}`, import.meta.url));

writeFileSync(out('theme.css'), generateTheme());
writeFileSync(out('preset.css'), generatePreset());
console.log('wrote src/style/theme.css and src/style/preset.css');
