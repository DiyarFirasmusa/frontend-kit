export type ThemeChoice = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

/**
 * Runs in <head> before the first paint, so a saved choice never flashes the other theme.
 * No choice saved: the system setting decides (tokens.css), so nothing is set here.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

/** What the page shows now: the `data-theme` attribute if set, otherwise the system setting. */
function currentTheme(): ThemeChoice {
  const attribute = document.documentElement.getAttribute('data-theme');
  if (attribute === 'light' || attribute === 'dark') {
    return attribute;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Switches to the other theme and remembers it. The `data-theme` attribute on <html> is the only state (CSS and
 * the init script read it), so there is no store to keep in step with it.
 */
export function toggleTheme(): void {
  const next: ThemeChoice = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Private mode or blocked storage: the choice just lasts for this visit.
  }
}
