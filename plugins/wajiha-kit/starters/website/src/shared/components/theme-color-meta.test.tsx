import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SITE } from '@/config/site.config';
import { ThemeColorMeta } from './theme-color-meta';

describe('ThemeColorMeta', () => {
  it('writes both theme-color tags, one per colour scheme, in the server HTML', () => {
    const html = renderToStaticMarkup(<ThemeColorMeta />);
    const tags = [...html.matchAll(/<meta [^>]*>/g)].map((match) => match[0]);
    expect(tags).toHaveLength(2);
    expect(tags[0]).toContain('name="theme-color"');
    expect(tags[0]).toContain(`content="${SITE.themeColor.light}"`);
    expect(tags[0]).toContain('media="(prefers-color-scheme: light)"');
    expect(tags[1]).toContain(`content="${SITE.themeColor.dark}"`);
    expect(tags[1]).toContain('media="(prefers-color-scheme: dark)"');
  });
});
