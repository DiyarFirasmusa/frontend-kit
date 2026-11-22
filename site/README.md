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

## How the home page works

The page is complete as plain HTML: each scene is copy beside a still frame, then its explanation as a list of
moments (`src/lib/moments.ts`), each linking to its documentation. When the device can play it, the same markup becomes
a film pinned to the scroll (`html.film`): the moments take each other's place inside the scene, a name flies out of the
object the stage lit (`src/client/film-moments.ts`), and the bar at the foot counts the chapters
(`src/content/guide/tour.ts`).

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
| `src/client/measure.ts` | reads where each explanation and stop sits, so the timeline follows the content |
| `src/film/focus.ts` | where the camera looks for each stop |
| `src/components/film/`, `src/components/tour/` | the scenes, the guide bar and the explanations inside the scroll |

`public/stills/<shape>.jpg` (1000 x 620) and `public/og.jpg` (1200 x 630) are screenshots of the film. Take them again
after changing a shape, shot or grade.
