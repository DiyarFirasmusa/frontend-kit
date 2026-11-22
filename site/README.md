# frontend-kit website

The public site of the plugin: Astro (static), Three.js, English at `/` and Arabic at `/ar/`.
It is not part of the plugin and is not installed into projects.

```bash
cd site
npm ci
npm run dev        # http://localhost:4321/
npm run check      # types
npm test           # scene geometry and timeline
npm run build      # site/dist
```

Building needs `bash`, `git` and `jq`: the gate demo runs the plugin's real `guard-bash.sh` and prints what it answers.

## Deploy (Vercel)

Live: https://frontend-kit-tan.vercel.app (project `frontend-kit`, connected to `main`).

Import the repository with **Root Directory** set to `site`, and keep "Include source files outside of the Root Directory"
on: the build reads `../plugins` and `../examples`. `vercel.json` holds the rest. Pushes to `main` then publish.
Canonical links use Vercel's production domain, or `SITE_URL` when it is set (for a custom domain).

## How it stays true to the plugin

- Counts, version, rule files and hook events are read from `../plugins/frontend-kit` at build time.
- The build fails when a skill, agent, hook event or rule group exists in the plugin but has no copy here (or the reverse).
  Add the sentence in both languages in `src/content/catalogue.ts` or `src/content/*-details.ts`.
- Prose claims (why, features, questions) are written by hand. Review them when the plugin's behaviour changes.

## Where things are

| Path | What |
| ---- | ---- |
| `src/content/` | all copy, one file per language |
| `src/components/chapters/` | one component per chapter of the page |
| `src/scene/*.ts` | formations: plain functions that return parts, shared by WebGL and the SVG posters |
| `src/scene/renderer.ts` | one instanced draw call for every part |
| `src/client/` | page interactions |
| `src/styles/` | tokens, shell, then one file per group of chapters |

A new chapter is a `<section data-chapter data-world="...">`. Give it a `<Slot stage="...">` and the kit flies into it.

Motion follows `prefers-reduced-motion` and has a pause button. Without JavaScript or WebGL the page shows still posters.
`public/og.jpg` is a 1200 x 630 screenshot of the hero.
