# Wajiha website

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

Live: https://frontend-kit-tan.vercel.app (project `wajiha-kit`, connected to `main`).

Import the repository with **Root Directory** set to `site`, and keep "Include source files outside of the Root Directory"
on: the build reads `../plugins` and `../examples`. `vercel.json` holds the rest. Pushes to `main` then publish.
Canonical links use Vercel's production domain, or `SITE_URL` when it is set (for a custom domain).

## How it stays true to the plugin

- Counts, version, rule files and hook events are read from `../plugins/wajiha-kit` at build time, and the 3D shapes
  are counted from the same numbers (a plate per skill, a guardian per agent, a ring per hook event).
- The build fails when the plugin has a skill, agent, rule file, hook event or example project with no copy here (or the
  reverse). What to add, in both languages:

  | Added to the plugin | Add here |
  | ------------------- | -------- |
  | a skill | one line in `src/content/catalogue.ts`, its page in `src/content/guide/skills/<group>.ts`, why and when in `src/content/guide/purpose.ts` |
  | an agent | one line in `src/content/catalogue.ts`, its page in `src/content/guide/agents.ts`, why and when in `src/content/guide/purpose.ts` |
  | a rule file | `src/content/guide/rules.ts` and `purpose.ts` (a new folder also needs a name in `src/content/*-details.ts`) |
  | a hook event | `src/content/*-details.ts` and `src/content/guide/checks.ts` and `purpose.ts` |
  | an example project | `src/content/guide/examples.ts` |

- Prose claims are written by hand. Review them when the plugin's behaviour changes.

## The documentation

`/docs/` indexes everything. `src/pages/[...path].astro` builds every route in both languages from `src/lib/routes.ts`:
the home page, the topic pages (`src/content/guide/pages.ts`), and one page per skill, agent, rule file and hook event.
Each of those says why it exists and when it applies (`src/content/guide/purpose.ts`), then shows the plugin's own file
in full, read at build time (`src/content.config.ts`, `src/lib/reference.ts`). Skills bundled from other projects
(`THIRD_PARTY_NOTICES.md`) are described and linked, not copied.

A new topic page is an entry in `PAGES`, a place in `SECTIONS` and a component in `BODIES`. Only the home page loads
Three.js.

## The one stage

Every page stands on the same WebGL stage (`src/components/stage/Stage.astro`). Astro's client router keeps it between
pages, so the blocks fly from one page's shape to the next. Switching language reloads: the stage is built for one
direction.

Without JavaScript or WebGL 2, under reduced motion, with data saver, at 2 GB of memory or less, or when WebGL runs in
software, every page is complete plain HTML with a still frame. While it plays, a governor lowers the resolution and
then the effects. The pause button switches between the two.

On the home page each `[data-stage-shape]` under `[data-score]` is a cue. The scroll between two cues is the change
itself: shape and words are played from one eased position (`src/client/stage/score.ts`), in both directions.

Dragging turns the shape. Pressing it blows it apart, and pressing an object on an overview opens what it names.

| Path | What |
| ---- | ---- |
| `src/content/emblems.ts` | which sign each skill, agent, rule file, hook and page has |
| `src/film/shapes/emblems/signs.ts` | the signs, drawn with a few pencils (`draw.ts`) and built out of blocks (`build.ts`) |
| `src/film/shapes/` | the other shapes: plain functions, covered by `npm test` |
| `src/film/direction.ts` | camera shots, light and how blocks fly |
| `src/film/render/` | the instanced mesh, set, camera and lens |
| `src/client/stage/` | the stage, its score, flights and what can be pressed |
| `src/components/home/`, `src/components/docs/` | the home page and the tree of the documentation |
| `src/styles/motion.css`, `src/client/reveal.ts` | how everything else moves; none of it under reduced motion |

A new skill, agent, rule file or hook event also needs a sign in `src/content/emblems.ts`: the build says which is
missing.

`public/stills/<shape>.jpg` (1000 x 620) and `public/og.jpg` (1200 x 630) are screenshots of the stage.
