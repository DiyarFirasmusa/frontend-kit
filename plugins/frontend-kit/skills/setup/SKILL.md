---
name: setup
description: Install frontend-kit's project files into the current project — CLAUDE.md, .claude/rules/, .claude/settings.json and .claude/frontend-kit.json. Asks first whether it is a new project, an existing one or a refactor, then the kind of React project (website, dashboard or any React app), and adapts the rules to the detected stack. Run with /frontend-kit:setup.
disable-model-invocation: true
---

# frontend-kit setup

Plugins can't load CLAUDE.md, rules or most settings, so this copies them into the project.
Skills, agents, hooks and MCP servers already come from the plugin; nothing of those is copied.

Templates live in `${CLAUDE_PLUGIN_ROOT}/templates/`:
`shared/rules/` (every profile) and `<profile>/` (`CLAUDE.md`, `rules/`, `settings.json`, `frontend-kit.json`),
where `<profile>` is `website`, `dashboard`, `react` (stack-neutral) or `fullstack` (site + admin in one tree).

## 1. Ask

The flow is: ask (1) → detect (2) → **proposal the user approves (3)** → copy and adapt (4–5) → clean up (6) → finish (7).

Ask in this order. The first two are the user's own answers: detection only pre-selects an option, never decides.

**Question 1: what are we doing?** (one question, three options)

| Answer | Meaning | Sets |
| ------ | ------- | ---- |
| New project | Nothing or almost nothing exists yet; build to the standards from the first file | `"mode": "new"` |
| Existing project | Add the kit to a working project; keep its structure, follow its stack | `"mode": "existing"` |
| Refactor | An existing project the user wants restructured to the standards (phased, behaviour frozen) | `"mode": "refactor"` |

For *New project* with no `package.json`: ask which framework (Vite, Next.js, TanStack Start, React Router, other)
and offer to run that framework's official create command; run it only after the user says yes. Then continue.
For Next.js answer *yes* to the `src/` directory prompt: the kit's layout is all under `src/`. When the user already said
they want a dashboard, the framework question here is question 2b, asked once.
For *Refactor*: after setup, tell the user to run `/frontend-kit:refactor-mode audit` (setup does not restructure anything).

**Question 2: what kind of React project?** (the user answers; show what you detected as the first option)

| Answer | Profile | Fits |
| ------ | ------- | ---- |
| Website (SSR, SEO, public pages) | `website` | TanStack Start rules and skills (`web-*`) |
| Dashboard / admin app | `dashboard` | TanStack Table, Query and permission rules and skills (`dash-*`); the router part depends on question 2b |
| Website **and** dashboard in one project | `fullstack` | Two apps in one tree (for example a TanStack Start site with an admin under `src/admin`); each app gets its own rules, skills and checks |
| Any other React app | `react` | Stack-neutral rules; the kit adapts to the stack it detects |

Detection only suggests: `@tanstack/react-start` suggests website; `vite` + `@tanstack/react-router` suggests
dashboard; everything else (Next.js, CRA, Remix, React Router, Expo web, …) suggests `react`. A Next.js or
TanStack Start project can be a dashboard too: the user's answer decides, then question 2b.

**Question 2b (only for `dashboard`): which framework?** Pre-select what was detected; a new project with nothing
detected defaults to the first row.

| Answer | `dashboard` variant | `stack.framework` | What changes |
| ------ | ------------------- | ----------------- | ------------ |
| Vite SPA (TanStack Router) | none (the base template) | `Vite` | file routes, `beforeLoad` guards, loaders, generated `routeTree.gen.ts` |
| TanStack Start (SPA mode) | `tanstack-start` | `TanStack Start` | same router and guards; adds the Start shell, `getRouter()`, `spa.enabled`, SSR-safe module code (`rules/framework.md`) |
| Next.js (App Router) | `next` | `Next.js` | `app/` pages, `proxy.ts` + layout guards, zod over `useSearchParams`, no loaders, `@sentry/nextjs` |

The variant only replaces the router-bound parts; every other dashboard rule and skill (tables, forms, permissions,
API layer, filters) is the same. The variant's files live in `templates/dashboard/variants/<variant>/`.

For `fullstack` also ask, in the same message as the values: the admin's code folder (`{{ADMIN_DIR}}`, default `src/admin`),
its route folder (`{{ADMIN_ROUTES}}`, default `src/routes/admin`) and URL prefix (`{{ADMIN_PATH}}`, default `/admin`),
the site's route folder (`{{SITE_ROUTES}}`, default `src/routes/_site`), and the API base env name of each app
(`{{API_BASE_ENV}}` for the site, `{{ADMIN_API_BASE_ENV}}`). Per-app commands (`i18nValidate`, `relatedTests`) are
filled only when the app has its own; otherwise leave them empty and the project's command is used.

**Then one message for the project values**, defaults filled in, the user confirms or edits:

| Value | Default from |
| ----- | ------------ |
| `{{PROJECT_NAME}}` | package.json `name` |
| `{{PROJECT_DESCRIPTION}}` | package.json `description` |
| `{{GITHUB_REPO}}` | `git remote get-url origin` → `owner/name` |
| `{{DEFAULT_BRANCH}}` | `git symbolic-ref refs/remotes/origin/HEAD` → `main` |
| `{{PROTECTED_BRANCHES}}` | `main, master` |
| `{{LIVE_HOST}}` | ask (production host, never tested against); may be empty |
| `{{UAT_HOST}}` | ask (test environment); may be empty |
| `{{DEV_PORT}}` | the dev script's `--port`, else the framework default |
| `{{E2E_PORT}}` | `playwright.config.*` / `cypress.config.*` port, else 3100 |
| `{{API_BASE_ENV}}` | the `VITE_*` / `NEXT_PUBLIC_*` / server env name for the API base URL in `.env.example` |

Never read `.env` or `.env.local` to find a value; `.env.example` only.

## 2. Detect the stack (every profile)

Run `"${CLAUDE_PLUGIN_ROOT}/scripts/kit-detect-stack.sh"` in the project: it prints the stack, `srcDirs`, the dev port, the
typecheck and related-tests commands and what is missing, as JSON, from `package.json`, the lockfile and the config
files (no installs, no `.env`). Read what it prints, show it in the same confirmation message, and let the user correct it.
The table below is what it looks at. These values are what the hooks and the rules adapt to:

| Field in `frontend-kit.json` | Detected from |
| ---------------------------- | ------------- |
| `stack.packageManager` (`{{PACKAGE_MANAGER}}`, `{{PM_RUN}}`) | `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `bun.lock(b)` → bun, else npm (`npm run`, `pnpm`, `yarn`, `bun run`) |
| `stack.framework`, `stack.router` | `next`, `@tanstack/react-start`, `@remix-run/*`/`react-router`, `vite`, `react-scripts`, `expo` |
| `stack.data` | `@tanstack/react-query`, `swr`, `@reduxjs/toolkit`, `@apollo/client`, `urql`, else "fetch hooks" |
| `stack.state` | `zustand`, `redux`/`@reduxjs/toolkit`, `jotai`, `recoil`, `mobx`, else "React state" |
| `stack.styling` | `tailwindcss`, `styled-components`, `@emotion/*`, `@mui/*`, CSS modules (`*.module.css`), `sass` |
| `stack.tests`, `stack.e2e` | `vitest`, `jest`; `@playwright/test`, `cypress` |
| `stack.lint`, `stack.format` | `oxlint`, `eslint`, `@biomejs/biome`; `oxfmt`, `prettier`, `@biomejs/biome` |
| `stack.i18n` | `i18next`/`react-i18next`, `next-intl`, `react-intl`/`@formatjs/*`, else none |
| `srcDirs` (`{{SRC_DIR}}`) | the folders that exist: `src`, `app`, `pages`, `components`, `lib`, `packages/*/src` |
| `commands.typecheck` | the `typecheck` script if any, else `<pm> exec tsc --noEmit` when `typescript` is installed |
| `commands.relatedTests` | `npx vitest related --run --passWithNoTests` or `npx jest --findRelatedTests --passWithNoTests` |
| `commands.i18nValidate` | only when the project has an i18n validator script; otherwise leave it out |

Also note, for the proposal: **no test runner found** (suggest adding Vitest, never install it unasked), **no type
checker**, **no linter/formatter**; an `AGENTS.md` (Next.js 16 writes one) is imported from `CLAUDE.md` with a line
`@AGENTS.md`, never copied or replaced.

Leave a field out (never invent a value) when nothing was found. `commands.lintFile` and `commands.formatFile` are
left unset: the hooks find oxlint, eslint, biome, oxfmt or prettier by themselves.

## 3. Proposal: the list the user approves

Before any file is written, send **one message** with everything setup is about to do, and wait for the user's yes
(or edits). Nothing is copied, merged or moved until they answer.

1. **What it is:** mode (new / existing / refactor), profile, and the detected stack, as the user confirmed them.
2. **Files it will create or merge**, one line each (`CLAUDE.md`, each rule, `settings.json`, `frontend-kit.json`,
   script additions to `package.json`, config files only when the project has none).
3. **Adaptations to the stack**: each sentence it will rewrite or drop in the copied rules and settings (section 4).
4. **What it will clean up** (the user's Claude config, trimmed to this project):
   - run `"${CLAUDE_PLUGIN_ROOT}/scripts/kit-prune.sh" <profile>` (a dry run, it changes nothing) and list its
     `REMOVE`, `EDITED` and `YOURS` lines: rules left over from another profile (website rules in a dashboard, …);
   - the skills that do not fit the profile get a `Skill(frontend-kit:<name>)` deny rule in `settings.json` (the
     template already lists them): Claude can no longer run them, and `skill-suggest` stops proposing them. They still
     appear in Claude's skill list (a deny rule blocks use, it does not hide the entry; verified);
   - permission rules for tools the project does not use, and duplicate kit hooks copied by an older setup.
5. **What it will not touch:** the user's own rules and files (`YOURS`), edited kit rules (unless the user adds them),
   source code, git history.
6. **Refactor mode:** nothing is restructured by setup. The list ends with "next: `/frontend-kit:refactor-mode audit`".

Removal never deletes: `kit-prune.sh --apply` moves files to `.claude/kit-backup/<timestamp>/`, and the message
says how to restore them. For each `EDITED` file ask separately (keep or move).

## 4. Plan the copy

| Source | Target |
| ------ | ------ |
| `templates/<profile>/CLAUDE.md` | `./CLAUDE.md` |
| `templates/shared/rules/*.md` + `templates/<profile>/rules/*.md` | `./.claude/rules/` |
| **dashboard variant** `templates/dashboard/variants/<variant>/` | on top of the two rows above: its `CLAUDE.md` replaces the base one, its `rules/*.md` replace a rule of the same name (`routing.md`, `error-monitoring.md`) or are added (`framework.md`), and its `frontend-kit.json` keys (`stack`, `generatedPaths`) are merged into the base config |
| `templates/<profile>/settings.json` | `./.claude/settings.json` (merge, below) |
| `templates/<profile>/frontend-kit.json` | `./.claude/frontend-kit.json` |
| `"${CLAUDE_PLUGIN_ROOT}/scripts/kit-package-scripts.sh"` (JSON on stdout) | `./package.json` `scripts`: only the names the project lacks, only for tools it really uses (eslint, not oxlint, in a Next.js app); never a script whose tool is missing. `templates/shared/package.scripts.json` is the reference list, not what gets copied |
| `templates/shared/scripts/validate-i18n.ts` | `./scripts/validate-i18n.ts` (only if the project uses the two-level i18next layout and has no i18n validator) |
| `templates/shared/config/.oxlintrc.json`, `.oxfmtrc.json` | `./` (only when the project has **no** linter/formatter at all; never next to eslint, prettier or biome) |
| `templates/shared/style/theme.css` | the profile's theme path, only for a Tailwind project without a theme file; say which fonts it imports |

**`fullstack` rules**: copy `shared/rules/*` and `website/rules/*` as site rules, then run
`"${CLAUDE_PLUGIN_ROOT}/scripts/kit-scope-rules.sh" site <rule> <target> --site-routes {{SITE_ROUTES}}` for each website rule,
and `kit-scope-rules.sh admin <rule> .claude/rules/admin-<name>.md --admin-dir {{ADMIN_DIR}} --admin-routes {{ADMIN_ROUTES}}` for each
dashboard rule. The script rewrites the `paths:` globs so a rule loads only for its own app. Both apps' skills stay
enabled (no `Skill(...)` deny rules): `skill-suggest` tells Claude which app is which.

In every copied file replace each `{{PLACEHOLDER}}` with the confirmed value; a placeholder with no value becomes
an empty string or empty list (drop empty hosts from `liveHosts` and from `sandbox.network.deniedDomains`; with no
live host remove `deniedDomains`). In `frontend-kit.json` set every key the profile template lists, including
`mode`, `profile`, `stack`, `srcDirs`, `commands`, `liveHosts`, `uatHost`, `githubRepo`, `defaultBranch`,
`protectedBranches` (built from the one answer, never the template's default when the user chose others),
`devPort`, `e2ePort` and `apiBaseEnv`. The plugin's skills and agents read these (written `<defaultBranch>`,
`<devPort>`, … in their text).

**Adapt to the stack** (after the copy, before showing the diffs). The rules are principles first, tool names second:
- In `settings.json`: replace `npm`/`npx` in the allow list with the detected package manager; drop allow rules for
  tools the project does not use; the deny rule for the lockfile names the real lockfile; the `Edit(...)` deny rules
  for generated files match `generatedPaths` (`src/routeTree.gen.ts` for Vite and Start, `next-env.d.ts` for Next.js).
- In every copied rule and in `CLAUDE.md`: where the text names a library the project does not use (TanStack Query,
  Tailwind v4, i18next, oxlint, Vitest, …), rewrite that sentence for the detected one or remove it. Keep the principle.
- Delete a copied rule file that cannot apply (for example SSR routing rules in a client-only app, RTL rules in a
  project with one left-to-right language, i18n rules in a project with no i18n) and list what you removed.
- Never invent a convention the project does not follow; when the stack is unclear, keep the neutral wording.
Show the list of adaptations with the diffs and wait for the user's answer.
Order of writes: `.claude/frontend-kit.json` **first**. If Claude Code refuses a write inside `.claude/` (it asks for
permission there), stop right away and tell the user which file needs approval; never route around the refusal through
another tool, and never copy the other templates into `.claude/rules/` first (unadapted files with `{{PLACEHOLDER}}`s must
not be left behind). Setup is safe to run again: files that already match are skipped, so after the user approves the
permission, re-running it finishes the job.

## 5. Existing files: show, then ask

For each target that already exists:

1. Show a short unified diff (`diff -u existing new`), trimmed to the changed hunks.
2. Ask: **overwrite**, **merge** or **skip** (one question per file, or one table for all files).
3. Never overwrite without that answer.

Merging:
- `CLAUDE.md` — keep the user's file; append the kit's sections that are missing, under the same headings.
- `rules/*.md` — a rule with the same name: show the diff and ask; new names are added.
- `settings.json` — a JSON merge, never a text merge:
  - `permissions.allow`, `.ask`, `.deny`: the union, existing order first, no duplicates.
  - Every other key the user has (`env`, `model`, `statusLine`, `hooks`, …) is kept as is.
  - Keys only the template has (`attribution`, `$schema`, …) are added.
  - The template never adds `hooks`: the plugin provides them. If the user's settings already define the
    same guard hooks (an older copy of this setup), say so and offer to remove the duplicates.
  - `extraKnownMarketplaces.frontend-kit` (with `autoUpdate: true`) and `enabledPlugins["frontend-kit@frontend-kit"]` are
    added when missing; they make Claude Code refresh the kit's marketplace and update the plugin on its own after a
    session starts. Keep the user's value if they already set `autoUpdate` to `false`. A teammate's clone still runs
    `claude plugin install frontend-kit@frontend-kit --scope project` once.
  - Show the merged result's diff before writing it.
- `frontend-kit.json` — keep existing values, add missing keys. The user's answer to question 1 always wins for `mode`.

## 6. Clean up

Only what the user approved in the proposal:
- `"${CLAUDE_PLUGIN_ROOT}/scripts/kit-prune.sh" <profile> --apply` (add `--include-edited` only when they said so).
  Report the backup folder it printed.
- Keep the deny rules for the other profiles' skills; remove permission rules and duplicate hooks the proposal named.
- Offer to add `.claude/kit-backup/` to `.gitignore`.

## 7. Finish

- `package.json` scripts: add what `kit-package-scripts.sh` printed, never overwrite an existing script. `i18n:validate` runs the shipped `scripts/validate-i18n.ts` (Node >= 22.18); a project with its own
  validator keeps it.
- Fill `.claude/rules/project.md` with what is already known (the files setup just created, the script wrappers,
  the stack choices the user named); leave the rest empty for the first task to fill.
- Env file: if `.env.example` exists and `.env` does not, tell the user to run `cp .env.example .env` (the kit
  denies Claude reading or editing `.env`, so the user creates it). Write `.env.example` from `{{API_BASE_ENV}}`
  if neither file exists; `.env.example` stays editable.
- Add to `.gitignore` if missing (ask once): `.claude/state/`, `.claude/settings.local.json`.
- Check `jq` is installed (`command -v jq`): every hook needs it. If missing, say `brew install jq`.
- Report in 3–6 lines: profile, files created / merged / skipped, values used, and the next steps:
  - Restart Claude Code so the new CLAUDE.md, rules and settings load.
  - Refactor mode chosen: run `/frontend-kit:refactor-mode audit`. New project: start with the `task` skill.
  - Hook self-test: `KIT_TEST_PROJECT="$PWD" bash "${CLAUDE_PLUGIN_ROOT}/scripts/test-hooks.sh"`.
- Do not commit. The user commits when they say so.
