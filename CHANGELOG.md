# Changelog

Versions are the `version` in `plugins/frontend-kit/.claude-plugin/plugin.json`. A project only receives an update when
that number changes.

## 1.15.2
- The bundled Chrome DevTools MCP server no longer sends to Google: usage statistics are off (`--no-usage-statistics`),
  and so is the CrUX lookup that sent the URLs of traced pages (`--no-performance-crux`). Performance traces report lab
  data only, without real-user field data. Chrome's own traffic and the server's npm update check are not affected.

## 1.15.1
- The bundled browser MCP servers are pinned to checked versions instead of `@latest`: `chrome-devtools-mcp` 1.12.0 and
  `@playwright/mcp` 0.0.84. Both are outside the ranges of the published advisories at the time of pinning. They need
  Node 20.19 or later (chrome-devtools), and move only with a kit release.

## 1.15.0
Needs Claude Code 2.1.295 or later. Run `/frontend-kit:setup` again: rules and settings already copied into a project do
not update by themselves.

- **The gate works in any folder.** Without `srcDirs` (or when none of its folders exists) the Stop gate and post-edit see
  code wherever it is: before, code outside src, app, pages, components and lib passed a failing typecheck unseen. Vue,
  Svelte, Astro, HTML and SCSS files are formatted and linted. Vue and Svelte are typechecked with `vue-tsc` and
  `svelte-check` when installed (a sound project was blocked by tsc before). Detection knows Vue, Nuxt, SvelteKit,
  Angular, Astro and Solid. An ESLint without a config is a note, not an error.
- **Working modes** (`/frontend-kit:mode`): maintenance, upgrade, freeze, and per checkout hotfix, read-only and prototype,
  beside new, existing and refactor. The default adds nothing. A guard rail, not a sandbox. New skill `upgrade-mode`, new
  output style "Audit report".
- **Agents:** four new read-only ones (frontend-security-reviewer, i18n-rtl-reviewer, seo-auditor, upgrade-analyst). Every
  agent's tools match its prompt, the plugin's own MCP tool names work, and the prompts follow the project's stack and
  languages. `planner` no longer has Bash.
- **Rules:** five new shared ones (accessibility, security, formatting, dependencies, typescript) and two for the react
  profile that setup copies only for their stack (nextjs, react-router). Corrected: stale library APIs, `noindex` without
  a robots `Disallow`, Tailwind logical names, Arabic plurals, WCAG 2.2 target size.
- **Guards:** live hosts are seen behind `npx` and the like and in the plugin's own browser tools. A recursive delete
  through a variable is refused (`$CLAUDE_PROJECT_DIR` is empty in the Bash tool). Shell writes follow the file rules, a
  recursive search over a `.env` is refused, and so are code piped into a shell, publish and deploy, another package
  manager's install, `git stash drop`, `gh release create` and `gh workflow run`. Nine switches under `guards` in
  `frontend-kit.json`. A change that loosens the kit's protections is put to the user, and refused where nobody can be
  asked. Fewer false refusals: `ENV=…`, a worktree from main, read-only registry commands, Monitor WebSockets.
- **Settings templates:** installs are asked for, the `git fetch` and `git stash` pre-approvals are narrow, more secret
  files are denied, and `Edit(./server/**)` left the deny list (`protectedPaths` still holds it).
- Not yet covered: `.astro` files without the project's own typecheck, lint of files changed through Bash, guards on
  Windows. The four new agents' evals have not been run.

## 1.14.3
- The skill hint understands Arabic: standard, Iraqi, English words in Arabic letters, and English inside Arabic. One
  spelling for hamza forms, ة/ه, ى/ي and diacritics; attached prefixes and endings come off (`skill-triggers-ar.txt`,
  `arabic-hints.awk`). On 114 Arabic requests not seen while the rules were written it named the right skill for 95
  (18 before; English: 77 for the same requests, unchanged), with 5 false hints on 123 unrelated prompts (14 before).
  Those five were then fixed.
- Everyday talk stays silent (`شلون` or `ليش` alone no longer suggests `explain`), while the same words in an app's domain
  (a restaurant, a bank, a school) still get hints.
- A project's own skill with an Arabic description can be hinted. The hook gives the same answer in every locale and
  stays inside its timeout on long pastes (it reads the start and the end).
- `validate-repo.sh` fails when a skill lacks a trigger in either language or an Arabic rule names a group that is not
  defined.

## 1.14.2
- Start dashboard: two causes of React error #418 on a direct load, reproduced and fixed in a real app. Text in the
  prerendered shell stays in the default language until hydrated (English users landing on `/403` through a redirect hit
  this every time), and an unknown URL is a catch-all route `$.tsx` (every bad URL hit it, in both languages).
  `framework.md`, `structure.md`, `testing.md` and the variant's `CLAUDE.md` say so. An app set up earlier gets the rules
  by re-running setup; its code needs the two changes.
- Docs and descriptions: 39 skills, 9 hook events, 60 of 62 evals, four profiles, install from GitHub, the guards' limits.
  `validate-repo.sh` fails when those counts or profiles go stale.

## 1.14.1
- `guard-bash` reads a command the way the shell does (`shell-words.awk`: quotes, line continuations, heredocs,
  substitutions, keywords, subshells) and follows code handed to another command (`bash -c`, `eval`, `xargs`,
  `find -exec`, `git rebase -x`, git aliases). Closed: git's abbreviated options (`--forc`, `reset --har`), `checkout -f`,
  `switch --discard-changes`, cherry-pick / revert / am / pull onto a protected branch, `core.hooksPath` through
  `git config`, `heads/main` and wildcard refspecs, GraphQL PR creation, `find -delete`, capitals in hosts and file names.
- Fewer false blocks: a commit message may name a blocked command, `git checkout -b x && git commit` works from main,
  quoted paths with spaces work with `rm`, reading pull requests through `gh api` is allowed.
- A push or a recursive delete whose target is a variable is refused (write the name out). So is what can't be checked
  inside the hook's timeout (a command over 100 KB, a single word over 16 KB): a hook that times out lets it through.
- `guard-paths` follows links and ignores case (`.ENV`, `.GITHUB/`); `guard-url` ignores a trailing dot and capitals.
- The Stop gate also checks work committed during the session, changes that only delete files, Arabic file names and a
  project nested inside its repository. Committing what just passed does not run it again.
- `post-edit` shows oxlint warnings for route files such as `$id.tsx` and `[id].tsx`.
- Guard messages don't assume husky; the PR message reads the compare link from the origin remote.
- Settings templates allow `git rebase` only in its plain forms, because `git rebase -x` runs any command. A project
  set up earlier keeps its old rule until setup is run again; the guard covers it meanwhile.
- The repo checks take private names from a git-ignored `.private-names`.

## 1.14.0
- Every playground is now a complete app with at least five routes, built by real kit sessions (cost no object): the Next.js and
  TanStack Start dashboards have six areas each; `fresh-next`, `fresh-rr`, `fresh-vite-ts`, `fresh-vite-js`, `classic-jest` and
  `mono` are Bazaar storefronts (home, products with URL state, product detail, login with a safe `redirect`, account, order
  detail, 404; 75-122 tests each, build green); `legacy-messy` grew in its legacy style without the kit. Their reports drove this release.
- The generic `react` profile stopped assuming TanStack: `routing.md` has React Router (data and framework mode) and Next.js
  App Router sections (Cache Components, `next typegen`, 404 status, title templates, pre-hydration forms); `react.md` and
  `naming.md` say their router lines are TanStack's; `testing.md` covers Jest, `createMemoryRouter`, the one allowed
  `next/navigation` stub, `navigator.locks` and the route-file test ignore pattern.
- New `react/rules/auth.md` for apps that hold their own tokens, from the bugs the reviewer found in every build: single-flight
  and cross-tab refresh with `navigator.locks` and a timeout, rotation is not a new user (key tab sync on a session id), only a
  real rejection ends a session, a session epoch so a late refresh cannot undo sign-out, cache reset, no redirect ping-pong,
  an internal-only `redirect` parameter (`/.//evil.com`), pre-hydration forms.
- Rules load where the code is: globs match a monorepo's `apps/*/src`, Next's and React Router's `app/` and `.jsx`/`.js` files.
  Rules for no-i18n-library and plain-CSS projects, so they stop demanding Arabic strings and Tailwind utilities.
- Setup: rewrite rule globs to `srcDirs`, write the real `commands` (typecheck, lint, test, build, dev), search for leftover
  `{{`; the `task` skill stays on a branch that already carries the setup; `verify` and `dev` read the project's commands;
  `create-form` and `create-store` allow a project without react-hook-form or Zustand; `frontend-dev` and `frontend-reviewer` read
  the stack from `frontend-kit.json`.
- Hooks: a project with no `build` script may get one (an existing one stays protected); oxlint no longer warns about route files.
- Mock API: orders carry `currency`, order items carry the product `slug`; an `analyst` demo account has no `orders.view`.

## 1.13.0
- The Next.js and TanStack Start dashboard variants now follow a merged folder structure: the kit's feature-first ownership
  rules plus the layout of two production projects. Next takes a production Next.js site's shape (`layouts/`, `components/{modals,wrappers,cards}`,
  `contexts/`, `config/`, `i18n/`, `api/{client,errors,services}`, `loading.tsx` per route group); Start takes a production
  TanStack Start portal's shape (one `src/shared/` root for everything global, `layout/<shell>/`, flat `features/`,
  `tabs/` and `steps/`). Each variant has a `rules/structure.md` with the tree, a path map from the names the shared rules
  and skills use, and the rules that decide. Folder structure only: no locale in the URL, no barrels.
- Both variants were then migrated and grown by real kit sessions to six areas each (Overview, Orders, Products, Customers,
  Staff, Settings) with detail pages: Next 290 unit + 40 e2e, Start 138 unit + 70 e2e, `check:full` green, reviewer findings
  fixed. Their reports fed fixes: the path map covers `api/core`, app-wide services, `layouts/errors` and the shell shape;
  structure files load for more folders; the shared dashboard rules point to the path map.
- Skills: examples use named container exports (`naming.md`), `dash-create-*` read the path map, route regeneration and
  `loadFeatureLocale` are marked conditional, setup copies and describes the new rule.

## 1.12.0
- Playwright e2e on all three dashboard frameworks, written by real kit sessions against fake-API route mocks:
  Vite (32 tests, incl. a role without `orders.view` sent to `/403`), Next.js (18 tests, 90/90 over a 5x repeat) and
  TanStack Start (22 tests, 110/110). Each covers sign-in with the redirect param, the areas, URL state surviving
  reload and back, viewer vs admin action, the `/403` redirect (also after signing in through the form) and axe in
  Arabic and English. `npm run check:full` passes on both new ones.
- `testing.md` gained "Dashboard specifics": the API URL is baked at build time so the fake URL goes into the build;
  Next runs `next build && next start` into its own `distDir`; Start serves `dist/client` with a `_shell.html` fallback
  (not `vite preview`, not `--outDir`); name the fixture callback `provide`; check the e2e port before touching code when
  every test fails (a foreign dev server on the port made a whole suite red, silently, through `reuseExistingServer`).
- The Start variant ships `e2e/serve-spa.ts`; setup copies a variant's `e2e/` files. `react.md` no longer says "no
  Next.js" without naming the variant; the Playwright Next.js reference warns about the baked `NEXT_PUBLIC_*` values.

## 1.11.2
- The TanStack Start dashboard variant was built end to end by a real kit session (login, shell, orders list with URL
  state, detail with a permission-guarded status change, `/403`, Arabic/English): typecheck, lint, 72 tests and `vite build`
  (SPA shell `_shell.html`) pass; sign-in redirect, viewer vs admin action and `/403` were checked in a browser. The session
  found a hydration mismatch for English users on reload; `framework.md` now describes the custom client entry that
  restores the session and language before hydrating.

## 1.11.1
- The Next.js dashboard variant was built end to end (login, shell, orders list with URL state, order detail with a
  permission-guarded action, `/403`, Arabic/English) by a real kit session: typecheck, lint, 101 tests and `next build` pass,
  and the sign-in, redirect, viewer-vs-admin action and `/403` were checked in a browser. It used `dash-create-route`,
  `-table`, `-filter-bar`, `-detail`, `verify` and the reviewer agent.
- `routing.md` (Next) gained a testing section (memory App Router, no `vi.mock('next/navigation')`).
- Setup tells the user to commit the kit files before the first task (the first task otherwise stops to ask).

## 1.11.0
- The `dashboard` profile now runs on three frameworks, chosen in `/frontend-kit:setup` (question 2b): Vite + TanStack Router
  (as before), TanStack Start in SPA mode, or Next.js (App Router). The variants live in
  `templates/dashboard/variants/<variant>/` and replace only the router-bound parts (`CLAUDE.md`, `routing.md`,
  `error-monitoring.md`, a `framework.md` for Start, and the `stack` / `generatedPaths` config). Tables, forms, permissions, the API
  layer and the `dash-*` skills are shared.
- `dash-create-route` has a Next.js reference (`references/next-routes.md`): thin pages, `proxy.ts` + layout guards,
  zod over `useSearchParams` with a `useListSearch` helper, no loaders.
- `validate-repo.sh` checks every variant (150-line cap, config, rule frontmatter, mentioned in the setup skill).

## 1.10.0
- `examples/`: seven reference projects (three from real runs of the skills, four generated with the detection script).
- The package manager is read from `package.json` (`packageManager`) when there is no lockfile.
- `/frontend-kit:setup` writes `.claude/frontend-kit.json` first and stops when Claude Code refuses a write in `.claude/`,
  so unadapted rule files are never left behind; running it again finishes the job.
- Repository tidy-up: this changelog, `docs/TESTING.md`, a docs index, a rewritten README, example checks in `validate-repo.sh` and CI.

## 1.9.0
- Monorepos: `kit-detect-stack.sh` reads pnpm/npm/yarn workspaces and lists the packages as `apps` (with `cwd`); the Stop
  gate runs an app's related tests inside its package.
- `kit-scope-rules.sh` also moves the paths written in a rule's text, not only its `paths:` globs.
- Setup no longer claims that denied skills disappear from Claude's list (they are blocked, not hidden; verified).
- First end-to-end run with real Claude sessions: setup (react, fullstack, refactor, new), scoped rule loading, deny rules, live hooks.

## 1.8.0
- The `frontend-status` plugin was removed from the marketplace (not a target of the kit).

## 1.7.1
- `quality-bar.md` ends with a five-point "before you say done" checklist; `post-edit.sh` warns on `any`, `as any`,
  `as unknown as` and `@ts-ignore` without needing a linter.
- Benchmark: rubric 90/90 with the kit against 81/90 without; heldout evals 98%.

## 1.7.0
- Evals for every skill (trigger cases), quiet and no-autofire cases, explicit agent-quality cases; `scripts/e2e-bench.sh` and
  `scripts/bench-judge.sh` (kit against bare, scored by the project's checks and a rubric judge).
- Skill descriptions tuned by measurement (`create-component`, `create-store`, `create-hook`, `task`).
- A solution-style `tsconfig.json` is checked with `tsc -b`; source folders are detected when `srcDirs` is not set;
  `kit-detect-stack.sh`.

## 1.6.x
- `fullstack` profile and `apps` in `frontend-kit.json` (a site and an admin in one tree): per-app commands, scoped rules
  (`kit-scope-rules.sh`), skills of both apps stay available. (1.6.0)
- `kit-package-scripts.sh` adds only the scripts the project's own tools support; an `AGENTS.md` is imported, not copied. (1.6.1)

## 1.5.0
- Setup sends one proposal and waits for approval before writing; `kit-prune.sh` moves another profile's rules to
  `.claude/kit-backup/`; settings templates deny the other profile's skills with `Skill(frontend-kit:<name>)`.

## 1.4.0
- Stack-neutral `react` profile; setup asks "new / existing / refactor", then the kind of project; stack detection; hooks work with
  oxlint/eslint/biome, oxfmt/prettier/biome, vitest/jest and any source folder; `refactor-mode` skill.

## 1.3.0
- After a passing Stop gate, one code review by the `frontend-reviewer` agent (Opus). `claude plugin eval` cases for RTL.

## 1.2.x
- `skill-suggest` (names the skills that fit each prompt), `commit-gate`, `stopGate.tests: "all"`, settings templates declare
  the marketplace with `autoUpdate`; plan mode points at a personal `/spec` skill (1.2.1).

## 1.1.x
- Fixes from the first bench (mock API, website, dashboard): wrong facts in rules, hook false positives (oxlint "no files",
  ar/en parity mid-edit), shipped `validate-i18n.ts`, theme and lint baselines, new rules and skills; repo checks and CI.

## 1.0.0
- First marketplace: the `frontend-kit` plugin (skills, agents, hooks, templates) and `/frontend-kit:setup`.
