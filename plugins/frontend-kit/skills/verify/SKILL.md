---
name: verify
description: Run the full quality gate — typecheck, lint, format, unit tests, i18n validation, e2e and build — and report the real numbers, then record the result for the status band. Use before asking to commit, or when the user says check, test, verify, "is it working", "run all checks".
argument-hint: "[quick]"
---

# Verify

Values written `<name>` below (`<defaultBranch>`, `<devPort>`, `<githubRepo>`, `<liveHost>`, `<uatHost>`, …) are this project's: read them from `.claude/frontend-kit.json` (`liveHosts[0]` for `<liveHost>`), else from `CLAUDE.md`.

Run each gate, read its output, report what it said. Never call a gate
passed without its output in front of you. Stop at the first failure, fix the
cause (no `any`, casts, skips or `--no-verify`), and run the gates again.

| # | Gate | Command | When |
|---|------|---------|------|
| 1 | Types | `npm run typecheck` | always |
| 2 | Lint | `npm run lint:check` | always (0 errors; new warnings from this change fixed) |
| 3 | Format | `npm run fmt:check` | always |
| 4 | Unit + integration | `npm run test` | always |
| 5 | Translations | `npm run i18n:validate` | a locale file or a `t()` call changed |
| 6 | End-to-end | `npm run test:e2e` | a flow, route, layout or dialog changed (own server on :<e2ePort>) |
| 7 | Build | `npm run build` | always, last |

The script names are the defaults; if `CLAUDE.md` or `.claude/frontend-kit.json`
(`commands`) names different ones, use those. A gate whose script doesn't
exist is reported as "not set up", never as passed.

`quick` (mid-task only, never before a commit): gates 1, 2 and
`npx vitest related --run <changed files>`.

Changed files: `git diff --name-only origin/<defaultBranch>...HEAD` plus
`git status --short`.

Website (TanStack Start): the build also compiles the server bundle — a
browser-only API used during render fails here or at SSR, not in unit tests.
Dashboard (Vite + TanStack Router): the build is the client bundle only.

## Report

```
Gate      Result
types     pass
lint      pass (0 errors, 2 warnings — pre-existing)
format    pass
tests     pass — 812 passed, 0 failed (109 files)
i18n      pass | skipped (no locale change)
e2e       pass — 64 passed | skipped (why)
build     pass — 1.9 MB, largest chunk 210 kB
Not checked: <manual browser check, UAT, …>
```

## Record

After the run, record the overall result for the session banner and the status band:

```sh
"${CLAUDE_PLUGIN_ROOT}/scripts/record-gate.sh" pass verify "types, lint, format, 812 tests, i18n, e2e, build"
"${CLAUDE_PLUGIN_ROOT}/scripts/record-gate.sh" fail verify "tests: 2 failed in <area>"
```
