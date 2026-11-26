import { beforeEach, describe, expect, it, vi } from 'vitest';
import { THEME_INIT_SCRIPT, THEME_STORAGE_KEY, toggleTheme } from './theme';

function setSystemDark(dark: boolean): void {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query) => ({ matches: dark, media: query }) as MediaQueryList,
  );
}

describe('toggleTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
  });

  it('follows the system until the visitor chooses: nothing is set before the first toggle', () => {
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('toggles from the system theme to the other one and remembers it', () => {
    setSystemDark(true);
    toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('toggles back and forth from an explicit choice', () => {
    setSystemDark(false);
    toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('still works when storage is blocked', () => {
    setSystemDark(false);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => toggleTheme()).not.toThrow();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

describe('THEME_INIT_SCRIPT', () => {
  it('applies a saved choice and ignores anything else', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    new Function(THEME_INIT_SCRIPT)();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem(THEME_STORAGE_KEY, '<script>');
    new Function(THEME_INIT_SCRIPT)();
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});
