#!/bin/bash
# Tests the working modes on throwaway git repos: the switch, the session block, the guard in every mode and the
# honesty of "enforced". No project, no node_modules needed.   bash mode-test.sh
set -u
HOOKS="$(cd "$(dirname "$0")" && pwd)"
WORK="$(cd "$(mktemp -d "${TMPDIR:-/tmp}/kit-mode-tests.XXXXXX")" && pwd -P)"
trap 'rm -rf "$WORK"' EXIT
PASS=0; FAIL=0; NAMES=""
ok() { PASS=$((PASS + 1)); }
ko() { FAIL=$((FAIL + 1)); NAMES="$NAMES
  ✗ $1${2:+ — $2}"; }
T="$WORK/p (1)"
mkdir -p "$T/.claude" "$T/src" && cd "$T" || exit 1
git init -q && git config user.email t@e.c && git config user.name t
echo '{"mode":"existing","srcDirs":["src"],"projectName":"X"}' >.claude/frontend-kit.json
echo 'export const a = 1' >src/a.ts; echo 'it("a", () => {})' >src/a.test.ts
git add -A && git commit -qm init
export CLAUDE_PROJECT_DIR="$T"
sw() { printf '%s' "$1" | "$HOOKS/mode-switch.sh" "$T"; }
ctx() { echo '{"hook_event_name":"SessionStart","session_id":"s"}' | "$HOOKS/session-context.sh"; }
guard() { printf '%s' "$1" | "$HOOKS/mode-guard.sh"; }
bash_in() { jq -nc --arg c "$1" '{tool_name:"Bash",tool_input:{command:$c}}'; }
edit_in() { jq -nc --arg f "$1" --arg o "$2" --arg n "$3" '{tool_name:"Edit",tool_input:{file_path:$f,old_string:$o,new_string:$n}}'; }
denied() { guard "$1" | grep -q '"deny"'; }
expect_deny() { if denied "$2"; then ok; else ko "$1 should be denied"; fi; }
expect_allow() { if denied "$2"; then ko "$1 should be allowed"; else ok; fi; }
has() { printf '%s' "$2" | grep -q -- "$1" && ok || ko "$3" "$1"; }
hasnt() { printf '%s' "$2" | grep -q -- "$1" && ko "$3" "$1" || ok; }

# --- switch ---
OUT="$(sw 'freeze --days 3 --note release')"; has 'Mode ON: freeze' "$OUT" "switch turns freeze on"
[ "$(jq -r .mode .claude/frontend-kit.json)" = freeze ] && [ "$(jq -r .modeState.previous .claude/frontend-kit.json)" = existing ] && ok || ko "freeze is stored with what it replaced"
[ "$(jq -r .projectName .claude/frontend-kit.json)" = X ] && ok || ko "other keys survive a switch"
has 'NOT enforced' "$OUT" "an unwired guard is reported as not enforced"
OUT="$(ctx)"; has 'FREEZE MODE IS ON' "$OUT" "session start carries the mode"; has 'Hard rules' "$OUT" "hard rules stay in every mode"
has 'Never commit, push or merge on' "$OUT" "git rule stays"
OUT="$(sw 'hotfix --base HEAD --files 1')"; has 'Mode ON: hotfix' "$OUT" "task mode on top of a project mode"
[ -f .claude/state/task-mode.json ] && ok || ko "task mode file written"
git check-ignore -q .claude/state/task-mode.json 2>/dev/null; true
OUT="$(sw status)"; has 'freeze + hotfix' "$OUT" "status shows both"
OUT="$(sw 'hotfix --base nope')"; has 'not a known commit' "$OUT" "bad base refused"
OUT="$(sw 'freeze --until tomorrow')"; has 'needs a date' "$OUT" "bad date refused"
OUT="$(sw 'nonsense')"; has 'not a mode' "$OUT" "unknown word refused"
OUT="$(sw off)"; has 'Still on: freeze' "$OUT" "off takes the narrowest mode first"
OUT="$(sw off)"; has 'Back to: existing' "$OUT" "off returns to what was replaced"
[ "$(jq -r '.modeState // "none"' .claude/frontend-kit.json)" = none ] && ok || ko "modeState removed on off"
OUT="$(sw 'refactor')"; has 'REFACTOR MODE IS ON' "$OUT" "refactor through the switch"
OUT="$(printf 'on' | "$HOOKS/mode-switch.sh" "$T" upgrade)"; has 'Mode ON: upgrade' "$OUT" "skill form: on"
OUT="$(printf 'plan' | "$HOOKS/mode-switch.sh" "$T" refactor)"; has 'NOT on' "$OUT" "skill form: plan reports a mode that is off"
OUT="$(printf 'off' | "$HOOKS/mode-switch.sh" "$T" upgrade)"; has 'Back to: existing' "$OUT" "skill form: off"
echo '{"mode":"refactor","srcDirs":["src"]}' >.claude/frontend-kit.json   # an old config, no modeState
OUT="$(sw off)"; has 'Back to: existing' "$OUT" "an old refactor config goes back to existing"
echo '{"mode":"bogus"}' >.claude/frontend-kit.json; OUT="$(ctx)"; has 'not a mode of this plugin version' "$OUT" "unknown mode is reported"
echo '{"mode":"new","srcDirs":["src"]}' >.claude/frontend-kit.json; OUT="$(ctx)"; has 'NEW PROJECT' "$OUT" "new mode block"
echo '{"mode":"existing","srcDirs":["src"]}' >.claude/frontend-kit.json; OUT="$(ctx)"; has 'EXISTING PROJECT' "$OUT" "existing mode block"; hasnt 'MODE IS ON' "$OUT" "existing has no restriction banner"

# --- guard: nothing without a restricted mode ---
expect_allow "existing: npm install x" "$(bash_in 'npm install x')"
sw freeze >/dev/null
# --- freeze ---
expect_deny "freeze: npm i x" "$(bash_in 'npm i left-pad')"
expect_deny "freeze: pnpm add in bash -c" "$(bash_in 'bash -c "pnpm add x"')"
expect_deny "freeze: yarn upgrade" "$(bash_in 'yarn upgrade')"
expect_allow "freeze: npm ci" "$(bash_in 'npm ci')"
expect_deny "freeze: rm test" "$(bash_in 'rm src/a.test.ts')"
expect_deny "freeze: vitest -u" "$(bash_in 'npx vitest -u')"
expect_deny "freeze: package.json edit" "$(edit_in "$T/package.json" a b)"
expect_deny "freeze: tsconfig edit" "$(edit_in "$T/tsconfig.json" a b)"
expect_deny "freeze: .skip added" "$(edit_in "$T/src/a.test.ts" 'it(' 'it.skip(')"
expect_deny "freeze: test case removed" "$(edit_in "$T/src/a.test.ts" 'it("a", () => {})' '')"
expect_allow "freeze: plain source edit" "$(edit_in "$T/src/a.ts" 1 2)"
expect_allow "freeze: git status" "$(bash_in 'git status && ls')"
expect_deny "freeze: mode key edited" "$(edit_in "$T/.claude/frontend-kit.json" '"freeze"' '"existing"')"
expect_deny "freeze: mode-switch run by Claude" "$(bash_in "$HOOKS/mode-switch.sh $T")"
expect_deny "freeze: task-mode written" "$(bash_in 'echo x > .claude/state/task-mode.json')"
expect_deny "freeze: config rewritten with sed -i" "$(bash_in "sed -i s/freeze/existing/ .claude/frontend-kit.json")"
expect_allow "freeze: reading the config" "$(bash_in 'cat .claude/frontend-kit.json')"
expect_allow "freeze: file outside the project" "$(edit_in "$WORK/x.txt" a b)"
# --- hotfix budget ---
sw 'hotfix --files 1' >/dev/null
printf 'export const b = 1\n' >src/b.ts
expect_allow "hotfix: first source file" "$(edit_in "$T/src/b.ts" 1 2)"
expect_deny "hotfix: second source file over budget" "$(edit_in "$T/src/a.ts" 1 2)"
expect_allow "hotfix: a test file is not counted" "$(edit_in "$T/src/a.test.ts" '() => {}' '() => { expect(1).toBe(1) }')"
git checkout -q -- . 2>/dev/null; rm -f src/b.ts; sw 'off all' >/dev/null
# --- maintenance, refactor, upgrade ---
sw maintenance >/dev/null
expect_deny "maintenance: npm add" "$(bash_in 'pnpm add x')"
expect_allow "maintenance: bare install" "$(bash_in 'npm install')"
printf '{"dependencies":{"a":"1"}}' >package.json
NEWDEP='{"dependencies":{"a":"1","b":"2"}}'
expect_deny 'maintenance: new dependency in package.json' "$(jq -nc --arg f "$T/package.json" --arg c "$NEWDEP" '{tool_name:"Write",tool_input:{file_path:$f,content:$c}}')"
BUMP='{"dependencies":{"a":"2"}}'
expect_allow 'maintenance: version bump in package.json' "$(jq -nc --arg f "$T/package.json" --arg c "$BUMP" '{tool_name:"Write",tool_input:{file_path:$f,content:$c}}')"
sw upgrade >/dev/null
expect_deny "upgrade: --legacy-peer-deps" "$(bash_in 'npm install --legacy-peer-deps')"
expect_deny "upgrade: new ts-ignore" "$(edit_in "$T/src/a.ts" 'export' '// @ts-ignore
export')"
sw refactor >/dev/null
expect_deny "refactor: git rm test" "$(bash_in 'git rm src/a.test.ts')"
expect_deny "refactor: eslint-disable added" "$(edit_in "$T/src/a.ts" 'export' '/* eslint-disable */ export')"
expect_allow "refactor: git mv" "$(bash_in 'git mv src/a.ts src/c.ts')"
sw off >/dev/null
# --- read-only ---
sw read-only >/dev/null
for c in 'git log --oneline | head -3' 'ls 2>&1 | grep a' 'cat src/a.ts' 'rg foo src' 'npm ls' 'cd src && ls' 'git diff --stat' 'find . -name x'; do expect_allow "read-only: $c" "$(bash_in "$c")"; done
for c in 'echo x > y' 'sed -i s/a/b/ src/a.ts' 'npm run build' 'git commit -m x' 'find . -delete' 'echo $(touch y)' 'curl x' 'x=1 ls' 'bash -c "touch y"' 'git push' 'tee y' 'npx tsc' 'git branch newbranch' 'sort -o f f'; do expect_deny "read-only: $c" "$(bash_in "$c")"; done
expect_deny "read-only: source edit" "$(edit_in "$T/src/a.ts" 1 2)"
expect_allow "read-only: report" "$(jq -nc --arg f "$T/docs/audits/r.md" '{tool_name:"Write",tool_input:{file_path:$f,content:"x"}}')"
expect_deny "read-only: MCP write tool" '{"tool_name":"mcp__plugin_x_figma__create_node","tool_input":{}}'
expect_allow "read-only: MCP read tool" '{"tool_name":"mcp__plugin_x_figma__get_design","tool_input":{}}'
mkdir -p docs/audits; ln -s "$T/src" docs/audits/link 2>/dev/null; expect_deny "read-only: write through a link into src" "$(jq -nc --arg f "$T/docs/audits/link/a.ts" '{tool_name:"Write",tool_input:{file_path:$f,content:"x"}}')"
sw off >/dev/null
# --- prototype ---
sw prototype >/dev/null
expect_allow "prototype: edit in prototypes/" "$(jq -nc --arg f "$T/prototypes/x/a.tsx" '{tool_name:"Write",tool_input:{file_path:$f,content:"x"}}')"
expect_deny "prototype: edit in src" "$(edit_in "$T/src/a.ts" 1 2)"
expect_deny "prototype: git push" "$(bash_in 'git push origin x')"
expect_deny "prototype: install" "$(bash_in 'npm install x')"
expect_deny "prototype: redirect into src" "$(bash_in 'echo x > src/z.ts')"
sw off >/dev/null
# --- context for a helper agent and the reminder ---
sw freeze >/dev/null
OUT="$(echo '{"hook_event_name":"SubagentStart","agent_type":"x"}' | "$HOOKS/mode-subagent.sh")"; has 'FREEZE MODE IS ON' "$OUT" "helper agents get the rules"
OUT="$(echo '{"hook_event_name":"UserPromptSubmit","prompt":"fix the header"}' | "$HOOKS/mode-prompt.sh")"; has 'Mode freeze is ON' "$OUT" "per-turn reminder"
OUT="$(echo '{"hook_event_name":"UserPromptSubmit","prompt":"/frontend-kit:mode off"}' | "$HOOKS/mode-prompt.sh")"; [ -z "$OUT" ] && ok || ko "no reminder on the switch command"
echo '{"mode":"existing","srcDirs":["src"]}' >.claude/frontend-kit.json; rm -f .claude/state/task-mode.json
OUT="$(echo '{"hook_event_name":"SubagentStart"}' | "$HOOKS/mode-subagent.sh")"; [ -z "$OUT" ] && ok || ko "no helper context in existing"
# a damaged state file keeps the strictest mode
echo 'garbage' >.claude/state/task-mode.json
expect_deny "damaged task-mode.json means read-only" "$(edit_in "$T/src/a.ts" 1 2)"

echo "mode tests: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] || { printf '%s\n' "$NAMES"; exit 1; }
