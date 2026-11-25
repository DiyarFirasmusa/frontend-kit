---
name: setup
description: Install wajiha-kit's project files into the current project — CLAUDE.md, .claude/rules/, .claude/settings.json and .claude/wajiha-kit.json. Asks first whether it is a new project, an existing one, one in maintenance or a refactor, then the kind of project (website, dashboard, or any other frontend in any stack), maps where each role lives, and adapts the rules to both. Run with /wajiha-kit:setup.
disable-model-invocation: true
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/templates/**)
  - Bash("${CLAUDE_PLUGIN_ROOT}/scripts/kit-detect-stack.sh")
  - Bash("${CLAUDE_PLUGIN_ROOT}/scripts/kit-detect-stack.sh" *)
  - Bash("${CLAUDE_PLUGIN_ROOT}/scripts/kit-prune.sh" *)
  - Bash("${CLAUDE_PLUGIN_ROOT}/scripts/kit-package-scripts.sh")
  - Bash("${CLAUDE_PLUGIN_ROOT}/scripts/kit-package-scripts.sh" *)
  - Bash("${CLAUDE_PLUGIN_ROOT}/scripts/kit-scope-rules.sh" *)
  - Bash("${CLAUDE_PLUGIN_ROOT}/scripts/kit-update-check.sh")
---

# wajiha-kit setup

Plugins can't load CLAUDE.md, rules or most settings, so this copies them into the project.
Skills, agents, hooks and MCP servers already come from the plugin; nothing of those is copied.

Templates live in `${CLAUDE_PLUGIN_ROOT}/templates/`:
`shared/rules/` (every profile) and `<profile>/` (`CLAUDE.md`, `rules/`, `settings.json`, `wajiha-kit.json`),
where `<profile>` is `website`, `dashboard`, `react` (stack-neutral, for any other frontend: the name is historical) or `fullstack` (site + admin in one tree).

## 1. Ask

The flow is: ask (1) → detect (2) → **proposal the user approves (3)** → copy and adapt (4–5) → clean up (6) → finish (7).

Ask in this order. The first two are the user's own answers: detection only pre-selects an option, never decides.

**Question 1: what are we doing?** (one question, four options)

| Answer | Meaning | Sets |
| ------ | ------- | ---- |
| New project | Nothing or almost nothing exists yet; build to the standards from the first file | `"mode": "new"` |
| Existing project | Add the kit to a working project; keep its structure, follow its stack | `"mode": "existing"` |
| Maintenance | An old app that is kept running, not developed: fixes and security only, no modernising | `"mode": "maintenance"` |
| Refactor | An existing project the user wants restructured to the standards (phased, behaviour frozen) | `"mode": "refactor"` |

Other modes are turned on later, not here: `/wajiha-kit:mode list` shows `upgrade`, `freeze`, `hotfix`, `read-only` and `prototype`
and what each one enforces. If `.claude/wajiha-kit.json` already holds a mode other than `existing` or `new`, setup keeps it,
with `modeState`, whatever the answer: a mode with rules is the user's to switch, so tell them to run
`/wajiha-kit:mode <name>` instead. While one is on, change that file with Edit or Write (other keys only) and report what
the mode refuses (for example `package.json` scripts in freeze) instead of working round it.

For *New project* with no `package.json`: ask which framework (Vite, Next.js, TanStack Start, React Router, other)
and offer to run that framework's official create command (any framework, not only those listed); run it only after the user says yes. Then continue.
For a Next.js dashboard answer *yes* to the `src/` directory prompt: that variant's example layout is under `src/`. When the user already said
they want a dashboard, the framework question here is question 2b, asked once.
For *Refactor*: after setup, tell the user to run `/wajiha-kit:refactor-mode audit` (setup does not restructure anything).

**Question 2: what kind of project?** (the user answers; show what you detected as the first option)

| Answer | Profile | Fits |
| ------ | ------- | ---- |
| Website (SSR, SEO, public pages) | `website` | TanStack Start rules and skills (`web-*`) |
| Dashboard / admin app | `dashboard` | TanStack Table, Query and permission rules and skills (`dash-*`); the router part depends on question 2b |
| Website **and** dashboard in one project | `fullstack` | Two apps in one tree (for example a TanStack Start site with an admin under `src/admin`); each app gets its own rules, skills and checks |
| Any other frontend, any stack (React, Vue, Svelte, Angular, Astro, Solid, plain) | `react` | Stack-neutral principles; the project's own layout and libraries |

Detection only suggests: `@tanstack/react-start` suggests website; `vite` + `@tanstack/react-router` suggests
dashboard; everything else (Next.js, CRA, Remix, React Router, Expo web, Vue, Nuxt, SvelteKit, Angular, …) suggests `react`. A Next.js or
TanStack Start project can be a dashboard too: the user's answer decides, then question 2b.

**Question 2b (only for `dashboard`): which framework?** Pre-select what was detected; a new project with nothing
detected defaults to the first row.

| Answer | `dashboard` variant | `stack.framework` | What changes |
| ------ | ------------------- | ----------------- | ------------ |
| Vite SPA (TanStack Router) | none (the base template) | `Vite` | file routes, `beforeLoad` guards, loaders, generated `routeTree.gen.ts` |
| TanStack Start (SPA mode) | `tanstack-start` | `TanStack Start` | same router and guards; adds the Start shell, `getRouter()`, `spa.enabled`, SSR-safe module code (`rules/framework.md`) and the portal folder structure: `src/shared/`, `layout/<shell>/`, flat features, `tabs/` and `steps/` (`rules/structure.md`) |
| Next.js (App Router) | `next` | `Next.js` | `app/` pages, `proxy.ts` + layout guards, zod over `useSearchParams`, no loaders, `@sentry/nextjs`, and the production-site folder structure: `layouts/`, `modals/`, `wrappers/`, `contexts/`, `config/`, `i18n/`, `api/{client,errors}` (`rules/structure.md`) |

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

| Field in `wajiha-kit.json` | Detected from |
| ---------------------------- | ------------- |
| `stack.packageManager` (`{{PACKAGE_MANAGER}}`, `{{PM_RUN}}`) | `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `bun.lock(b)` → bun, else npm (`npm run`, `pnpm`, `yarn`, `bun run`) |
| `stack.framework`, `stack.router` | `next`, `@tanstack/react-start`, `@react-router/dev`, `@remix-run/react`, `expo`, `gatsby`, `react-scripts`, `nuxt`, `@sveltejs/kit`, `@angular/core`, `astro`, then `vue`, `svelte`, `solid-js`, then `vite`; the router is the framework's own, else `vue-router`, `@tanstack/react-router`, `react-router(-dom)`, `wouter` |
| `stack.data` | `@tanstack/{react,vue,svelte}-query`, `@tanstack/angular-query-experimental`, `swr`, `@reduxjs/toolkit`, `@apollo/client`, `urql`, else none (the framework's own fetching) |
| `stack.state` | `zustand`, `redux`/`@reduxjs/toolkit`, `jotai`, `recoil`, `mobx`, `pinia`, `vuex`, `@ngrx/signals`/`@ngrx/store`, `@ngxs/store`, else none (the framework's built-in state) |
| `stack.styling` | `tailwindcss`, `styled-components`, `@emotion/*`, `@mui/*`, CSS modules (`*.module.css`), `sass` |
| `stack.tests`, `stack.e2e` | `vitest`, `jest`; `@playwright/test`, `cypress` |
| `stack.lint`, `stack.format` | `oxlint`, `eslint`, `@biomejs/biome`; `oxfmt`, `prettier`, `@biomejs/biome` |
| `stack.i18n` | `i18next`/`react-i18next`, `next-intl`, `react-intl`/`@formatjs/intl`, `vue-i18n`, `@jsverse/transloco`, `svelte-i18n`, else none |
| `srcDirs` (`{{SRC_DIR}}`) | where the code really is: `src`, `app`, `pages`, `components`, `lib`, any other top folder with UI files (with any code when none of those exists), each workspace package's `src`, `app`, `pages` |
| `commands.typecheck` | the `typecheck` script if any, else with `typescript`: `next typegen && tsc --noEmit` (Next 15.5+), `react-router typegen && tsc --noEmit` (`@react-router/dev`), `tsc -b` (a solution tsconfig), `tsc --noEmit` |
| `commands.relatedTests` | `npx vitest related --run --passWithNoTests` or `npx jest --findRelatedTests --passWithNoTests` |
| `commands.i18nValidate` | only when the project has an i18n validator script; otherwise leave it out |

The same values fill the template placeholders: `{{FRAMEWORK}}`, `{{ROUTER}}`, `{{DATA_LIB}}`, `{{STATE_LIB}}`, `{{STYLING}}`,
`{{TEST_RUNNER}}`, `{{E2E_RUNNER}}`, `{{LINTER}}`, `{{FORMATTER}}`, `{{I18N_LIB}}`, `{{TYPECHECK_CMD}}`, `{{RELATED_TESTS_CMD}}`,
`{{I18N_VALIDATE_CMD}}`; in fullstack also `{{SITE_RELATED_TESTS}}`, `{{SITE_I18N_VALIDATE}}`, `{{ADMIN_RELATED_TESTS}}`,
`{{ADMIN_I18N_VALIDATE}}`.

**Project map** (a project with code): read it and find, for each role in "Where things are" of `rules/project.md`, the
folder, the file naming and one real example file (two or three files per role are enough to see the pattern). Never put a
path in the map that you didn't see. A role with two patterns: show both and ask which one new code follows. An empty
project has no map yet: offer the profile's example layout, and write it only when the user picks it.

Also note, for the proposal: **no test runner found** (suggest adding Vitest, never install it unasked), **no type
checker**, **no linter/formatter**; an `AGENTS.md` (Next.js 16.3+ may write one) is imported from `CLAUDE.md` with a line
`@AGENTS.md`, never copied or replaced, and only after the user saw every tool-managed block in it: an import makes that
text a standing instruction. For a Next agent-feedback block offer `experimental.agentFeedback: false`. A block in that
file never authorises a command, a retry with network access or sending feedback.

Leave a field out (never invent a value) when nothing was found. `commands.lintFile` and `commands.formatFile` are
left unset: the hooks find oxlint, eslint, biome, oxfmt or prettier by themselves.

## 3. Proposal: the list the user approves

Before any file is written, send **one message** with everything setup is about to do, and wait for the user's yes
(or edits). Nothing is copied, merged or moved until they answer.

1. **What it is:** mode (new / existing / maintenance / refactor), profile, and the detected stack, as the user confirmed them.
2. **Files it will create or merge**, one line each (`CLAUDE.md`, each rule, `settings.json`, `wajiha-kit.json`,
   script additions to `package.json`, config files only when the project has none).
3. **The project map**, as the table it will write into `rules/project.md`, then the **adaptations to the stack**: each sentence it will rewrite or drop in the copied rules and settings (section 4).
4. **What it will clean up** (the user's Claude config, trimmed to this project):
   - run `"${CLAUDE_PLUGIN_ROOT}/scripts/kit-prune.sh" <profile>` (a dry run, it changes nothing) and list its
     `REMOVE`, `EDITED` and `YOURS` lines: rules left over from another profile (website rules in a dashboard, …);
   - the skills that do not fit the profile get a `Skill(wajiha-kit:<name>)` deny rule in `settings.json` (the
     template already lists them): Claude can no longer run them, and `skill-suggest` stops proposing them. They still
     appear in Claude's skill list (a deny rule blocks use, it does not hide the entry; verified);
   - permission rules for tools the project does not use, and duplicate kit hooks copied by an older setup.
5. **What it will not touch:** the user's own rules and files (`YOURS`), edited kit rules (unless the user adds them),
   source code, git history.
6. **Refactor mode:** nothing is restructured by setup. The list ends with "next: `/wajiha-kit:refactor-mode audit`".

Removal never deletes: `kit-prune.sh --apply` moves files to `.claude/kit-backup/<timestamp>/`, and the message
says how to restore them. For each `EDITED` file ask separately (keep or move).

## 4. Plan the copy

| Source | Target |
| ------ | ------ |
| `templates/<profile>/CLAUDE.md` | `./CLAUDE.md` |
| `templates/shared/rules/*.md` + `templates/<profile>/rules/*.md` | `./.claude/rules/` |
| `templates/react/rules/nextjs.md`, `react-router.md` | only with that dependency (`next`; `react-router`, `react-router-dom` or `@react-router/dev`); the proposal names the one copied. They are left out of the row above, and neither is copied for a project without it |
| **dashboard variant** `templates/dashboard/variants/<variant>/` | on top of the two rows above: its `CLAUDE.md` replaces the base one, its `rules/*.md` replace a rule of the same name (`routing.md`, `error-monitoring.md`) or are added (`framework.md`, `structure.md`), its `wajiha-kit.json` keys (`stack`, `generatedPaths`) are merged into the base config, and its `e2e/` files (Start: `serve-spa.ts`) are copied to `e2e/` |
| `templates/<profile>/settings.json` | `./.claude/settings.json` (merge, below) |
| `templates/<profile>/wajiha-kit.json` | `./.claude/wajiha-kit.json` |
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
live host remove `deniedDomains`). In `wajiha-kit.json` set every key the profile template lists, including
`mode`, `profile`, `stack`, `srcDirs`, `commands`, `liveHosts`, `uatHost`, `githubRepo`, `defaultBranch`,
`protectedBranches` (built from the one answer, never the template's default when the user chose others),
`devPort`, `e2ePort` and `apiBaseEnv`. The plugin's skills and agents read these (written `<defaultBranch>`,
`<devPort>`, … in their text).

**Adapt to the stack** (after the copy, before showing the diffs). The rules are principles first, tool names second:
- `protectedPaths`: keep `server/**` only where that folder is deploy config. In Nuxt, Nitro and any app whose own code is
  in `server/`, leave it out when writing the file.
- In `settings.json`: replace `npm`/`npx` in the allow and ask lists with the detected package manager; drop allow rules for
  tools the project does not use; the deny rule for the lockfile names the real lockfile; the `Edit(...)` deny rules
  for generated files match `generatedPaths` (`src/routeTree.gen.ts` for Vite and Start, `next-env.d.ts` for Next.js).
- In every copied rule and in `CLAUDE.md`: where the text names a library the project does not use (TanStack Query,
  Tailwind v4, i18next, oxlint, Vitest, …), rewrite that sentence for the detected one or remove it. Keep the principle.
- Rule `paths:` globs: rewrite them to the detected `srcDirs` (a monorepo's `apps/web/src`, Next's or React Router's `app/`) and
  to the file extensions the project uses (`.jsx`/`.js` for a JavaScript project); a glob that matches nothing never loads its rule.
  Root files stay (`proxy`, `middleware`, `instrumentation`, configs). A leading `/` means the project root: prefix it with the
  app's folder in a monorepo, and replace `app` with the project's `appDirectory` (React Router).
- `commands` in `wajiha-kit.json`: write the real script names for `typecheck`, `lint`, `test`, `build` and `dev`. When a
  `typecheck` script is missing add one (what `kit-package-scripts.sh` prints: with typegen for Next.js and React Router framework mode) or leave it empty; a gate
  that points at a script that does not exist can never pass. With no i18n library set `stack.i18n` to `none`; the i18n and RTL
  rules then keep their "no i18n library yet" note. Read framework versions from `package.json`.
- Replacing placeholders: names can contain digits (`{{E2E_RUNNER}}`, `{{E2E_PORT}}`); after the copy search the project for any
  leftover `{{[A-Z0-9_]+}}` and resolve every one. Other double braces are content (`{{count}}`, `style={{}}`): leave them.
- Outside React (no `react` dependency): don't copy `react.md`, take the React-only sentences out of `naming.md`, `testing.md` and
  `CLAUDE.md`, and never offer TanStack, Zustand or react-hook-form as the default.
- Delete a copied rule file that cannot apply (for example SSR routing rules in a client-only app, RTL rules in a
  project with one left-to-right language, i18n rules in a project with no i18n) and list what you removed.
- Folder layouts in rules and variants are examples. In a project with code keep its own layout and rewrite the paths to it,
  with a real file as the example of each role; offer a layout only to an empty project.
- Never invent a convention the project does not follow; when the stack is unclear, keep the neutral wording.
Show the list of adaptations with the diffs and wait for the user's answer.
Order of writes: `.claude/wajiha-kit.json` **first**, complete, in one Write call (a copy through the shell is put to
the user). A re-run that removes a protection or changes a gate command makes Claude Code ask the user: say so before writing. If Claude Code refuses a write inside `.claude/` (it asks for
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
  - Keys only the template has (`$schema`, …) are added.
  - The template never adds `hooks`: the plugin provides them. If the user's settings already define the
    same guard hooks (an older copy of this setup), say so and offer to remove the duplicates.
  - `extraKnownMarketplaces.wajiha-kit` (with `autoUpdate: false`: the user updates on purpose with `claude plugin update wajiha-kit@wajiha-kit`; turn it on only if they ask) and `enabledPlugins["wajiha-kit@wajiha-kit"]` are
    added when missing. They let Claude Code update the plugin, in interactive sessions and only where updates aren't
    disabled: never promise automatic updates (step 7 checks). Keep the user's value if they already set `autoUpdate`.
    A teammate's clone still runs
    `claude plugin install wajiha-kit@wajiha-kit --scope project` once.
  - Show the merged result's diff before writing it.
- `wajiha-kit.json` — keep existing values, add missing keys. The user's answer to question 1 wins for `mode` when the
  stored mode is absent, `new` or `existing` (remove a leftover `modeState` then); otherwise keep it and tell the user to
  run `/wajiha-kit:mode <name>`.

## 6. Clean up

Only what the user approved in the proposal:
- `"${CLAUDE_PLUGIN_ROOT}/scripts/kit-prune.sh" <profile> --apply` (add `--include-edited` only when they said so).
  Report the backup folder it printed.
- Keep the deny rules for the other profiles' skills; remove permission rules and duplicate hooks the proposal named.
- Offer to add `.claude/kit-backup/` to `.gitignore`.

## 7. Finish

- `package.json` scripts: add what `kit-package-scripts.sh` printed, never overwrite an existing script. `i18n:validate` runs the shipped `scripts/validate-i18n.ts` (Node >= 22.18); a project with its own
  validator keeps it.
- Fill `.claude/rules/project.md` with the approved map (an example file in each row) and what else is already known (the
  files setup just created, the script wrappers, the stack choices the user named); leave the rest empty for the first task
  to fill.
- Env file: if `.env.example` exists and `.env` does not, tell the user to run `cp .env.example .env` (the kit
  denies Claude reading or editing `.env`, so the user creates it). Write `.env.example` from `{{API_BASE_ENV}}`
  if neither file exists; `.env.example` stays editable.
- Add to `.gitignore` if missing (ask once): `.claude/state/`, `.claude/settings.local.json`, and `.vitest/` with Vitest 5.
- Check `jq` is installed (`command -v jq`): every hook needs it. If missing, give the command for the user's system before anything else (Mac `brew install jq`, Windows `winget install jqlang.jq`, Linux `sudo apt install jq`), and say to reopen Claude Code after it.
- Browser checks (ask once, default no): the kit does not start the two browser tools (chrome-devtools, playwright) by
  itself, because they can read any page or local file Claude points them at. Ask: "Do you want Claude to open your app
  in a browser to check it? It can then read pages and files on this computer." On yes, merge
  `${CLAUDE_PLUGIN_ROOT}/templates/shared/mcp/browser.mcp.json` into the project's `.mcp.json` (create it if missing,
  keep other servers), show the diff first, and tell the user Claude Code asks them to approve the servers once after a
  restart. On no, write nothing; `qa-engineer`, `test-engineer` and `performance-optimizer` then work without a browser.
- Updates: run `"${CLAUDE_PLUGIN_ROOT}/scripts/kit-update-check.sh"` and pass on what it prints. When it says `off`,
  say plainly that new kit releases won't arrive here by themselves and give the command to update by hand. Don't change
  the user's environment or settings to turn updates on.
- Report in 3–6 lines: profile, files created / merged / skipped, values used, and the next steps:
  - Restart Claude Code so the new CLAUDE.md, rules and settings load.
  - Updates: automatic or by hand, as the check said.
  - Modes: `/wajiha-kit:mode status` shows the mode, `/wajiha-kit:mode list` all of them. A project mode is in a
    committed file: the team gets it through git, and a branch without that commit doesn't have it.
  - Refactor mode chosen: run `/wajiha-kit:refactor-mode audit` (it keeps the project's own layout unless the user picks another). New project: start with the `task` skill.
  - Hook self-test: `KIT_TEST_PROJECT="$PWD" bash "${CLAUDE_PLUGIN_ROOT}/scripts/test-hooks.sh"`.
- Do not commit. The user commits when they say so. Tell them the kit files (`CLAUDE.md`, `.claude/`, new
  dependencies) are uncommitted work: the kit's git rule makes the first task stop and ask what to do with them, so the
  quickest start is a separate commit of the setup (`chore: add wajiha-kit`) before the first task.
