import { create } from 'zustand';

export type ThemeChoice = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

/**
 * Runs in <head> before the first paint, so a saved choice never flashes the other theme.
 * No choice saved: the system setting decides (src/style/preset.css), so nothing is set here.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

type ThemeState = {
  /** The visitor's saved choice. undefined = follow the system. */
  choice: ThemeChoice | undefined;
  /** Reads what the page currently shows and switches to the other theme. */
  toggle: () => void;
};

function currentTheme(): ThemeChoice {
  const attribute = document.documentElement.getAttribute('data-theme');
  if (attribute === 'light' || attribute === 'dark') {
    return attribute;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useThemeStore = create<ThemeState>((set) => ({
  choice: undefined,
  toggle: () => {
    const next: ThemeChoice = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode or blocked storage: the choice just lasts for this visit.
    }
    set({ choice: next });
  },
}));
