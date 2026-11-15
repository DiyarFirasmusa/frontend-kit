---
name: setup
description: Install frontend-kit's project files into the current project — CLAUDE.md, .claude/rules/, .claude/settings.json and .claude/frontend-kit.json — for the website (TanStack Start) or dashboard (Vite + TanStack Router) profile. Run with /frontend-kit:setup.
disable-model-invocation: true
---

# frontend-kit setup

Plugins can't load CLAUDE.md, rules or most settings, so this copies them into the project.
Skills, agents, hooks and MCP servers already come from the plugin; nothing of those is copied.

Templates live in `${CLAUDE_PLUGIN_ROOT}/templates/`:
`shared/rules/` (every profile) and `<profile>/` (`CLAUDE.md`, `rules/`, `settings.json`, `frontend-kit.json`).

## 1. Ask (one message, defaults filled in)

Read what you can first, then ask the user to confirm or change each value in **one** question:

| Value | Default from |
| ----- | ------------ |
| Profile: `website` or `dashboard` | `@tanstack/react-start` in package.json → website; `vite` + `@tanstack/react-router` → dashboard |
| `{{PROJECT_NAME}}` | package.json `name` |
| `{{PROJECT_DESCRIPTION}}` | package.json `description` |
| `{{GITHUB_REPO}}` | `git remote get-url origin` → `owner/name` |
| `{{DEFAULT_BRANCH}}` | `git symbolic-ref refs/remotes/origin/HEAD` → `main` |
| `{{PROTECTED_BRANCHES}}` | `main, master` |
| `{{LIVE_HOST}}` | ask (production host, never tested against); may be empty |
| `{{UAT_HOST}}` | ask (test environment); may be empty |
| `{{DEV_PORT}}` | the dev script's `--port`, else 3000 (website) / 5173 (dashboard) |
| `{{E2E_PORT}}` | `playwright.config.*` port, else 3100 |
| `{{API_BASE_ENV}}` | the `VITE_*` / server env name for the API base URL in `.env.example` |

Never read `.env` or `.env.local` to find a value; `.env.example` only.

## 2. Plan the copy

| Source | Target |
| ------ | ------ |
| `templates/<profile>/CLAUDE.md` | `./CLAUDE.md` |
| `templates/shared/rules/*.md` + `templates/<profile>/rules/*.md` | `./.claude/rules/` |
| `templates/<profile>/settings.json` | `./.claude/settings.json` (merge, below) |
| `templates/<profile>/frontend-kit.json` | `./.claude/frontend-kit.json` |
| `templates/shared/package.scripts.json` | `./package.json` `scripts` (add only the names that are missing) |
| `templates/shared/scripts/validate-i18n.ts` | `./scripts/validate-i18n.ts` (only if the project has no i18n validator) |
| `templates/shared/config/.oxlintrc.json`, `.oxfmtrc.json` | `./` (only when the project has no oxlint / oxfmt config yet) |
| `templates/shared/style/theme.css` | the profile's theme path (website `src/shared/style/theme.css`, dashboard `src/styles/theme.css`), only when the project has no theme file; say which fonts it imports |

In every copied file replace each `{{PLACEHOLDER}}` with the confirmed value. In `frontend-kit.json` also set
`projectName`, `projectDescription`, `profile`, `liveHosts` (the live host, plus `api.`/`www.` variants the
user names), `uatHost`, `githubRepo`, `defaultBranch`, `protectedBranches` (the array built from the one `{{PROTECTED_BRANCHES}}` answer — never leave the template's
`["main","master"]` when the user chose others), `devPort`, `e2ePort` and
`apiBaseEnv`. The plugin's skills and agents read these (written `<defaultBranch>`, `<devPort>`, … in their
text), so every key must be present. An empty value stays an empty string or empty list — never invent a host.
Drop empty hosts from `liveHosts` and from `sandbox.network.deniedDomains` in `settings.json` (an empty entry there
is an invalid pattern); with no live host, remove `deniedDomains` altogether.

## 3. Existing files: show, then ask

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
  - Show the merged result's diff before writing it.
- `frontend-kit.json` — keep existing values, add missing keys.

## 4. Finish

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
  - Hook self-test: `KIT_TEST_PROJECT="$PWD" bash "${CLAUDE_PLUGIN_ROOT}/scripts/test-hooks.sh"`.
- Do not commit. The user commits when they say so.
