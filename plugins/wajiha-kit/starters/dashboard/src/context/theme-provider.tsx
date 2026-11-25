import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import {
  applyThemeToDocument,
  DEFAULT_PRESET,
  DENSITY_KEY,
  MODE_KEY,
  PRESET_KEY,
  readStored,
  readStoredDensity,
  readStoredMode,
  resolveTheme,
  systemPrefersDark,
  writeStored,
  type Density,
  type ResolvedTheme,
  type ThemeMode,
} from '@/lib/theme';

interface ThemeContextValue {
  /** What is painted now: light or dark. */
  theme: ResolvedTheme;
  /** What the user chose: light, dark or system (follow the OS). */
  mode: ThemeMode;
  preset: string;
  density: Density;
  /** Explicit light/dark choice from a toggle. */
  setTheme: (theme: ResolvedTheme) => void;
  setMode: (mode: ThemeMode) => void;
  setPreset: (preset: string) => void;
  setDensity: (density: Density) => void;
  mounted: boolean;
}

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

const TRANSITION_DURATION = 220;
const TRANSITION_EASING = 'cubic-bezier(0.4, 0, 0.9, 1)';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readInitialPreset(): string {
  if (typeof document === 'undefined') {
    return DEFAULT_PRESET;
  }
  // theme-init.js already validated and applied the stored preset.
  return (
    document.documentElement.dataset.preset ??
    readStored(PRESET_KEY) ??
    DEFAULT_PRESET
  );
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark);
  const [preset, setPresetState] = useState<string>(readInitialPreset);
  const [density, setDensityState] = useState<Density>(readStoredDensity);
  const [mounted, setMounted] = useState(false);

  const theme = resolveTheme(mode, systemDark);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Follow the OS while the mode is `system`.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent): void => {
      setSystemDark(event.matches);
    };
    query.addEventListener('change', onChange);
    return () => {
      query.removeEventListener('change', onChange);
    };
  }, []);

  useLayoutEffect(() => {
    applyThemeToDocument(theme, preset, density);
  }, [theme, preset, density]);

  const setMode = useCallback((next: ThemeMode) => {
    // Only an explicit choice is persisted; the default is never written.
    writeStored(MODE_KEY, next);
    const doc = document as DocumentWithViewTransition;

    if (!doc.startViewTransition || prefersReducedMotion()) {
      setModeState(next);
      return;
    }

    const root = document.documentElement;
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    root.style.setProperty('--vt-x', `${x}px`);
    root.style.setProperty('--vt-y', `${y}px`);
    root.style.setProperty('--vt-r', `${Math.hypot(x, y)}px`);
    root.style.setProperty('--vt-duration', `${TRANSITION_DURATION}ms`);
    root.style.setProperty('--vt-easing', TRANSITION_EASING);
    root.dataset.themeSwitching = '';

    const transition = doc.startViewTransition(() => {
      flushSync(() => {
        setModeState(next);
      });
      applyThemeToDocument(
        resolveTheme(next, systemPrefersDark()),
        root.dataset.preset ?? DEFAULT_PRESET,
        root.dataset.density === 'compact' ? 'compact' : 'comfortable',
      );
    });

    const clear = (): void => {
      delete root.dataset.themeSwitching;
    };
    void transition.finished.then(clear, clear);
  }, []);

  const setTheme = useCallback(
    (next: ResolvedTheme) => {
      setMode(next);
    },
    [setMode],
  );

  const setPreset = useCallback((next: string) => {
    writeStored(PRESET_KEY, next);
    setPresetState(next);
  }, []);

  const setDensity = useCallback((next: Density) => {
    writeStored(DENSITY_KEY, next);
    setDensityState(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode,
      preset,
      density,
      setTheme,
      setMode,
      setPreset,
      setDensity,
      mounted,
    }),
    [
      theme,
      mode,
      preset,
      density,
      setTheme,
      setMode,
      setPreset,
      setDensity,
      mounted,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return ctx;
}
