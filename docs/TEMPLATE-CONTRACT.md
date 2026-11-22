# frontend-kit — template contract

One plugin (`frontend-kit`), four profiles. `/frontend-kit:setup` asks for the
profile and copies `templates/shared/` + `templates/<profile>/` into the project.

| Profile   | Stack (reference project)                                                                 |
| --------- | ----------------------------------------------------------------------------------------- |
| website   | TanStack Start (React 19, TanStack Router file routes + SSR, server functions), TanStack Query, Zustand, Tailwind v4, i18next (Arabic RTL default + English), react-hook-form + zod, Vitest + Testing Library + MSW, Playwright + axe, oxlint + oxfmt, npm |
| dashboard | Vite + React 19 SPA (or TanStack Start in SPA mode, or Next.js App Router: `variants/`), TanStack Router (file routes, typed search params), TanStack Query, TanStack Table, Zustand, base-ui / shadcn-style primitives, Tailwind v4, i18next RTL + English, react-hook-form + zod, Sentry, Vitest + MSW, Playwright + axe, oxlint + oxfmt, npm |
| react     | Any React stack (Next.js, React Router, Vite, CRA, ...): stack-neutral rules, adapted by setup to what it detects |
| fullstack | A site and an admin in one tree: the website rules for the site, the dashboard rules scoped to the admin folder   |

## Layout

```
plugins/frontend-kit/
  skills/<name>/SKILL.md      shared skills (no prefix), dash-* (dashboard only), web-* (website only)
  agents/*.md                 shared agents
  hooks/hooks.json            hooks → ${CLAUDE_PLUGIN_ROOT}/scripts/*.sh
  scripts/                    hook scripts; they read .claude/frontend-kit.json
  templates/shared/rules/     rules every profile gets (quality-bar, scope, git, naming, react, i18n, rtl, testing, styles, project)
  templates/shared/scripts/   validate-i18n.ts (no dependencies, Node type stripping)
  templates/shared/config/    baseline .oxlintrc.json / .oxfmtrc.json (copied only when the project has none); `react/refs` and
                              `jsx-a11y/control-has-associated-label` are off on purpose: they flag `ref={field.ref}` from react-hook-form
                              and every `<td>`
  templates/shared/style/     theme.css (semantic tokens, light + dark; copied only when the project has none)
  templates/<profile>/
    CLAUDE.md                 project memory skeleton, ≤ 150 lines, placeholders below; project facts the rules
                              refer to go in rules/project.md (shared), never into CLAUDE.md
    rules/*.md                profile-only rules (frontmatter `paths:` where it helps)
    settings.json             permissions (+ attribution, outputStyle, the kit marketplace with autoUpdate) — no hooks (hooks live in the plugin)
    frontend-kit.json         the project config the hooks read (schema below)
  templates/dashboard/variants/<variant>/   only the router-bound parts of the dashboard for another framework
                              (`tanstack-start`, `next`): `CLAUDE.md` (replaces the base one, same 150-line cap),
                              `rules/*.md` (replace a rule of the same name or add one), `frontend-kit.json` (`stack`,
                              `generatedPaths`, merged into the base). Vite + TanStack Router is the base template.
                              Everything not router-bound (tables, forms, permissions, API layer) is shared.
```

## Placeholders (setup asks for them and replaces them in every copied file)

`{{PROJECT_NAME}}` · `{{PROJECT_DESCRIPTION}}` · `{{LIVE_HOST}}` (production host, never tested against) ·
`{{UAT_HOST}}` (test environment) · `{{GITHUB_REPO}}` (owner/name) · `{{DEFAULT_BRANCH}}` (where task branches
start, e.g. main) · `{{PROTECTED_BRANCHES}}` (e.g. main, master) · `{{DEV_PORT}}` · `{{E2E_PORT}}` ·
`{{API_BASE_ENV}}` (e.g. VITE_API_BASE_URL)

Never write a real host, company, client, project, person or endpoint into the repo, as a reference or as an example
of what not to write either: the repo is public. Keep the patterns, drop the domain. To have `validate-repo.sh` check
for the names you must not publish, list them one per line in `.private-names` (git-ignored).

## frontend-kit.json (read by the hook scripts)

```json
{
  "profile": "website",
  "mode": "existing",
  "srcDirs": ["src"],
  "allowJs": false,
  "stack": { "packageManager": "npm", "framework": "", "router": "", "data": "", "state": "", "styling": "", "tests": "", "e2e": "", "lint": "", "format": "", "i18n": "" },
  "liveHosts": ["{{LIVE_HOST}}"],
  "protectedBranches": ["main", "master"],
  "protectedPaths": [".env", ".env.*", ".github/**", "deploy/**", "server/**", "package-lock.json"],
  "generatedPaths": ["src/routeTree.gen.ts"],
  "srcDir": "src",
  "commands": {
    "typecheck": "npm run typecheck",
    "relatedTests": "npx vitest related --run",
    "lintFile": "npx oxlint",
    "formatFile": "npx oxfmt",
    "i18nValidate": "npm run i18n:validate",
    "allTests": "npx vitest run"
  },
  "stopGate": { "tests": "related", "review": true },
  "hooks": { "skillSuggest": true }
}
```

`profile`: `website`, `dashboard`, `react` or `fullstack` (two apps in one tree: `apps` lists each with `name`, `profile`, `path`, `routes`, `apiBaseEnv`, `commands`); written by setup after the user answers. `mode`: `new`, `existing`
or `refactor`. `srcDirs`: the source folders every gate watches (default `["src"]`). `allowJs`: lifts the TypeScript-only guard.
`apps[].cwd`: the folder an app's commands run in (a monorepo package); the changed files are passed relative to it. `stack`: what setup detected; rules and `commands` adapt to it. `commands.formatFile` / `commands.lintFile` (the file is
appended) replace the detected formatter/linter; `commands.typecheck` / `commands.relatedTests` / `commands.allTests` replace the detected ones.
The Stop gate looks at the uncommitted changes and at what was committed since the session started (or the gate last
passed), leaving out what is already on `origin/<defaultBranch>`.
`stopGate.tests`: `related` (default, only tests related to changed files) or `all` (runs `commands.allTests`).
`stopGate.review: false` turns off the end-of-turn code review by the `frontend-reviewer` agent (Opus).
`hooks.skillSuggest: false` turns off the per-prompt skill suggestions.

## package.json scripts (names are fixed; hooks, rules and CLAUDE.md use them)

`templates/shared/package.scripts.json` is merged by setup (missing names only).

| Script | Does |
| ------ | ---- |
| `typecheck` | `tsc --noEmit` (needs a flat `tsconfig.json`; a solution file with `references` checks nothing) |
| `lint` / `lint:check` | oxlint with / without `--fix` |
| `fmt` / `fmt:check` | oxfmt writes / `--check` |
| `test`, `test:watch`, `test:coverage` | Vitest |
| `test:e2e`, `test:e2e:ui`, `e2e:install` | Playwright |
| `check` / `check:full` | typecheck + lint:check + test / + e2e + build |
| `i18n:validate` | `node scripts/validate-i18n.ts` (the validator ships in `templates/shared/scripts/`; a project's own wins) |

## Writing style (all files)

Plain, short, imperative. Rules explain *why* in one line where it is not obvious. Each skill: frontmatter
`name` + a `description` that says WHEN to use it (trigger words), body < 150 lines, progressive disclosure into
`references/*.md` for anything long. Arabic RTL + English are first-class in every UI rule.
