# Wajiha Kit website

The public site of the plugin: Astro (static), English at `/` and Arabic at `/ar/`. Live at https://www.wajihakit.com.
It is not part of the plugin and is not installed into projects.

```bash
cd site
npm ci
npm run dev        # http://localhost:4321/
npm run check      # types (must stay at 0 errors)
npm run build      # site/dist
npm run og         # share images, after a build (needs Chrome)
```

Building needs `bash`, `git` and `jq`: the safety-check demo runs the plugin's real `guard-bash.sh` and prints what it
answers.

## Deploy (Vercel)

Vercel project `wajiha-kit`, connected to `main`: a push publishes. `wajihakit.com` redirects to `www.wajihakit.com`.

Import the repository with **Root Directory** set to `site`, and keep "Include source files outside of the Root Directory"
on: the build reads `../plugins` and `../examples`. `vercel.json` holds the rest. Canonical links use
`https://www.wajihakit.com` (or `SITE_URL` when it is set); only `npm run dev` uses `http://localhost:4321`.

## How it stays true to the plugin

- Counts, version, rule files and hook events are read from `../plugins/wajiha-kit` at build time.
- The build fails when the plugin has a skill, agent, rule file, hook event or example project with no copy here (or the
  reverse). What to add, in both languages:

  | Added to the plugin | Add here |
  | ------------------- | -------- |
  | a skill | one line in `src/content/catalogue.ts`, its page in `src/content/guide/skills/<group>.ts`, why and when in `src/content/guide/purpose.ts` |
  | an agent | one line in `src/content/catalogue.ts`, its page in `src/content/guide/agents.ts`, why and when in `src/content/guide/purpose.ts` |
  | a rule file | `src/content/guide/rules.ts` and `purpose.ts` (a new folder also needs a name in `src/content/*-details.ts`) |
  | a hook event | `src/content/*-details.ts` and `src/content/guide/checks.ts` and `purpose.ts` |
  | an example project | `src/content/guide/examples.ts` |

- Prose claims are written by hand. Review them when the plugin's behaviour changes: the pages say what the kit does
  today (for example "known risky commands", "updates are off after setup"), and the setup questions say the setup is
  being updated until the next version ships.

## Words

Every sentence is a pair: `t('English', 'العربية')` in `src/content/**`. Rules for the words: plain language for people who
do not code, one name per thing (kit, specialist, safety check, reviewer, backend), no prices, and the only person named
is Diyar Firas with his GitHub link. A Latin word inside Arabic text is wrapped in the isolate marks `⁦ … ⁩`.

## Pages

`src/pages/[...path].astro` builds every route in both languages from `src/lib/routes.ts`: the home page, the topic
pages (`src/content/guide/pages.ts`), and one page per skill, agent, rule file and hook event. The topic pages are
components in `src/components/pages/`. A new topic page is an entry in `PAGES`, a place in `SECTIONS` and a component in
`BODIES` (the rights, privacy and terms pages share `Legal.astro` and live in `src/content/guide/legal.ts`).

Each skill, agent, rule and check says why it exists and when it applies (`src/content/guide/purpose.ts`), then shows
the plugin's own file in full, read at build time (`src/content.config.ts`, `src/lib/reference.ts`).

## Scripts and styles

`src/client/app.ts` starts the scripts on every page load (each in its own `try`, with one `AbortSignal` that ends them
on the next navigation).

The 16 CSS files in `src/styles/` are imported in this order by `src/layouts/Layout.astro`, and a later file wins:

| File | Owns |
| ---- | ---- |
| `tokens.css`, `base.css` | colours, type, spacing, resets |
| `header.css`, `details.css`, `guide.css`, `doc.css`, `stage.css` | the header, small components, the guide's blocks, the document layout |
| `home.css`, `colour.css`, `rounded.css`, `motion.css`, `identity.css` | the home page, then the orange / turquoise identity, radii and motion passes over it |
| `chat.css`, `sections.css`, `loops.css` | the chat window, the home sections, the loops that run only on screen (`data-alive`) |
| `docs-space.css` | the guide's dark frame, footer, accessibility and last overrides |

When you change a rule, search the later files for the same selector first.

## Share images

`npm run og` (after `npm run build`) runs Chrome on `design/og/og.html` and writes the share images: `public/og.jpg`,
`public/og-ar.jpg` and one `public/og/<page>[-ar].jpg` per guide page (title, words and section colour read from the built
page), plus copies in `../brand/cover/`. Set `CHROME` to the browser's path if it is not found.
