import type { Preset } from '../types.ts';
import { neutral } from './neutral.ts';
import { ocean } from './ocean.ts';

/** Add a preset here and run `npm run tokens`; the default is the first one. */
export const PRESETS: readonly Preset[] = [neutral, ocean];

export const DEFAULT_PRESET_ID = neutral.id;
