import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ThemeProvider, useTheme } from './theme-provider';

function Probe() {
  const { theme, mode, preset, setTheme, setMode, setPreset } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="mode">{mode}</span>
      <span data-testid="preset">{preset}</span>
      <button
        type="button"
        onClick={() => {
          setTheme('light');
        }}
      >
        to light
      </button>
      <button
        type="button"
        onClick={() => {
          setMode('system');
        }}
      >
        to system
      </button>
      <button
        type="button"
        onClick={() => {
          setPreset('ocean');
        }}
      >
        to ocean
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
}

interface FakeMedia {
  matchesDark: boolean;
  listeners: Set<(event: MediaQueryListEvent) => void>;
}

/** Replaces matchMedia so prefers-color-scheme can be driven by a test. */
function mockColourScheme(dark: boolean): FakeMedia {
  const fake: FakeMedia = { matchesDark: dark, listeners: new Set() };
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-color-scheme: dark')
      ? fake.matchesDark
      : false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (_: string, fn: (event: MediaQueryListEvent) => void) => {
      fake.listeners.add(fn);
    },
    removeEventListener: (
      _: string,
      fn: (event: MediaQueryListEvent) => void,
    ) => {
      fake.listeners.delete(fn);
    },
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  return fake;
}

const originalMatchMedia = window.matchMedia;

function reset(): void {
  window.localStorage.clear();
  const root = document.documentElement;
  root.classList.remove('dark');
  delete root.dataset.preset;
  delete root.dataset.density;
  window.matchMedia = originalMatchMedia;
}

beforeEach(reset);
afterEach(reset);

describe('ThemeProvider', () => {
  it('follows the OS (light here) when nothing is stored', () => {
    mockColourScheme(false);
    renderProvider();
    expect(screen.getByTestId('mode')).toHaveTextContent('system');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('follows the OS (dark) when nothing is stored', () => {
    mockColourScheme(true);
    renderProvider();
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('reacts to an OS change while the mode is system', () => {
    const media = mockColourScheme(false);
    renderProvider();
    act(() => {
      media.matchesDark = true;
      for (const listener of media.listeners) {
        listener({ matches: true } as MediaQueryListEvent);
      }
    });
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('persists an explicit choice and toggles the dark class', () => {
    mockColourScheme(true);
    renderProvider();
    fireEvent.click(screen.getByRole('button', { name: 'to light' }));
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(window.localStorage.getItem('app-theme')).toBe('light');
  });

  it('never writes the default on a first visit', () => {
    renderProvider();
    expect(window.localStorage.getItem('app-theme')).toBeNull();
    expect(window.localStorage.getItem('app-preset')).toBeNull();
  });

  it('lets a stored choice win over the OS and over the class on <html>', () => {
    mockColourScheme(false);
    window.localStorage.setItem('app-theme', 'dark');
    renderProvider();
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('can return to system after an explicit choice', () => {
    mockColourScheme(false);
    window.localStorage.setItem('app-theme', 'dark');
    renderProvider();
    fireEvent.click(screen.getByRole('button', { name: 'to system' }));
    expect(screen.getByTestId('mode')).toHaveTextContent('system');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('applies and stores a preset on <html>', () => {
    renderProvider();
    expect(document.documentElement.dataset.preset).toBe('neutral');
    fireEvent.click(screen.getByRole('button', { name: 'to ocean' }));
    expect(document.documentElement.dataset.preset).toBe('ocean');
    expect(window.localStorage.getItem('app-preset')).toBe('ocean');
  });

  it('ignores an invalid stored mode', () => {
    window.localStorage.setItem('app-theme', 'purple');
    renderProvider();
    expect(screen.getByTestId('mode')).toHaveTextContent('system');
  });
});
