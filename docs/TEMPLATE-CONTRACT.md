# frontend-kit — template contract

One plugin (`frontend-kit`), two profiles. `/frontend-kit:setup` asks for the
profile and copies `templates/shared/` + `templates/<profile>/` into the project.

| Profile   | Stack (reference project)                                                                 |
| --------- | ----------------------------------------------------------------------------------------- |
| website   | TanStack Start (React 19, TanStack Router file routes + SSR, server functions), TanStack Query, Zustand, Tailwind v4, i18next (Arabic RTL default + English), react-hook-form + zod, Vitest + Testing Library + MSW, Playwright + axe, oxlint + oxfmt, npm |
| dashboard | Vite + React 19 SPA, TanStack Router (file routes, typed search params), TanStack Query, TanStack Table, Zustand, base-ui / shadcn-style primitives, Tailwind v4, i18next RTL + English, react-hook-form + zod, Sentry, Vitest + MSW, Playwright + axe, oxlint + oxfmt, npm (reference: inventory-storage) |

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
    settings.json             permissions (+ attribution, outputStyle) ONLY — no hooks (hooks live in the plugin)
    frontend-kit.json         the project config the hooks read (schema below)
```

## Placeholders (setup asks for them and replaces them in every copied file)

`{{PROJECT_NAME}}` · `{{PROJECT_DESCRIPTION}}` · `{{LIVE_HOST}}` (production host, never tested against) ·
`{{UAT_HOST}}` (test environment) · `{{GITHUB_REPO}}` (owner/name) · `{{DEFAULT_BRANCH}}` (where task branches
start, e.g. main) · `{{PROTECTED_BRANCHES}}` (e.g. main, master) · `{{DEV_PORT}}` · `{{E2E_PORT}}` ·
`{{API_BASE_ENV}}` (e.g. VITE_API_BASE_URL)

Never write a real host, company, person or endpoint into a template. Hassa / inventory-specific domain rules
(checkout, beIN, Aqsati, warehouses, …) do not belong here — keep the patterns, drop the domain.

## frontend-kit.json (read by the hook scripts)

```json
{
  "profile": "website",
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
  "stopGate": { "tests": "related" },
  "hooks": { "skillSuggest": true }
}
```

`stopGate.tests`: `related` (default, only tests related to changed files) or `all` (runs `commands.allTests`).
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
