#!/bin/bash
# Whole-kit benchmark: one real task in a COPY of a project, with the kit (plugin + project files) or without it,
# scored by the project's own checks. Every run calls the API and costs money (capped by --max-budget-usd).
#
#   bash scripts/e2e-bench.sh <project-dir> <task-file> <kit|bare> <out.jsonl> [budget-usd]
#
#   kit   the project as set up by the kit (.claude/, CLAUDE.md) + `--plugin-dir plugins/frontend-kit`
#   bare  the same sources with no .claude/, no CLAUDE.md and no plugin
# Both arms run with project settings only (no user settings, no MCP servers) and the same tool allow-list.
# Both arms start on branch feat/bench (cut from main). The project must have node_modules installed (it is symlinked into the copy, never modified).
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$(cd "${1:?project dir}" && pwd)"
TASK="$(cat "${2:?task file}")"
ARM="${3:?kit|bare}"
OUT="${4:?out.jsonl}"
BUDGET="${5:-3}"
case "$ARM" in kit | bare) ;; *) echo "arm must be kit or bare" >&2; exit 64 ;; esac

WORK="$(mktemp -d "${TMPDIR:-/tmp}/kit-bench.XXXXXX")"
[ "${KIT_BENCH_KEEP:-}" = 1 ] && echo "kept: $WORK" >&2 || trap 'rm -rf "$WORK"' EXIT
rsync -a --exclude node_modules --exclude .git --exclude .claude --exclude CLAUDE.md --exclude dist --exclude .next "$SRC/" "$WORK/"
[ -d "$SRC/node_modules" ] && ln -s "$SRC/node_modules" "$WORK/node_modules"
if [ "$ARM" = kit ]; then
  [ -d "$SRC/.claude" ] && rsync -a --exclude state --exclude settings.local.json "$SRC/.claude/" "$WORK/.claude/"
  [ -f "$SRC/CLAUDE.md" ] && cp "$SRC/CLAUDE.md" "$WORK/"
fi
cd "$WORK" || exit 1
git init -q -b main && git add -A && git -c user.email=b@b -c user.name=b commit -q -m baseline
git update-ref refs/remotes/origin/main HEAD
BASE="$(git rev-parse HEAD)"
# A task branch already exists in both arms: the kit forbids editing on main, and a headless run cannot ask to create one.
git checkout -q -b feat/bench

ARGS=(-p "$TASK" --output-format json --permission-mode acceptEdits --setting-sources project --strict-mcp-config
  --no-session-persistence --max-budget-usd "$BUDGET"
  --allowedTools "Read" "Glob" "Grep" "Edit" "Write" "Bash(npm run *)" "Bash(pnpm *)" "Bash(npx *)" "Bash(git status*)" "Bash(git diff*)" "Bash(ls*)")
[ "$ARM" = kit ] && ARGS+=(--plugin-dir "$ROOT/plugins/frontend-kit")
START="$(date +%s)"
claude "${ARGS[@]}" >"$WORK/run.json" 2>"$WORK/run.err"
SECS=$(($(date +%s) - START))

# Score with the project's own tools (exit codes), on what the run left behind.
PM=npm; [ -f pnpm-lock.yaml ] && PM=pnpm
check() { "$@" >"$WORK/check.out" 2>&1 && echo true || echo false; }
TYPECHECK=null; LINT=null; TESTS=null
if [ -x node_modules/.bin/tsc ]; then
  if grep -q '"references"' tsconfig.json 2>/dev/null; then TYPECHECK="$(check node_modules/.bin/tsc -b)"; else TYPECHECK="$(check node_modules/.bin/tsc --noEmit)"; fi
fi
[ -x node_modules/.bin/oxlint ] && LINT="$(check node_modules/.bin/oxlint)"
[ -x node_modules/.bin/eslint ] && LINT="$(check node_modules/.bin/eslint .)"
[ -x node_modules/.bin/vitest ] && TESTS="$(check node_modules/.bin/vitest run)"
git add -A -N
NEW_FILES="$(git diff --name-only --diff-filter=A "$BASE" | grep -vE '^(\.claude|CLAUDE\.md)' | wc -l | tr -d ' ')"
NEW_TESTS="$(git diff --name-only --diff-filter=A "$BASE" | grep -cE '\.(test|spec)\.' )"
# physical direction in what the run added (left/right instead of start/end)
PHYS="$(git diff "$BASE" -- . ':!.claude' ':!CLAUDE.md' | grep -E '^\+' | grep -ciE '(margin|padding)-(left|right)|text-align: *(left|right)|\b(ml|mr|pl|pr)-[0-9]|\b(left|right)-[0-9]|marginLeft|marginRight')"
# Quality: an LLM judge scores the diff against a fixed rubric; it never sees the arm.
git diff "$BASE" -- . ':!.claude' ':!CLAUDE.md' ':!*lock*' ':!*.tsbuildinfo' ':!run.json' ':!run.err' ':!check.out' >"$WORK/run.diff"
JUDGE="$("$ROOT/scripts/bench-judge.sh" "$WORK/run.diff")"
[ -n "$JUDGE" ] || JUDGE='{"error":"no judge output"}'
jq -n --arg arm "$ARM" --arg task "$(basename "$2")" --argjson secs "$SECS" --argjson typecheck "$TYPECHECK" --argjson lint "$LINT" \
  --argjson tests "$TESTS" --argjson newFiles "$NEW_FILES" --argjson newTests "$NEW_TESTS" --argjson physical "$PHYS" \
  --slurpfile run "$WORK/run.json" --argjson judge "$JUDGE" \
  '{arm: $arm, task: $task, seconds: $secs, typecheck: $typecheck, lint: $lint, tests: $tests, newFiles: $newFiles, newTests: $newTests,
    physicalDirection: $physical, judge: $judge, costUsd: ($run[0].total_cost_usd // null), turns: ($run[0].num_turns // null), isError: ($run[0].is_error // null)}' \
  >>"$OUT" 2>/dev/null || echo "{\"arm\":\"$ARM\",\"error\":\"run produced no JSON\"}" >>"$OUT"
tail -n 1 "$OUT"
