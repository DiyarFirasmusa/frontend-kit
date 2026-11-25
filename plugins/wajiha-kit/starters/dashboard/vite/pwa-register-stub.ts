/** Stands in for `virtual:pwa-register` when the PWA module is off. */
export function registerSW(): () => Promise<void> {
  return () => Promise.resolve();
}
