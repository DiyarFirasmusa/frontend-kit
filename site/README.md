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

- Counts, version, rule files and hook events are read from `../plugins/frontend-kit` at build time, and the 3D shapes
  are counted from the same numbers (a plate per skill, a guardian per agent, a ring per hook event).
- The build fails when a skill, agent, hook event or rule group exists in the plugin but has no copy here (or the reverse).
  Add the sentence in both languages in `src/content/catalogue.ts` or `src/content/*-details.ts`.
- Prose claims are written by hand. Review them when the plugin's behaviour changes.

## How the page works

The page is complete as plain HTML: each scene is copy beside a still frame, then the detail chapters. When the device
can play it, the same markup becomes a film pinned to the scroll (`html.film`).

It stays on the still page without JavaScript or WebGL 2, under reduced motion, with data saver, at 2 GB of memory or
less, and when WebGL runs in software. While it plays, a governor lowers the resolution and then the effects; if the
film is still unusable it returns to the still page. The pause button switches between the two.

| Path | What |
| ---- | ---- |
| `src/content/scenes.ts` | the edit: order, shape, and how long each scene holds and travels, in screens of scroll |
| `src/content/` | all copy, one file per language |
| `src/film/shapes/` | each scene as a list of blocks: plain functions, covered by `npm test` |
| `src/film/direction.ts` | camera shots, light and how blocks fly |
| `src/film/render/` | the instanced mesh, set, camera and lens |
| `src/client/player.ts` | maps scroll to the film; `film-copy.ts` and `film-labels.ts` move the words |
| `src/components/film/`, `src/components/details/` | the scenes, and the chapters under them |

`public/stills/<shape>.jpg` (1000 x 620) and `public/og.jpg` (1200 x 630) are screenshots of the film. Take them again
after changing a shape, shot or grade.
