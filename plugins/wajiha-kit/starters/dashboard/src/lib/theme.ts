/**
 * Theme state shared by the pre-paint script (public/theme-init.js) and the
 * React provider (context/theme-provider.tsx). The two must agree on the
 * storage keys below; theme.test.ts checks that.
 *
 * mode    light | dark | system   (default: system = follow the OS)
 * preset  a `data-preset` id from src/style/tokens/presets
 * density comfortable | compact
 */

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export type Density = 'comfortable' | 'compact';

export const MODE_KEY = 'app-theme';
export const PRESET_KEY = 'app-preset';
export const DENSITY_KEY = 'app-density';

export const DEFAULT_MODE: ThemeMode = 'system';
export const DEFAULT_PRESET = 'neutral';
export const DEFAULT_DENSITY: Density = 'comfortable';

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function isDensity(value: unknown): value is Density {
  return value === 'comfortable' || value === 'compact';
}

/** Storage can throw (private windows, blocked cookies); every access is wrapped. */
export function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Not persisted: the choice still applies for this visit.
  }
}

export function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

export function resolveTheme(
  mode: ThemeMode,
  systemDark: boolean,
): ResolvedTheme {
  if (mode === 'system') {
    return systemDark ? 'dark' : 'light';
  }
  return mode;
}

export function readStoredMode(): ThemeMode {
  const stored = readStored(MODE_KEY);
  return isThemeMode(stored) ? stored : DEFAULT_MODE;
}

export function readStoredDensity(): Density {
  const stored = readStored(DENSITY_KEY);
  return isDensity(stored) ? stored : DEFAULT_DENSITY;
}

/** Writes the document attributes the token CSS reads. */
export function applyThemeToDocument(
  theme: ResolvedTheme,
  preset: string,
  density: Density,
): void {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.dataset.preset = preset;
  root.dataset.density = density;
}
