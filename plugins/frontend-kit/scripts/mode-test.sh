#!/bin/bash
# Tests the working modes on throwaway git repos: the switch, the session block, the guard in every mode (what it
# denies AND what it lets through), the default mode staying silent, and the honesty of "enforced".
# No project and no node_modules needed.   bash mode-test.sh        (KIT_TEST_KEEP=1 keeps the throwaway folders)
#
# An allow means exit 0 with no output. A crashed guard also blocks, so it never counts as an allow or as a deny.
set -u
HOOKS="$(cd "$(dirname "$0")" && pwd)"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/kit-mode-tests.XXXXXX")" || exit 1
WORK="$(cd "$WORK" && pwd -P)" || exit 1
[ -n "$WORK" ] || exit 1
[ -n "${KIT_TEST_KEEP:-}" ] || trap 'rm -rf "$WORK"' EXIT
export GIT_CEILING_DIRECTORIES="$WORK"
PASS=0
FAIL=0
NAMES=""
SECTION=""
ok() { PASS=$((PASS + 1)); }
ko() {
  FAIL=$((FAIL + 1))
  NAMES="$NAMES
  ✗ [$SECTION] $1${2:+ — $(printf '%s' "$2" | tr '\n' ' ' | cut -c1-170)}"
}
same() { if [ "$2" = "$3" ]; then ok; else ko "$1" "got: $2"; fi; }
has() { case "$3" in *"$2"*) ok ;; *) ko "$1" "missing: $2" ;; esac; }
hasnt() { case "$3" in *"$2"*) ko "$1" "unexpected: $2" ;; *) ok ;; esac; }
file_mode() { stat -c %a "$1" 2>/dev/null || stat -f %Lp "$1"; }
git_in() {
  local dir="$1"
  shift
  git -C "$dir" -c user.email=t@example.com -c user.name=t -c commit.gpgsign=false -c core.hooksPath=/dev/null "$@"
}

BASE="$WORK/base"
mkdir -p "$BASE/.claude" "$BASE/src/components" "$BASE/tests" "$BASE/scripts" || exit 1
printf '{\n  "mode": "existing",\n  "projectName": "X",\n  "srcDirs": ["src"]\n}\n' >"$BASE/.claude/frontend-kit.json"
printf '{"name":"x","scripts":{"lint":"eslint ."},"dependencies":{"lodash":"4.17.20"}}\n' >"$BASE/package.json"
printf '.claude/state/\n' >"$BASE/.gitignore"
echo 'export const a = 1' >"$BASE/src/a.ts"
echo 'export const b = 1' >"$BASE/src/b.ts"
echo 'it("a", () => {})' >"$BASE/src/a.test.ts"
echo '{}' >"$BASE/tsconfig.json"
git_in "$BASE" init -q -b work || exit 1
git_in "$BASE" add -A && git_in "$BASE" commit -qm init || exit 1

N=0
T=""
fresh() { # [project mode] [task mode]: a new copy of the base project
  N=$((N + 1))
  T="$WORK/p ($N)"
  cp -R "$BASE" "$T" || exit 1
  [ -z "${1:-}" ] || printf '{\n  "mode": "%s",\n  "projectName": "X",\n  "srcDirs": ["src"]\n}\n' "$1" >"$T/.claude/frontend-kit.json"
  if [ -n "${2:-}" ]; then
    mkdir -p "$T/.claude/state"
    printf '{"mode":"%s"}\n' "$2" >"$T/.claude/state/task-mode.json"
  fi
  export CLAUDE_PROJECT_DIR="$T"
}
no_config() { # a project that was never set up
  fresh
  mv "$T/.claude/frontend-kit.json" "$WORK/unused.$N.json"
}
config() { printf '%s\n' "$1" >"$T/.claude/frontend-kit.json"; }
sw() { printf '%s' "$1" | "$HOOKS/mode-switch.sh" "$T" ${2:-}; }
ctx() { echo '{"hook_event_name":"SessionStart","session_id":"s"}' | "$HOOKS/session-context.sh"; }
prompt() { jq -nc --arg p "$1" '{hook_event_name:"UserPromptSubmit",prompt:$p}' | "$HOOKS/mode-prompt.sh"; }
subagent() { echo '{"hook_event_name":"SubagentStart","agent_type":"x"}' | "$HOOKS/mode-subagent.sh"; }
status() { "$HOOKS/mode-status.sh" "$T"; }

# --- the guard ------------------------------------------------------------------------------------------------------
bash_in() { jq -nc --arg c "$1" --arg d "${2:-$T}" '{tool_name:"Bash",cwd:$d,tool_input:{command:$c}}'; }
edit_in() { jq -nc --arg f "$T/$1" --arg o "$2" --arg n "$3" '{tool_name:"Edit",tool_input:{file_path:$f,old_string:$o,new_string:$n}}'; }
write_in() { jq -nc --arg f "$T/$1" --arg c "$2" '{tool_name:"Write",tool_input:{file_path:$f,content:$c}}'; }
run_guard() {
  GUARD_OUT="$(printf '%s' "$1" | "$HOOKS/mode-guard.sh" 2>&1)"
  GUARD_CODE=$?
}
allow() {
  run_guard "$2"
  if [ "$GUARD_CODE" -eq 0 ] && [ -z "$GUARD_OUT" ]; then ok; else ko "should be allowed: $1" "exit $GUARD_CODE $GUARD_OUT"; fi
}
deny() {
  run_guard "$2"
  if [ "$GUARD_CODE" -eq 0 ] && printf '%s' "$GUARD_OUT" | jq -e '.hookSpecificOutput.permissionDecision == "deny"' >/dev/null 2>&1; then ok; else ko "should be denied: $1" "exit $GUARD_CODE $GUARD_OUT"; fi
}
allow_sh() { allow "$1" "$(bash_in "$1")"; }
deny_sh() { deny "$1" "$(bash_in "$1")"; }
allow_each() {
  local line
  while IFS= read -r line; do [ -z "$line" ] || allow_sh "$line"; done
}
deny_each() {
  local line
  while IFS= read -r line; do [ -z "$line" ] || deny_sh "$line"; done
}
NL='
'

# --- no config and the default mode: nothing happens ----------------------------------------------------------------
NOJQ="$WORK/nojq"
mkdir -p "$NOJQ"
for tool in bash sh dirname cat tr sed awk grep git date mkdir; do ln -s "$(command -v "$tool")" "$NOJQ/$tool"; done
for setting in none existing nokey new off-task stale-text; do
  SECTION="default: $setting"
  case "$setting" in
    none) no_config ;;
    existing) fresh existing ;;
    nokey) fresh; config '{"projectName":"X","srcDirs":["src"]}' ;;
    new) fresh new ;;
    off-task) fresh existing; mkdir -p "$T/.claude/state"; printf '{"mode":"off"}\n' >"$T/.claude/state/task-mode.json" ;;
    stale-text) fresh; config '{"mode":"existing","projectDescription":"a refactor and upgrade tool with a freeze mode"}' ;;
  esac
  allow "npm install" "$(bash_in 'npm install x')"
  allow "rm of a test" "$(bash_in 'rm src/a.test.ts')"
  allow "snapshot update" "$(bash_in 'npx vitest -u')"
  allow "mode-switch by name" "$(bash_in 'bash /x/scripts/mode-switch.sh . status')"
  allow "a skipped test" "$(edit_in src/a.test.ts 'it(' 'it.skip(')"
  allow "package.json" "$(edit_in package.json lodash lodash2)"
  allow "a mode word in a file" "$(write_in src/dark-mode-switch.tsx x)"
  allow "a config edit" "$(edit_in .claude/frontend-kit.json '"X"' '"Y"')"
  allow "MCP" '{"tool_name":"mcp__x__create_thing","tool_input":{}}'
  allow "input it cannot read" 'garbage'
  # none of it needs jq
  OUT="$(echo '{"tool_name":"mcp__x__get_thing"}' | PATH="$NOJQ" /bin/bash "$HOOKS/mode-guard.sh" 2>&1)"
  same "guard without jq: exit" "$?" 0
  same "guard without jq: silent" "$OUT" ""
  same "prompt hook without jq" "$(echo '{"prompt":"x"}' | PATH="$NOJQ" /bin/bash "$HOOKS/mode-prompt.sh" 2>&1)" ""
  same "prompt hook silent" "$(prompt 'fix the header')" ""
  same "helper hook silent" "$(subagent)" ""
  OUT="$(ctx)"
  has "hard rules" "Hard rules" "$OUT"
  if [ "$setting" = new ]; then
    has "new keeps its block" "NEW PROJECT" "$OUT"
    hasnt "no fixed folder layout" "feature folders, strict types" "$OUT"
  else
    hasnt "no mode block" "EXISTING PROJECT" "$OUT"
    hasnt "no mode line" "mode status" "$OUT"
    same "nothing after the last hard rule" "$(printf '%s\n' "$OUT" | tail -1 | cut -c1-3)" "6. "
  fi
done
SECTION="default: big input"
fresh existing
jq -nc --arg f "$T/src/big.ts" '{tool_name:"Write",tool_input:{file_path:$f,content:("x" * 600000)}}' >"$WORK/big.json"
( set -o pipefail; cat "$WORK/big.json" | "$HOOKS/mode-guard.sh" ) >/dev/null 2>&1
same "input is read to the end (no closed pipe)" "$?" 0
SECTION="session rules"
hasnt "no fixed languages" "Arabic + English" "$(ctx)"

# --- every restricted mode: ordinary words are not the mode ---------------------------------------------------------
for setting in "maintenance " "refactor " "upgrade " "freeze " "existing hotfix"; do
  SECTION="mode words: $setting"
  # shellcheck disable=SC2086
  fresh $setting
  allow "theme switch file" "$(write_in src/components/dark-mode-switch.tsx 'export const a = 1')"
  allow "switcher file" "$(write_in src/components/mode-switcher.tsx x)"
  allow "lookalike script" "$(write_in scripts/mode-lib.sh x)"
  allow "lookalike state name" "$(write_in src/task-mode.json '{}')"
  allow "lookalike config name" "$(write_in src/my-frontend-kit.json '{}')"
  allow "another key with a mode word" "$(edit_in .claude/frontend-kit.json '"X"' '"new existing freeze refactor"')"
  allow_each <<'EOF'
git add src/components/theme-mode-switch.tsx
npx eslint src/components/mode-switch.tsx
git commit -m "feat: add mode-switch"
git commit -m "docs: how .claude/frontend-kit.json holds the mode"
git commit -m "chore: ignore .claude/state/task-mode.json and mode-switch.sh"
git add .claude/frontend-kit.json
git diff -- .claude/frontend-kit.json
npx prettier --check .claude/frontend-kit.json
test -f .claude/state/task-mode.json
cat .claude/frontend-kit.json
cp .claude/frontend-kit.json /tmp/copy.json
grep -rn freeze src
git status && ls
git switch -c feat/freeze-banner
echo "refactor mode is on"
cd src && ls
EOF
  allow "file outside the project" "$(jq -nc --arg f "$WORK/outside.txt" '{tool_name:"Write",tool_input:{file_path:$f,content:"x"}}')"
done

# --- the mode is the user's -----------------------------------------------------------------------------------------
for setting in "maintenance " "refactor " "upgrade " "freeze " "existing hotfix" "existing prototype"; do
  SECTION="switch by Claude: $setting"
  # shellcheck disable=SC2086
  fresh $setting
  mode="${setting%% *}"
  deny "bare word edit" "$(edit_in .claude/frontend-kit.json "\"$mode\"" '"maintenance2"')"
  deny "modeState edit" "$(edit_in .claude/frontend-kit.json '"projectName"' '"modeState": {"previous":"new"}, "projectName"')"
  deny "guards edit" "$(edit_in .claude/frontend-kit.json '"projectName"' '"guards": {"integrity": false}, "projectName"')"
  deny "edit that breaks the JSON" "$(edit_in .claude/frontend-kit.json '["src"]' '["src"],,')"
  deny "rewrite" "$(write_in .claude/frontend-kit.json '{"mode":"new"}')"
  deny "rewrite, invalid" "$(write_in .claude/frontend-kit.json 'x')"
  deny "task state" "$(write_in .claude/state/task-mode.json '{"mode":"off"}')"
  deny_each <<'EOF'
echo x > .claude/state/task-mode.json
rm -rf .claude/state
mv .claude/state .claude/s2
rm .claude/state/task*
cd .claude/state && rm -f task-mode.json
cd .claude && sed -i '' s/a/b/ frontend-*.json
sed -i s/freeze/existing/ .claude/frontend-kit.json
cp /tmp/other.json .claude/frontend-kit.json
tee .claude/frontend-kit.json
git checkout HEAD -- .claude/frontend-kit.json
git restore .claude/frontend-kit.json
python3 -c "open('.claude/frontend-kit.json','w').write('{}')"
bash "$KIT"/scripts/mode-switch.sh . <<< off
bash "$KIT"/scripts/mode-sw?tch.sh . <<< off
/some/plugin/scripts/mode-switch.sh .
bash -c "rm -rf .claude/state"
EOF
  deny "relative to the shell's folder" "$(bash_in 'rm state/task-mode.json' "$T/.claude")"
  deny "Skill tool: off" '{"tool_name":"Skill","tool_input":{"skill":"frontend-kit:mode","args":"off"}}'
  deny "Skill tool: refactor off" '{"tool_name":"Skill","tool_input":{"skill":"frontend-kit:refactor-mode","args":"off"}}'
  allow "Skill tool: status" '{"tool_name":"Skill","tool_input":{"skill":"frontend-kit:mode","args":"status"}}'
  allow "Skill tool: another skill" '{"tool_name":"Skill","tool_input":{"skill":"frontend-kit:verify","args":"off"}}'
done
SECTION="switch by Claude"
fresh freeze
deny "bare word without quotes" "$(edit_in .claude/frontend-kit.json freeze existing)"
deny "MultiEdit" "$(jq -nc --arg f "$T/.claude/frontend-kit.json" '{tool_name:"MultiEdit",tool_input:{file_path:$f,edits:[{old_string:"X",new_string:"Y"},{old_string:"freeze",new_string:"existing"}]}}')"
deny "replace_all" "$(jq -nc --arg f "$T/.claude/frontend-kit.json" '{tool_name:"Edit",tool_input:{file_path:$f,old_string:"e",new_string:"E",replace_all:true}}')"
allow "harmless key" "$(edit_in .claude/frontend-kit.json '["src"]' '["src", "app"]')"
deny_sh "git stash push"
deny_sh "git checkout ."
allow_sh "git stash list"
fresh existing hotfix
deny_sh "git clean -X .claude"
allow_sh "git clean -nX"
allow_sh "git stash push"
fresh existing read-only
deny "Skill tool in read-only" '{"tool_name":"Skill","tool_input":{"skill":"frontend-kit:mode","args":"off"}}'

# --- a mode survives a config the reader dislikes -------------------------------------------------------------------
SECTION="odd config"
for raw in '{"mode":"freeze","srcDirs":"src"}' '{"mode":"freeze","protectedBranches":"main"}' '{"mode":"freeze","liveHosts":"a.example"}' \
  '{"mode":"freeze","projectName":"two\nlines"}' '{"mode":"Freeze"}' '{"mode":"freeze "}' '{ "mode" : "freeze", }' '{"mode":"freeze","modes":"x"}'; do
  fresh
  config "$raw"
  deny "npm install with $raw" "$(bash_in 'npm install x')"
  same "status with $raw" "$(status)" "mode: freeze"
done
fresh
config '{"mode":"freeze",}'
deny "broken: another mode" "$(write_in .claude/frontend-kit.json '{"mode":"existing"}')"
allow "broken: repaired, same mode" "$(write_in .claude/frontend-kit.json '{"mode":"freeze"}')"
has "broken: warned" "not valid JSON" "$(ctx)"
has "broken: still on" "FREEZE MODE IS ON" "$(ctx)"
fresh
config '{"mode":"frozen"}'
has "unknown mode is reported" "not a mode of this plugin version" "$(ctx)"
has "unknown mode can be turned off" "Back to: existing" "$(sw off)"
same "unknown mode is gone" "$(jq -r .mode "$T/.claude/frontend-kit.json")" existing
fresh existing
mkdir -p "$T/.claude/state"
echo garbage >"$T/.claude/state/task-mode.json"
deny "damaged task file keeps the strictest mode" "$(edit_in src/a.ts 1 2)"
: >"$T/.claude/state/task-mode.json"
deny "empty task file too" "$(edit_in src/a.ts 1 2)"

# --- test integrity -------------------------------------------------------------------------------------------------
for setting in "maintenance " "refactor " "upgrade " "freeze " "existing hotfix"; do
  SECTION="integrity: $setting"
  # shellcheck disable=SC2086
  fresh $setting
  deny ".skip" "$(edit_in src/a.test.ts 'it(' 'it.skip(')"
  deny ".only.each" "$(edit_in src/a.test.ts 'it("a"' 'it.only.each([1])("a"')"
  deny "describe.only" "$(edit_in src/a.test.ts 'it("a", () => {})' "describe.only(\"s\", () => {})${NL}it(\"a\", () => {})")"
  deny "xit" "$(edit_in src/a.test.ts 'it("a"' 'xit("a"')"
  deny "fit" "$(edit_in src/a.test.ts 'it("a"' 'fit("a"')"
  deny "test removed" "$(edit_in src/a.test.ts 'it("a", () => {})' '')"
  deny "snapshot edit" "$(write_in src/__snapshots__/a.test.ts.snap x)"
  allow "a title with fit" "$(edit_in src/a.test.ts 'it("a", () => {})' "it(\"a\", () => {})${NL}it(\"images fit the box\", () => {})")"
  allow "object-fit" "$(edit_in src/a.test.ts '() => {}' '() => { expect(el).toHaveStyle("object-fit: cover") }')"
  allow "a fit helper" "$(edit_in src/a.test.ts '() => {}' '() => { map.fit(bounds); fit(box) }')"
  allow "one test into a table" "$(edit_in src/a.test.ts 'it("a", () => {})' 'it.each([["a", f()]])("%s", () => {})')"
  allow "one test into a template table" "$(edit_in src/a.test.ts 'it("a", () => {})' "it.each\`a\`(\"a\", () => {})")"
  allow "prose about tests" "$(write_in tests/README.md 'never use it.skip( here')"
  deny_each <<'EOF'
rm src/a.test.ts
rm -rf tests
git rm src/a.test.ts
echo x > src/a.test.ts
npx vitest -u
vitest run --update=true
pnpm vitest -u
yarn jest -u
bunx vitest -u
npm test -- -u
npm run test:unit -- -u
playwright test --update-snapshots
bash -c "rm src/a.test.ts"
EOF
  allow_each <<'EOF'
git mv src/a.test.ts src/components/a.test.ts
npx vitest run src/a.test.ts
npx prettier -u src
git push -u origin work
rm -rf node_modules/.cache coverage test-results
echo done >> tests/run.log
npm test
EOF
  deny "Monitor runs the shell too" "$(jq -nc '{tool_name:"Monitor",tool_input:{command:"rm src/a.test.ts"}}')"
  allow "Monitor read" "$(jq -nc '{tool_name:"Monitor",tool_input:{command:"tail -f log"}}')"
  allow "plain edit" "$(edit_in src/a.ts 1 2)"
done
SECTION="deny names its mode"
fresh existing hotfix
run_guard "$(bash_in 'rm src/a.test.ts')"
has "hotfix over existing" "Blocked (hotfix mode)" "$GUARD_OUT"

# --- refactor and upgrade -------------------------------------------------------------------------------------------
for mode in refactor upgrade; do
  SECTION="$mode"
  fresh "$mode"
  deny "ts-ignore" "$(edit_in src/a.ts export "// @ts-ignore${NL}export")"
  deny "eslint-disable" "$(edit_in src/a.ts export '/* eslint-disable */ export')"
  deny "in a Vue file" "$(write_in src/A.vue '<script>// @ts-expect-error</script>')"
  allow "its own plan" "$(write_in "docs/$mode-plan.md" "- @ts-ignore: 12${NL}- eslint-disable: 3")"
  allow "dependency edit" "$(edit_in package.json 4.17.20 4.17.21)"
  allow_sh "npx npm-check-updates -u"
done
SECTION="upgrade"
fresh upgrade
deny_each <<'EOF'
npm install --legacy-peer-deps
npm install --force
npm --prefix app install react@19 -f
pnpm add react@19 --force
EOF
allow_each <<'EOF'
npm install react@19 react-dom@19
npm cache clean --force
git clean -nd
EOF
OUT="$(ctx)"
has "plan command" "/frontend-kit:upgrade-mode plan" "$OUT"
has "next command" "/frontend-kit:upgrade-mode next" "$OUT"
hasnt "no dead command" "mode upgrade plan" "$OUT"
has "suppressions are listed" "suppression" "$OUT"
has "removed cases are listed" "removed test cases" "$OUT"
fresh maintenance
allow "suppressions only in refactor and upgrade" "$(edit_in src/a.ts export '/* eslint-disable */ export')"

# --- maintenance ----------------------------------------------------------------------------------------------------
SECTION="maintenance"
fresh maintenance
allow_each <<'EOF'
npm install
npm ci
npm install lodash@4.17.21
pnpm add lodash@4.17.21
npm install --prefix app
npm audit fix
npm update lodash
EOF
deny_each <<'EOF'
pnpm add left-pad
npm i left-pad@1.0.0
npm in left-pad
pnpm --filter web add left-pad
yarn workspace web add left-pad
corepack pnpm add left-pad
bash -c "npm i left-pad"
EOF
allow "version bump, edit" "$(edit_in package.json 4.17.20 4.17.21)"
allow "version bump, write" "$(write_in package.json '{"dependencies":{"lodash":"4.17.21"}}')"
allow "script line" "$(edit_in package.json '"lint":"eslint ."' '"lint":"eslint .","lint:fix":"eslint --fix"')"
allow "engines" "$(edit_in package.json '"name":"x"' '"name":"x","engines":{"node":">=20"}')"
deny "new dependency, write" "$(write_in package.json '{"dependencies":{"lodash":"4","b":"2"}}')"
deny "new dependency, edit" "$(edit_in package.json '"lodash":"4.17.20"' '"lodash":"4.17.20","b":"1"')"

# --- freeze and hotfix ----------------------------------------------------------------------------------------------
for setting in "freeze " "existing hotfix"; do
  SECTION="locked config: $setting"
  # shellcheck disable=SC2086
  fresh $setting
  deny "package.json" "$(edit_in package.json 4.17.20 4.17.21)"
  deny "tsconfig" "$(edit_in tsconfig.json '{}' '{ }')"
  deny "svelte config" "$(write_in svelte.config.js x)"
  deny "angular config" "$(write_in angular.json x)"
  deny_each <<'EOF'
npm i left-pad
npm in left-pad
yarn upgrade
npm uninstall lodash
npm audit fix
npm pkg set dependencies.x=1
pnpm --filter web add x
npm --prefix app install x
yarn workspace web add x
corepack pnpm add x
env CI=1 npm install x
timeout -s KILL 60 npm install x
if true; then npm install x; fi
bash -c "pnpm add x"
echo "{}" > package.json
echo "{}" | tee package.json
sed -i '' s/1/2/ package.json
sed -i s/1/2/ package.json
cp /tmp/p.json package.json
mv /tmp/t.json tsconfig.json
EOF
  deny "heredoc into tsconfig" "$(bash_in "cat > tsconfig.json <<EOF${NL}{}${NL}EOF")"
  deny "heredoc to a shell" "$(bash_in "bash <<'EOF'${NL}npm install x${NL}EOF")"
  deny "here-string to a shell" "$(bash_in 'bash <<< "npm install x"')"
  deny "second line of bash -c" "$(bash_in "bash -c 'cd .${NL}npm install x'")"
  deny "from a sub-folder" "$(bash_in 'echo x > ../package.json' "$T/src")"
  allow_each <<'EOF'
npm ci
npm install
npm install --prefix app
pnpm install --filter web
npm run build
cp package.json /tmp/p.json
cat package.json
npx tsc --noEmit -p .
sed -n 1,5p package.json
echo ok > /tmp/out.txt
git checkout -b fix/x HEAD
EOF
  allow "heredoc that is only text" "$(bash_in "cat > notes.md <<'EOF'${NL}npm install x${NL}EOF")"
done
SECTION="hotfix budget"
budget_fixture() { # <folder> <changed files>
  local i=0
  mkdir -p "$T/$1"
  while [ "$i" -lt "$2" ]; do i=$((i + 1)); echo x >"$T/$1/f$i.ts"; done
}
fresh existing hotfix
budget_fixture src 4
allow "fifth file" "$(edit_in src/a.ts 1 2)"
budget_fixture src 5
deny "sixth file" "$(edit_in src/a.ts 1 2)"
allow "a file already changed" "$(edit_in src/f1.ts x y)"
allow "tests are not counted" "$(edit_in src/a.test.ts '() => {}' '() => { expect(1).toBe(1) }')"
allow "docs are not counted" "$(write_in docs/incident.md x)"
fresh existing hotfix
config '{"mode":"existing","srcDirs":["ClientApp/Src"]}'
budget_fixture ClientApp/Src 5
deny "upper-case source folder" "$(write_in ClientApp/Src/g.ts x)"
fresh existing hotfix
config '{"mode":"existing"}'
budget_fixture client/ui 5
deny "no configured source folder" "$(write_in client/ui/g.ts x)"
fresh existing
sw 'hotfix --files 1 --base HEAD' >/dev/null
echo 'export const b = 2' >"$T/src/b.ts"
deny "--files 1" "$(edit_in src/a.ts 1 2)"
fresh existing
sw 'hotfix --files 1 --base HEAD' >/dev/null
echo 'export const b = 2' >"$T/src/b.ts"
git_in "$T" commit -qam fix
sw "hotfix --base $(git_in "$T" rev-parse HEAD~1) --files 1" >/dev/null
deny "committed files count from --base" "$(edit_in src/a.ts 1 2)"

# --- read-only ------------------------------------------------------------------------------------------------------
SECTION="read-only"
fresh existing read-only
allow_each <<'EOF'
git log --oneline | head -3
git log --oneline 2>/dev/null
ls 2>&1 | grep a
cat src/a.ts
rg foo src
npm ls
cd src && ls
git diff --stat
git -C . status
find . -name x
sed -n '1,40p' src/a.ts
sed -n 5p src/a.ts
awk '{print $1}' src/a.ts
git branch --list "feat/*"
git branch --contains HEAD
git branch -a
git tag -l 'v*'
git remote -v
git remote get-url origin
git config --get user.name
git reflog
gh pr view 1
gh run list
command -v node
for f in src/a.ts src/b.ts; do cat "$f"; done
if test -f src/a.ts; then wc -l src/a.ts; fi
sort src/a.ts | uniq -c
date +%F
/usr/bin/grep a src/a.ts
EOF
deny_each <<'EOF'
echo x > y
sed -i s/a/b/ src/a.ts
sed -n 'w out' src/a.ts
sed -n '1e touch y' src/a.ts
awk 'BEGIN{system("touch y")}'
awk '{print > "y"}' src/a.ts
npm run build
git commit -m x
find . -delete
echo $(touch y)
curl x
x=1 ls
bash -c "touch y"
git push
tee y
npx tsc
git branch newbranch
git branch --list -D work
git tag v9
sort -o f f
sort -uo src/a.ts src/a.ts
sort --compress-program=sh big
tree -ao out
file -C -m m
uniq src/a.ts src/b.ts
xxd -r in.hex src/a.ts
./scripts/test
./node_modules/.bin/file
node_modules/.bin/cat x
git remote update
git remote set-branches origin x
git config user.name x --list
git config --global user.name x
git reflog expire --expire=now --all
git -c core.pager=sh log
git grep -Ovim a
git diff --output=y
gh pr merge 1
for f in a b; do touch "$f"; done
rm -rf .claude/state
EOF
deny "source edit" "$(edit_in src/a.ts 1 2)"
allow "report" "$(write_in docs/audits/r.md x)"
mkdir -p "$T/docs/audits"
ln -s "$T/src" "$T/docs/audits/link"
deny "a link out of the report folder" "$(write_in docs/audits/link/a.ts x)"
deny "Monitor" '{"tool_name":"Monitor","tool_input":{"command":"npm run dev"}}'
deny "new worktree" '{"tool_name":"EnterWorktree","tool_input":{}}'
for name in create_node query_execute patch_notifications_id_read update_status patch_users_id_status post_tasks_list createJiraIssue mark_as_read evaluate_script get_or_create_board do_something; do
  deny "MCP $name" "{\"tool_name\":\"mcp__server__$name\",\"tool_input\":{}}"
done
for name in get_design getJiraIssue searchCode get-library-docs query-docs resolve-library-id get_file_contents get_merge_request list_pages take_snapshot browser_console_messages taskflow_whoami; do
  allow "MCP $name" "{\"tool_name\":\"mcp__plugin_x_y__$name\",\"tool_input\":{}}"
done
fresh existing read-only
config '{"mode":"existing","modes":{"reportDir":"notes/review"}}'
allow "configured report folder" "$(write_in notes/review/r.md x)"
deny "the default folder is then closed" "$(write_in docs/audits/r.md x)"
fresh existing read-only
config '{"mode":"existing","modes":{"reportDir":"../.."}}'
deny "a report folder outside is ignored" "$(write_in src/a.ts x)"
fresh freeze
allow "worktree outside read-only" '{"tool_name":"EnterWorktree","tool_input":{}}'
allow "MCP outside read-only" '{"tool_name":"mcp__x__create_thing","tool_input":{}}'
allow "TodoWrite" '{"tool_name":"TodoWrite","tool_input":{}}'

# --- prototype ------------------------------------------------------------------------------------------------------
SECTION="prototype"
fresh existing prototype
allow "edit in prototypes/" "$(write_in prototypes/x/a.tsx x)"
deny "edit in src" "$(edit_in src/a.ts 1 2)"
deny_each <<'EOF'
git commit -m x
git -C . commit -m x
git push origin work
npm install x
pnpm add x
echo x > src/z.ts
echo x | tee src/z.ts
sed -i s/1/2/ src/a.ts
cp prototypes/x/a src/z.ts
mv src/a.ts prototypes/a.ts
rm src/b.ts
cd src && echo x > z.ts
EOF
allow_each <<'EOF'
npm install
npx create-vite prototypes/x
cp src/a.ts prototypes/a.ts
echo x > prototypes/x.txt
cd prototypes && echo x > x.txt
sed -i '' s/1/2/ prototypes/a.ts
sed -i -e s/1/2/ prototypes/a.ts
echo x > /tmp/outside.txt
echo x > "$TMPDIR/out.txt"
git status
EOF
OUT="$(ctx)"
has "commit is listed" "git commit" "$OUT"
has "replaces the test rule" "replaces hard rule 6" "$OUT"
fresh existing prototype
config '{"mode":"existing","modes":{"prototypeDir":"spikes"}}'
allow "configured folder" "$(write_in spikes/a.ts x)"

# --- no crash, no timeout -------------------------------------------------------------------------------------------
SECTION="short commands"
for setting in "refactor " "upgrade " "maintenance " "freeze " "existing hotfix" "existing read-only" "existing prototype"; do
  # shellcheck disable=SC2086
  fresh $setting
  for cmd in ls git npm env rm vitest 'git remote' bash eval '(ls)' '> out' ';' '# c' 'git tag' npx sort yarn cd cp sed 'for x in a' 'command' 'corepack' 'git -C' 'python3 -c' 'find' 'x=1' 'bash -c' '{ ls; }' '$(ls)'; do
    run_guard "$(bash_in "$cmd")"
    case "$GUARD_OUT" in *"hook failed"* | *"unbound"* | *"line "[0-9]*": "*) ko "crash on [$cmd] in $setting" "$GUARD_OUT" ;; *) if [ "$GUARD_CODE" -eq 0 ]; then ok; else ko "exit on [$cmd] in $setting" "$GUARD_OUT"; fi ;; esac
  done
done
SECTION="long input stays inside the timeout"
timed() { # <name> <allow|any> <input>: an answer within 8 of the 10 seconds
  local started=$SECONDS
  run_guard "$3"
  if [ $((SECONDS - started)) -gt 8 ] || [ "$GUARD_CODE" -ne 0 ]; then ko "$1" "$((SECONDS - started)) s, exit $GUARD_CODE"; return; fi
  if [ "$2" = allow ] && [ -n "$GUARD_OUT" ]; then ko "$1" "$GUARD_OUT"; else ok; fi
}
fresh freeze
LONG="git add"; i=0
while [ "$i" -lt 1900 ]; do i=$((i + 1)); LONG="$LONG src/components/file$i.tsx"; done
timed "1900 paths" allow "$(bash_in "$LONG")"
fresh refactor
LONG=""; i=0
while [ "$i" -lt 800 ]; do i=$((i + 1)); LONG="${LONG}echo line $i${NL}"; done
timed "800 commands" any "$(bash_in "$LONG")"
fresh existing hotfix
budget_fixture src 3000
timed "3000 changed files" allow "$(edit_in src/f1.ts x y)"
timed "3000 changed files, a new one" any "$(edit_in src/a.ts 1 2)"

# --- the switch -----------------------------------------------------------------------------------------------------
SECTION="switch"
fresh existing
chmod 644 "$T/.claude/frontend-kit.json"
OUT="$(sw 'freeze --days 3 --note release')"
has "turns freeze on" "Mode ON: freeze" "$OUT"
same "keeps the file's permissions" "$(file_mode "$T/.claude/frontend-kit.json")" 644
same "stored" "$(jq -r '.mode + " " + .modeState.previous' "$T/.claude/frontend-kit.json")" "freeze existing"
same "other keys survive" "$(jq -r .projectName "$T/.claude/frontend-kit.json")" X
OUT="$(ctx)"
has "session start carries the mode" "FREEZE MODE IS ON" "$OUT"
has "session start says since" "On since" "$OUT"
has "as of now" "Mode as of now: freeze" "$OUT"
has "hard rules stay" "Never commit, push or merge on" "$OUT"
has "guard rail, not a sandbox" "not a sandbox" "$OUT"
OUT="$(sw 'hotfix --base HEAD --files 2 --note incident')"
has "task mode on top" "Mode ON: hotfix" "$OUT"
has "status shows both" "freeze + hotfix" "$(sw status)"
sw 'hotfix --files 9' >/dev/null
same "raising the budget keeps base and note" "$(jq -r '"\(.base) \(.note) \(.files)"' "$T/.claude/state/task-mode.json")" "HEAD incident 9"
has "bad base" "not a known commit" "$(sw 'hotfix --base nope')"
has "bad date" "needs a date" "$(sw 'freeze --until tomorrow')"
has "impossible date" "needs a date" "$(sw 'freeze --until 2026-13-45')"
has "impossible day" "needs a date" "$(sw 'freeze --until 2026-02-30')"
has "zero files" "needs a number" "$(sw 'hotfix --files 0')"
has "unknown word" "not a mode" "$(sw nonsense)"
has "more than one line" "one line" "$(sw "freeze${NL}off")"
has "off takes the narrowest first" "Still on: freeze" "$(sw off)"
has "off returns to what was replaced" "Back to: existing" "$(sw off)"
same "modeState removed" "$(jq -r '.modeState // "none"' "$T/.claude/frontend-kit.json")" none
same "everything is off" "$(status)" "mode: existing"
allow "the guard is quiet again" "$(bash_in 'npm install x')"
for mode in maintenance refactor upgrade freeze hotfix read-only prototype; do
  fresh existing
  sw "$mode" >/dev/null
  has "$mode turns on" "$mode" "$(status)"
  sw off >/dev/null
  same "$mode can always be left" "$(status)" "mode: existing"
done
fresh new
sw hotfix >/dev/null
sw 'off all' >/dev/null
same "off all keeps new" "$(status)" "mode: new"
fresh maintenance
sw upgrade >/dev/null
sw off >/dev/null
same "back to maintenance" "$(status)" "mode: maintenance"
fresh
config '{bad'
hasnt "off all on broken JSON does not claim success" "All modes off" "$(sw 'off all')"
has "broken JSON: the way out" "editor" "$(sw 'off all')"
fresh freeze
mv "$T/.claude/frontend-kit.json" "$T/real.json"
ln -s "$T/real.json" "$T/.claude/frontend-kit.json"
sw off >/dev/null
if [ -L "$T/.claude/frontend-kit.json" ]; then ok; else ko "a linked config stays a link"; fi
same "the link's file is switched" "$(jq -r .mode "$T/real.json")" existing
fresh existing
: >"$T/.gitignore"
sw hotfix >/dev/null
if git_in "$T" check-ignore -q .claude/state/task-mode.json; then ok; else ko "task state is never committed"; fi
OUT="$(echo off | PATH="$NOJQ" /bin/bash "$HOOKS/mode-switch.sh" "$T" 2>&1)"
has "switch without jq speaks" "jq" "$OUT"
same "task mode can be left without jq" "$(status)" "mode: existing"
SECTION="switch: skill form"
fresh existing
has "on" "Mode ON: upgrade" "$(sw on upgrade)"
has "off" "Back to: existing" "$(sw off upgrade)"
has "on with options" "Mode ON: refactor" "$(sw 'on --days 3' refactor)"
has "options are kept" "Planned end" "$(ctx)"
has "off with words" "Back to: existing" "$(sw 'off now please' refactor)"
has "on with a word" "Mode ON: refactor" "$(sw 'on now' refactor)"
has "plan reports on" "refactor mode is on" "$(sw 'audit src/*' refactor)"
has "plan reports off" "NOT on" "$(sw plan upgrade)"
fresh refactor
has "old config without modeState" "Back to: existing" "$(sw off)"

# --- context and honesty --------------------------------------------------------------------------------------------
SECTION="context"
fresh freeze
has "helper agents get the rules" "FREEZE MODE IS ON" "$(subagent)"
has "reminder" "Mode freeze is ON" "$(prompt 'fix the header')"
same "no reminder on mode" "$(prompt '/frontend-kit:mode off')" ""
same "no reminder on upgrade-mode" "$(prompt '/frontend-kit:upgrade-mode off')" ""
same "no reminder on refactor-mode" "$(prompt '/frontend-kit:refactor-mode off')" ""
has "advisory exception" "security advisory" "$(ctx)"
has "flags frozen" "feature-flag" "$(ctx)"
SECTION="honest about enforcement"
hasnt "wired copy" "NOT enforced" "$(sw status)"
UNWIRED="$WORK/unwired"
mkdir -p "$UNWIRED/scripts" "$UNWIRED/hooks"
cp "$HOOKS"/mode-* "$HOOKS/lib.sh" "$UNWIRED/scripts/"
jq '.hooks.PreToolUse |= map(select((.hooks | map(.command // "") | any(test("mode-guard"))) | not))' "$HOOKS/../hooks/hooks.json" >"$UNWIRED/hooks/hooks.json"
has "unwired copy says so" "NOT enforced" "$(printf status | "$UNWIRED/scripts/mode-switch.sh" "$T")"
SECTION="commands named in texts exist"
for text in "$HOOKS"/mode-lib.sh "$HOOKS"/../skills/mode/SKILL.md "$HOOKS"/../skills/upgrade-mode/SKILL.md "$HOOKS"/../skills/refactor-mode/SKILL.md; do
  if grep -Eq '/frontend-kit:mode (upgrade|refactor) (plan|next|audit)|/frontend-kit:mode (plan|next|audit)' "$text"; then ko "dead command in ${text##*/}"; else ok; fi
done
for skill in mode upgrade-mode refactor-mode; do
  if grep -q "<<'KIT_MODE_ARGS_7F3A'" "$HOOKS/../skills/$skill/SKILL.md"; then ko "$skill: a public heredoc delimiter"; else ok; fi
done

# --- second pass: ways round the exact checks -----------------------------------------------------------------------
SECTION="judged like the Edit tool"
fresh freeze
deny "old text that only matches loosely" "$(edit_in .claude/frontend-kit.json '“freeze”' '"existing"')"
deny "same value written as an escape" "$(edit_in .claude/frontend-kit.json '"freeze"' '"\u0066reeze"')"
deny "the key written as an escape" "$(edit_in .claude/frontend-kit.json '"mode"' '"\u006dode"')"
fresh maintenance
deny "a dependency by a loose match" "$(edit_in package.json '“lodash”' '"left-pad":"1","lodash"')"
deny "package.json left broken" "$(edit_in package.json '"4.17.20"' '"4.17.20",,"left-pad":"1"')"
printf '{\r\n  "name": "x",\r\n  "dependencies": {"lodash": "1"}\r\n}\r\n' >"$T/package.json"
allow "CRLF file" "$(edit_in package.json "\"name\": \"x\",${NL}  \"dependencies\"" "\"name\": \"y\",${NL}  \"dependencies\"")"
SECTION="second pass: integrity"
fresh refactor
deny_sh "rm tests/*"
deny_sh "rm -rf tests/unit"
allow_sh "rm tests/run.log"
SECTION="second pass: read-only"
fresh existing read-only
allow_sh "wc -l < src/a.ts"
allow_sh "grep a < src/a.ts 2>/dev/null"
allow "backquotes around a read" "$(bash_in 'echo `cat src/a.ts`')"
deny "a write beside an input of the same name" "$(bash_in 'cat <src/b.ts >  src/b.ts')"
deny "backquotes around a write" "$(bash_in 'echo `touch y`')"
deny_sh "sed -n '/[/p;/]/p' src/a.ts"
deny "MCP find_replace" '{"tool_name":"mcp__x__find_replace","tool_input":{}}'
deny "MCP search_and_delete" '{"tool_name":"mcp__x__search_and_delete","tool_input":{}}'
fresh freeze
allow_sh "jq .name < package.json"
allow_sh "jq .name < package.json > /tmp/name.txt"
SECTION="redirects"
fresh existing read-only
deny_sh "cat <> src/a.ts"
allow_sh "grep '>' < src/a.ts"
allow_sh "diff src/a.ts - < src/b.ts"
fresh freeze
deny_sh "cat <> package.json"
allow_sh "wc -l < tsconfig.json > /tmp/count"
SECTION="a project path in Arabic"
fresh freeze
ARABIC="$WORK/مشروع ($N)"
mv "$T" "$ARABIC"
T="$ARABIC"
export CLAUDE_PROJECT_DIR="$T"
deny "package.json" "$(edit_in package.json 4.17.20 4.17.21)"
deny_sh "echo x > package.json"
allow "source" "$(edit_in src/a.ts 1 2)"
SECTION="status as JSON"
fresh existing
same "without a task mode" "$("$HOOKS/mode-status.sh" "$T" --json | jq -r '.project + ":" + (.task // "none")')" "existing:none"
SECTION="huge input stays inside the timeout"
fresh freeze
timed "100 KB heredoc" any "$(bash_in "cat > /tmp/notes <<'EOF'${NL}$(jq -rn '[range(0;1900) | "line of text with some words in it, forty-eight bytes"] | join("\n")')${NL}EOF")"
timed "90 KB word" any "$(bash_in "echo '$(jq -rn '"x" * 90000')'")"
timed "90 KB first word" any "$(bash_in "$(jq -rn '"x/" * 45000')")"
timed "rm of 1900 paths" any "$(bash_in "rm $(jq -rn '[range(0;1900) | "src/components/file\(.).tsx"] | join(" ")')")"
timed "150 redirects" any "$(bash_in "$(jq -rn '[range(0;150) | "echo \(.) > /tmp/out\(.).txt"] | join("\n")')")"

# --- the other tools that run a command line ------------------------------------------------------------------------
SECTION="other shells"
fresh freeze
deny "PowerShell" '{"tool_name":"PowerShell","tool_input":{"command":"npm install x"}}'
deny "desktop terminal" '{"tool_name":"mcp__terminal__run_in_terminal","tool_input":{"command":"npm install x"}}'
deny "desktop terminal in a sub-folder" "$(jq -nc --arg d "$T/src" '{tool_name:"mcp__terminal__run_in_terminal",tool_input:{command:"echo x > ../package.json",cwd:$d}}')"
allow "desktop terminal, dev server" '{"tool_name":"mcp__terminal__run_in_terminal","tool_input":{"command":"npm run dev"}}'
fresh existing read-only
allow "desktop terminal, a read" '{"tool_name":"mcp__terminal__run_in_terminal","tool_input":{"command":"git status"}}'
SECTION="the skills' own switch command"
for skill in mode upgrade-mode refactor-mode; do
  fresh existing
  # the block between ```! and ```, rendered as Claude Code does, with an argument that tries to close it
  BLOCK="$(awk '/^```!/{on=1;next} /^```/{on=0} on' "$HOOKS/../skills/$skill/SKILL.md")"
  BLOCK="${BLOCK//'${CLAUDE_PLUGIN_ROOT}'/$(dirname "$HOOKS")}"
  BLOCK="${BLOCK//'${CLAUDE_PROJECT_DIR}'/$T}"
  BLOCK="${BLOCK//'${CLAUDE_SESSION_ID}'/test-session}"
  has "$skill: status" "Mode: existing" "$(bash -c "${BLOCK//'$ARGUMENTS'/status}")"
  OUT="$(bash -c "${BLOCK//'$ARGUMENTS'/status${NL}KIT_MODE_ARGS_7F3A${NL}echo ran-outside}" 2>&1)"
  if printf '%s\n' "$OUT" | grep -qx ran-outside; then ko "$skill: an argument closes the heredoc"; else ok; fi
done

SECTION="a busy machine"
SLOW="$WORK/slow"
mkdir -p "$SLOW"
printf '#!/bin/bash\nsleep 1\nexec "%s" "$@"\n' "$(command -v jq)" >"$SLOW/jq"
chmod +x "$SLOW/jq"
fresh existing hotfix
SIMPLE="$(bash_in 'npm test')"
OUT="$(printf '%s' "$SIMPLE" | PATH="$SLOW:$PATH" "$HOOKS/mode-guard.sh" 2>&1)"
same "a short command is not refused for a slow start" "$OUT" ""

echo "mode tests: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] || { printf '%s\n' "$NAMES"; exit 1; }
