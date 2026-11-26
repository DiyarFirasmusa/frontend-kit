# Setup eval (new project, end to end)

Runs the setup skill's new-project path for real, headless, on three fictional projects, and scores what it builds with
objective checks. Every run calls the API and costs money: each run is capped by `--budget` (USD).

```sh
node scripts/setup-eval/run.mjs --runs 2 --parallel 3 --keep          # all three scenarios, twice each
node scripts/setup-eval/run.mjs --scenario website-bakery --runs 1    # one scenario, once
node scripts/setup-eval/grade.mjs <project-dir> scripts/setup-eval/scenarios/<id>   # grade a folder again, no API
```

Needs Node 24+, npm, git, jq (the kit's hooks) and a signed-in Claude Code CLI (`CLAUDE_BIN` to point at it). Works in
Git Bash, PowerShell, Linux and macOS.

## What a run does

1. Makes a fresh folder with `mkdtemp` in the OS temp dir (never inside a git repository) and copies the scenario's files
   into it (the OpenAPI file goes to `docs/api/openapi.json`).
2. Runs `claude -p "/wajiha-kit:setup ..."` there with `--plugin-dir plugins/wajiha-kit`, all five answers up front and
   "go ahead without waiting", `--permission-mode acceptEdits`, project settings only, no MCP servers, an explicit
   `--allowedTools` list (file tools; `npm`, `npx`, `node`, `git`, `tar`, `mkdir`, `cp`, `mv`, `rm`, `ls`, `cat` and a few
   read-only helpers), `--max-budget-usd` and a timeout. The kit's guard hooks stay on. The run skips the dev server and
   Playwright (nobody is there to look); everything else in the flow is required.
   Claude Code always asks before a write to `CLAUDE.md` or `.claude/` (a "sensitive file"), and in `-p` only a person
   or a permission handler can say yes (allow rules cannot). `approver.mjs` is that handler (`--permission-prompt-tool`),
   playing a cooperative user at the keyboard: yes to Write/Edit of `CLAUDE.md` and `.claude/**` in the project, and to
   shell commands that stay in the project or only read the plugin folder (a `$locale` route path, `tar -C <plugin>`,
   `find | wc`); no to network tools, `git commit/push/reset`, `npm install/ci/uninstall/publish` (the kit's ask list),
   other shells, `..`, outside paths, unknown `$VARS` and writes into the plugin. It logs each request to `approvals.jsonl`.
3. Grades the folder (`grade.mjs`) and appends one JSON line to `results.jsonl`.

## Checks (each `true`, `false`, or `null` when it does not apply)

| Check | Passes when |
| --- | --- |
| `kitConfig` | `.claude/wajiha-kit.json` parses, `mode` `new`, the right `profile`, commands, stack, string ports |
| `claudeFiles` | `CLAUDE.md`, `.claude/rules/` (with `git.md`), a valid `.claude/settings.json`, no `{{PLACEHOLDER}}` left |
| `gitignore` | `.claude/state/` and `.claude/settings.local.json` are ignored |
| `renamed` | `package.json` and the lockfile carry the new kebab-case name |
| `noCommits` | the project has no commit (the kit never commits) |
| `openapi` | `docs/api/openapi.json` is the scenario's spec (dashboard, fullstack) |
| `entities` | each entity has a feature folder, a route, mock data and a nav item (dashboard, fullstack admin) |
| `pages` | each page has a route, a feature folder and a nav item; the unused demo pages are gone (website, fullstack site) |
| `demoGone` | the demo feature, route, mock and e2e paths listed in `foundations.md` are deleted |
| `leakSweep` | the sweep of `new-project-flow.md` (same pattern, same noise filter) prints nothing |
| `languages` | the languages list, the default language and the language switcher match the answer |
| `noOutsideWrites` | the file tools wrote only inside the project, nothing appeared next to it, the plugin's `starters/` are unchanged |
| `typecheck`, `lint`, `fmt`, `tests`, `i18n`, `boundaries`, `build` | the foundation's own scripts exit 0 (`build` for website and fullstack with `VITE_SITE_URL`) |

## Output

`<out>/results.jsonl` (default `<os temp>/wajiha-setup-eval-results`): one line per run with `pass`, `failed`, every
check, `costUsd`, `minutes`, `turns`, `stop` (`success`, `error_max_budget_usd`, `timeout`, ...), the permission
denials and the reason for each failed check. `<out>/runs/<run id>/` keeps the prompt, the full stream-json transcript,
stderr and one log per check. `--keep` keeps the project folders for a look; without it they are deleted after grading.

## Scenarios

`scenarios/<id>/scenario.json` holds the foundation, the five answers, the files to put in the folder and what the
grader expects. All three are fictional:

| Scenario | Foundation | Languages | Backend |
| --- | --- | --- | --- |
| `dashboard-clinic` | dashboard: patients, doctors, appointments | Arabic only | `openapi.json` (pickers, a date-time, no DELETE on appointments) |
| `website-bakery` | website: home, menu, about, news, contact | Arabic and English | none |
| `fullstack-training` | site (home, about, courses, contact) and admin (courses, enrolments) | Arabic and English | `openapi.json` |
