# Developing frontend-kit

The kit is developed **against real apps, not in the abstract**. Two throw-away apps live in `playground/`
(git-ignored, never pushed) and exercise every rule, skill, agent and hook. Anything that hurts there is a bug in the kit.

## The loop

1. Do real work in a playground app with the kit installed (`/frontend-kit:setup` output: `CLAUDE.md`, `.claude/rules`, `.claude/frontend-kit.json`).
2. Friction (wrong rule, missing skill, hook false-positive, template gap) → one line in that app's `FINDINGS.md` with a file path and a suggested fix.
3. Fix it **in `plugins/`**, never only in the playground copy. Re-run setup in the playground (or diff the templates) to pull it back.
4. Prove it: `KIT_TEST_PROJECT=playground/website bash plugins/frontend-kit/scripts/test-hooks.sh` (and `dashboard`).
5. Bump `version` in `plugins/<name>/.claude-plugin/plugin.json` **only** (when set in both places `plugin.json` wins silently and `claude plugin validate` warns; users get an update only when the version changes). Run `bash scripts/validate-repo.sh`, commit only `plugins/`, `docs/`, `scripts/`, `.github/`, root files.

## What is pushed, what is not

| Path | Pushed |
| ---- | ------ |
| `plugins/**`, `.claude-plugin/**`, `docs/**`, `README.md` | yes — this is the product |
| `playground/**` (mock API, website, dashboard, FINDINGS) | **no** — local test bench, ignored by `.gitignore` |

Never copy playground domain code (Bazaar products, orders, …) into templates; extract the *pattern* and drop the domain
(`docs/TEMPLATE-CONTRACT.md`).

## Where each kind of change goes

| You want to… | Edit |
| ------------ | ---- |
| Change a convention both profiles share | `templates/shared/rules/*.md` |
| Change website- or dashboard-only conventions | `templates/<profile>/rules/*.md`, `CLAUDE.md` |
| Add a workflow Claude can run | `skills/<name>/SKILL.md` (`web-*` / `dash-*` prefix if profile-only) |
| Add a specialist reviewer / worker | `agents/<name>.md` |
| Block or automate something | `scripts/*.sh` + `hooks/hooks.json`, plus a case in `scripts/test-hooks.sh` |
| Add a new stack profile | `templates/<profile>/` + setup skill + contract doc |

## Roadmap

Source: `playground/website/FINDINGS.md` (42 items) and `playground/dashboard/FINDINGS.md` (33 items) — both built end to end
against the Bazaar mock API — plus the research report (`playground/research/reports/`).

**Done in 1.1.0** (uncommitted until reviewed)

- Phase 0 bench: mock API, website (5 pages), dashboard (5 pages).
- Phase 1 wrong facts: `qk`, `isRetry`, git commit/push on `ask`, MSW 3 / Sentry 11 facts, scripts table + `package.scripts.json`, `protectedBranches` from one answer, `.env` bootstrap, `lib.sh` path.
- Phase 2 hooks: oxlint "No files found" is a skip; ar/en parity mid-edit only warns (Stop gate still blocks); shipped `validate-i18n.ts`; SubagentStop also matches `frontend-kit:<agent>`.
- Phase 3 shipped files: `shared/scripts/validate-i18n.ts`, `shared/style/theme.css`, `shared/config/.oxlintrc.json|.oxfmtrc.json`, `shared/rules/project.md`.
- Phase 4 guidance: search params, optimistic locking + dirty guard + arrays/uploads, read-only mode, session restore, blob/CSV, table selection, i18n key-in-data/plurals/bundles, RTL details, token names, `ServerResult<T>`, token-in-body auth, `ssr:false` noindex, Start under Vitest, hydration marker; new skills `dash-create-detail`, `dash-create-settings-form`; light path in `web-create-feature`.
- Phase 5 CI files: `scripts/validate-repo.sh`, `.github/workflows/ci.yml` (not run on GitHub yet; nothing pushed).

**Next** (ranked in the research report; none started)

1. Run `claude plugin validate --strict` on the marketplace and on each plugin folder; fix its warnings.
2. A small committed fixture app so `test-hooks.sh` does not need a playground (CI installs one inline today).
3. Cut skill-listing cost: shorter descriptions, `disable-model-invocation` on side-effect skills (needs a decision: the CLAUDE.md "commit" mapping relies on auto-invocation), gate `web-*` / `dash-*` by profile.
4. Arabic-correctness block (digits, currency decimals, typography, bidi) and an RTL lint in `post-edit`; a shadcn RTL step in setup.
5. `claude plugin eval` cases for the ~10 core skills (3 positive, 2 negative trigger prompts each).
6. Install manifest + `/frontend-kit:doctor` + upgrade path for already-set-up projects.
7. Shared UI templates (`TextField`, `ConfirmDialog`, `format.ts`) once a profile's design system is decided.

Each phase = one branch, version bump, re-run setup in both playground apps and re-run their gates to prove nothing regressed.
