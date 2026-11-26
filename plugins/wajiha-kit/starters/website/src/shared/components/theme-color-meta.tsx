import { SITE } from '@/config/site.config';

/**
 * The browser toolbar colour, one tag per colour scheme. It lives here, written by the root document, and not
 * in the root route's head(): TanStack Router keeps one meta per `name`, so two `theme-color` entries in
 * head() lose the light one (every page shipped the dark colour only). `site.config.test.ts` ties the two
 * values to the palette, `src/routing.test.ts` keeps head() free of `theme-color`, and
 * `e2e/raw/seo.spec.ts` checks both tags on every page.
 */
export function ThemeColorMeta() {
  return (
    <>
      <meta
        name="theme-color"
        content={SITE.themeColor.light}
        media="(prefers-color-scheme: light)"
      />
      <meta
        name="theme-color"
        content={SITE.themeColor.dark}
        media="(prefers-color-scheme: dark)"
      />
    </>
  );
}
