# Developing frontend-kit

The kit is developed **against real apps, not in the abstract**. Throw-away apps live in `playground/`
(git-ignored, never pushed; `dashboard-*`, `website-*`, `combined-start`) and exercise every rule, skill, agent and hook. Anything that hurts there is a bug in the kit.

## The loop

1. Do real work in a playground app with the kit installed (`/frontend-kit:setup` output: `CLAUDE.md`, `.claude/rules`, `.claude/frontend-kit.json`).
2. Friction (wrong rule, missing skill, hook false-positive, template gap) → one line in that app's `FINDINGS.md` with a file path and a suggested fix.
3. Fix it **in `plugins/`**, never only in the playground copy. Re-run setup in the playground (or diff the templates) to pull it back.
4. Prove it: `KIT_TEST_PROJECT=$PWD/playground/website-start bash plugins/frontend-kit/scripts/test-hooks.sh` (and `dashboard-vite`; the path must be absolute).
5. Bump `version` in `plugins/<name>/.claude-plugin/plugin.json` **only** (when set in both places `plugin.json` wins silently and `claude plugin validate` warns; users get an update only when the version changes). Run `bash scripts/validate-repo.sh` and `claude plugin validate . --strict` (root, then each `plugins/<name>`; the root run does not open the plugins' files), commit only `plugins/`, `docs/`, `scripts/`, `.github/`, root files.
6. A push to `main` publishes the website, which is built from `plugins/` and `examples/`: run `cd site && npm ci && npm run build`
   first. It fails when a skill, agent, hook event or rule group has no copy there, or a demo verdict of the guard changes.

## What is pushed, what is not

| Path | Pushed |
| ---- | ------ |
| `plugins/**`, `.claude-plugin/**`, `docs/**`, `README.md` | yes — this is the product |
| `examples/**`, `CHANGELOG.md`, `scripts/**`, `.github/**` | yes |
| `playground/**` (mock API, website, dashboard, combined, fresh-*, FINDINGS) | **no** — local test bench, ignored by `.gitignore` |

Never copy playground domain code (Bazaar products, orders, …) into templates; extract the *pattern* and drop the domain
(`docs/TEMPLATE-CONTRACT.md`).

## Where each kind of change goes

| You want to… | Edit |
| ------------ | ---- |
| Change a convention every profile shares | `templates/shared/rules/*.md` |
| Change website- or dashboard-only conventions | `templates/<profile>/rules/*.md`, `CLAUDE.md` |
| Add a workflow Claude can run | `skills/<name>/SKILL.md` (`web-*` / `dash-*` prefix if profile-only) |
| Add a specialist reviewer / worker | `agents/<name>.md` |
| Block or automate something | `scripts/*.sh` + `hooks/hooks.json`, plus a case in `scripts/test-hooks.sh` |
| Add a new stack profile | `templates/<profile>/` + setup skill + contract doc + an `examples/` project |
| Change when a skill or agent is chosen | its `description`, then measure with `scripts/eval.sh` (5+ runs, before and after) |
| Show what setup does on another stack | a folder in `examples/` with a README (`validate-repo.sh` checks it) |

## Roadmap

Sources: the findings files of the local playground apps (website, dashboard, combined), the research report, and the end-to-end runs
recorded in the changelog.

Version history: [`CHANGELOG.md`](../CHANGELOG.md). How to test: [`TESTING.md`](TESTING.md).

**Next**

1. CI matrix over `examples/` (install each, run detection and the gate) so a change is tried on every stack shape before it ships.
2. Cut skill-listing cost: shorter descriptions or `disable-model-invocation` on side-effect skills. A `Skill(...)` deny rule blocks use but does not
   hide the entry, so the profile-based clean-up does not save listing tokens (the `commit` mapping in `CLAUDE.md` relies on auto-invocation: needs a decision).
3. Arabic-correctness block (digits, currency decimals, typography, bidi) and an RTL lint in `post-edit`; a shadcn RTL step in setup.
4. Install manifest + `/frontend-kit:doctor` + an upgrade path for projects that were already set up.
5. Shared UI templates (`TextField`, `ConfirmDialog`, `format.ts`) once a profile's design system is decided.
6. More project shapes: yarn, bun, Biome, Expo, Storybook, a large codebase. Every playground app now has 5+ routes (1.14.0).
   The dashboard's Next.js (1.11.1) and TanStack Start (1.11.2) variants are verified end to end by real sessions, and
   all three dashboards have Playwright e2e with a live-checked `/403` (1.12.0). Not covered yet: Sentry setup on the new
   variants, WebKit/Firefox, the visual RTL check of the storefronts, the real host's `_shell.html` fallback, and a dark project on Start.
7. Agents are rarely chosen unprompted when the code is in the prompt (`evals/info`); decide whether the descriptions should push harder.

Each phase = one branch, version bump, re-run setup in the playground apps it touches and re-run their gates to prove nothing regressed.
