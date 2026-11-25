/* Runs in <head> before first paint so the page never flashes the wrong theme,
   preset, direction or language. It is an external classic script on purpose:
   a strict CSP (script-src 'self') blocks inline scripts.
   Keep in sync with src/lib/theme.ts (storage keys) and src/lib/i18n/languages.ts
   (RTL codes); src/lib/theme.test.ts fails when they drift. */
(function () {
  var root = document.documentElement;
  var RTL = ['ar', 'fa', 'he', 'ku', 'ps', 'ur'];

  function read(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  var mode = read('app-theme');
  if (mode !== 'light' && mode !== 'dark' && mode !== 'system') {
    mode = 'system';
  }
  var dark =
    mode === 'dark' ||
    (mode === 'system' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', dark);

  var preset = read('app-preset');
  root.dataset.preset =
    preset && /^[a-z0-9-]+$/.test(preset) ? preset : 'neutral';

  var density = read('app-density');
  root.dataset.density = density === 'compact' ? 'compact' : 'comfortable';

  var match = /(?:^|;\s*)lng=([a-z-]+)/i.exec(document.cookie);
  var lang = match ? match[1].toLowerCase() : 'ar';
  root.setAttribute('lang', lang);
  root.setAttribute(
    'dir',
    RTL.indexOf(lang.split('-')[0]) === -1 ? 'ltr' : 'rtl',
  );
})();
