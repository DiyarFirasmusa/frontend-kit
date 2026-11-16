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
where `<profile>` is `website`, `dashboard` or `react` (stack-neutral).

## 1. Ask

Ask in this order. The first two are the user's own answers: detection only pre-selects an option, never decides.

**Question 1: what are we doing?** (one question, three options)

| Answer | Meaning | Sets |
| ------ | ------- | ---- |
| New project | Nothing or almost nothing exists yet; build to the standards from the first file | `"mode": "new"` |
| Existing project | Add the kit to a working project; keep its structure, follow its stack | `"mode": "existing"` |
| Refactor | An existing project the user wants restructured to the standards (phased, behaviour frozen) | `"mode": "refactor"` |

For *New project* with no `package.json`: ask which framework (Vite, Next.js, TanStack Start, React Router, other)
and offer to run that framework's official create command; run it only after the user says yes. Then continue.
For *Refactor*: after setup, tell the user to run `/frontend-kit:refactor-mode audit` (setup does not restructure anything).

**Question 2: what kind of React project?** (the user answers; show what you detected as the first option)

| Answer | Profile | Fits |
| ------ | ------- | ---- |
| Website (SSR, SEO, public pages) | `website` | TanStack Start rules and skills (`web-*`) |
| Dashboard / admin app (SPA) | `dashboard` | Vite + TanStack Router/Table rules and skills (`dash-*`) |
| Any other React app | `react` | Stack-neutral rules; the kit adapts to the stack it detects |

Detection only suggests: `@tanstack/react-start` suggests website; `vite` + `@tanstack/react-router` suggests
dashboard; everything else (Next.js, CRA, Remix, React Router, Expo web, …) suggests `react`.

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

Read `package.json`, the lockfile and the config files; never run installs. Record what you find, show it in the
same confirmation message, and let the user correct it. These values are what the hooks and the rules adapt to:

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

Leave a field out (never invent a value) when nothing was found. `commands.lintFile` and `commands.formatFile` are
left unset: the hooks find oxlint, eslint, biome, oxfmt or prettier by themselves.

## 3. Plan the copy

| Source | Target |
| ------ | ------ |
| `templates/<profile>/CLAUDE.md` | `./CLAUDE.md` |
| `templates/shared/rules/*.md` + `templates/<profile>/rules/*.md` | `./.claude/rules/` |
| `templates/<profile>/settings.json` | `./.claude/settings.json` (merge, below) |
| `templates/<profile>/frontend-kit.json` | `./.claude/frontend-kit.json` |
| `templates/shared/package.scripts.json` | `./package.json` `scripts` (add only the names that are missing) |
| `templates/shared/scripts/validate-i18n.ts` | `./scripts/validate-i18n.ts` (only if the project uses the two-level i18next layout and has no i18n validator) |
| `templates/shared/config/.oxlintrc.json`, `.oxfmtrc.json` | `./` (only when the project has **no** linter/formatter at all; never next to eslint, prettier or biome) |
| `templates/shared/style/theme.css` | the profile's theme path, only for a Tailwind project without a theme file; say which fonts it imports |

In every copied file replace each `{{PLACEHOLDER}}` with the confirmed value; a placeholder with no value becomes
an empty string or empty list (drop empty hosts from `liveHosts` and from `sandbox.network.deniedDomains`; with no
live host remove `deniedDomains`). In `frontend-kit.json` set every key the profile template lists, including
`mode`, `profile`, `stack`, `srcDirs`, `commands`, `liveHosts`, `uatHost`, `githubRepo`, `defaultBranch`,
`protectedBranches` (built from the one answer, never the template's default when the user chose others),
`devPort`, `e2ePort` and `apiBaseEnv`. The plugin's skills and agents read these (written `<defaultBranch>`,
`<devPort>`, … in their text).

**Adapt to the stack** (after the copy, before showing the diffs). The rules are principles first, tool names second:
- In `settings.json`: replace `npm`/`npx` in the allow list with the detected package manager; drop allow rules for
  tools the project does not use; the deny rule for the lockfile names the real lockfile.
- In every copied rule and in `CLAUDE.md`: where the text names a library the project does not use (TanStack Query,
  Tailwind v4, i18next, oxlint, Vitest, …), rewrite that sentence for the detected one or remove it. Keep the principle.
- Delete a copied rule file that cannot apply (for example SSR routing rules in a client-only app, RTL rules in a
  project with one left-to-right language, i18n rules in a project with no i18n) and list what you removed.
- Never invent a convention the project does not follow; when the stack is unclear, keep the neutral wording.
Show the list of adaptations with the diffs and wait for the user's answer.

## 4. Existing files: show, then ask

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

## 5. Finish

- `package.json` scripts: add the names from `package.scripts.json` that are missing, never overwrite an existing
  script. `i18n:validate` runs the shipped `scripts/validate-i18n.ts` (Node >= 22.18); a project with its own
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
  - Optional status band: `/plugin install frontend-status@frontend-kit`.
  - Refactor mode chosen: run `/frontend-kit:refactor-mode audit`. New project: start with the `task` skill.
  - Hook self-test: `KIT_TEST_PROJECT="$PWD" bash "${CLAUDE_PLUGIN_ROOT}/scripts/test-hooks.sh"`.
- Do not commit. The user commits when they say so.
