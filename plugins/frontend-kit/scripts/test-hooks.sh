#!/bin/bash
# Tests every hook by piping realistic hook input on stdin and asserting the decision, exit code and
# output. Runs against throwaway git repos in a temp folder; the real working tree is never touched.
# The fixtures borrow node_modules (tsc, vitest, oxlint, oxfmt) from a real project of the kit's stack:
#
#   KIT_TEST_PROJECT=/path/to/project bash "${CLAUDE_PLUGIN_ROOT}"/scripts/test-hooks.sh
#   (default: the git root of the current folder)
set -u

HOOKS="$(cd "$(dirname "$0")" && pwd)"
PLUGIN="$(cd "$HOOKS/.." && pwd)"
REPO="${KIT_TEST_PROJECT:-$(git rev-parse --show-toplevel 2>/dev/null)}"
if [ -z "$REPO" ] || [ ! -d "$REPO/node_modules/.bin" ]; then
  echo "test-hooks: set KIT_TEST_PROJECT to a project with node_modules installed (tsc, vitest, oxlint, oxfmt)." >&2
  exit 1
fi
# pwd -P: a TMPDIR ending in "/" would give paths with "//" that never match the hooks' normalised paths.
WORK="$(cd "$(mktemp -d "${TMPDIR:-/tmp}/kit-hook-tests.XXXXXX")" && pwd -P)"
trap 'rm -rf "$WORK"' EXIT

PASS=0
FAIL=0
FAILED_NAMES=""

ok() { PASS=$((PASS + 1)); }
ko() {
  FAIL=$((FAIL + 1))
  FAILED_NAMES="$FAILED_NAMES
  ✗ $1${2:+ — $2}"
}

# run_hook <script> <json> → sets OUT, ERR, CODE
run_hook() {
  OUT="$(printf '%s' "$2" | "$HOOKS/$1" 2>"$WORK/stderr")"
  CODE=$?
  ERR="$(cat "$WORK/stderr")"
}

decision() {
  if [ -z "$OUT" ]; then echo allow; return; fi
  printf '%s' "$OUT" | jq -r '.hookSpecificOutput.permissionDecision // "allow"' 2>/dev/null || echo invalid-json
}

# --- Fixtures ----------------------------------------------------------------------------------

# A git repo on the given branch with one commit and an origin/main ref.
make_repo() {
  local dir="$1" branch="$2"
  mkdir -p "$dir/src"
  git -C "$dir" init -q -b main
  git -C "$dir" config user.email test@example.com
  git -C "$dir" config user.name test
  printf 'export const a: number = 1\n' >"$dir/src/a.ts"
  printf '{ "compilerOptions": { "strict": true, "noEmit": true, "skipLibCheck": true, "types": [] }, "include": ["src"] }\n' >"$dir/tsconfig.json"
  git -C "$dir" add -A
  git -C "$dir" commit -q -m init
  git -C "$dir" update-ref refs/remotes/origin/main HEAD
  [ "$branch" != main ] && git -C "$dir" checkout -q -b "$branch"
  ln -s "$REPO/node_modules" "$dir/node_modules"
  mkdir -p "$dir/scripts" "$dir/.claude"
  # The i18n validator: the project's own, else the one the kit ships (templates/shared/scripts).
  if [ -f "$REPO/scripts/validate-i18n.ts" ]; then
    cp "$REPO/scripts/validate-i18n.ts" "$dir/scripts/validate-i18n.ts"
  else
    cp "$PLUGIN/templates/shared/scripts/validate-i18n.ts" "$dir/scripts/validate-i18n.ts"
  fi
  for config in oxlint.config.ts oxfmt.config.ts .oxlintrc.json .oxfmtrc.json; do
    [ -f "$REPO/$config" ] && cp "$REPO/$config" "$dir/"
  done
  # The project config the hooks read (written by /frontend-kit:setup in a real project).
  cat >"$dir/.claude/frontend-kit.json" <<'KITJSON'
{
  "projectName": "Shop",
  "profile": "website",
  "liveHosts": ["store.example.com", "api.example.com"],
  "uatHost": "staging.example.com",
  "githubRepo": "acme/shop",
  "defaultBranch": "main",
  "protectedBranches": ["main", "master"],
  "devPort": "5173",
  "protectedPaths": [".github/**", "deploy/**", "server/**"],
  "generatedPaths": ["src/shared/types/api.ts", "src/routeTree.gen.ts"],
  "stopGate": { "review": false }
}
KITJSON
  printf '{\n  "name": "fixture",\n  "scripts": {\n    "build": "vite build",\n    "lint": "oxlint --fix"\n  }\n}\n' >"$dir/package.json"
}

# The real project lives under "Projects (from Trash)": the fixtures get spaces and parentheses too.
FEATURE="$WORK/Projects (x)/feature"
MAIN="$WORK/Projects (x)/main"
make_repo "$FEATURE" "fix/123-thing"
make_repo "$MAIN" main

# --- guard-bash.sh -----------------------------------------------------------------------------

bash_input() { jq -n --arg c "$1" --arg d "$2" '{hook_event_name: "PreToolUse", tool_name: "Bash", tool_input: {command: $c}, cwd: $d}'; }

expect_bash() { # <allow|deny> <cwd> <command>
  run_hook guard-bash.sh "$(bash_input "$3" "$2")"
  local got
  got="$(decision)"
  if [ "$CODE" -eq 0 ] && [ "$got" = "$1" ]; then ok; else ko "guard-bash $1: $3" "got $got (exit $CODE)"; fi
}

export CLAUDE_PROJECT_DIR="$FEATURE"
for cmd in \
  'git push -u origin fix/123-thing' \
  'git push' \
  'git push origin HEAD' \
  'git -C . push -u origin fix/123-thing' \
  'git push origin fix/main-menu' \
  'git commit -m "fix(cart): never git push --force to main or use --no-verify"' \
  "git commit -m 'feat: x' -m 'body: gh pr create is not allowed'" \
  'git merge origin/main' \
  'git merge-base HEAD origin/main' \
  'git fetch origin main -q && git rev-list --left-right --count origin/main...HEAD' \
  'git status --short && git diff --stat' \
  'git restore --staged src/a.ts' \
  'git restore src/a.ts' \
  'git checkout -b fix/9-x origin/main' \
  'git clean -n' \
  'git branch -d fix/old' \
  'gh pr view 12' \
  'gh pr list --search "merge conflicts"' \
  'rm -rf dist' \
  'rm -rf node_modules/.vite' \
  "rm -rf \"$FEATURE/coverage\"" \
  'rm -rf "$CLAUDE_PROJECT_DIR/test-results"' \
  "rm -rf $WORK/scratch-dir" \
  'rm -r /tmp/kit-x' \
  'rm src/a.ts' \
  'grep -rn "store.example.com" src' \
  'grep -rn store.example.com src public' \
  'curl -s https://staging.example.com/api/health' \
  'curl -s http://localhost:5173/' \
  'E2E_BASE_URL=http://localhost:3100 npx playwright test' \
  'npx vite --port 5173 --strictPort' \
  'git log --oneline -3 | cat' \
  'git push -u origin "$(git branch --show-current)"' \
  'git add src/a.ts && git commit -m "fix(cart): keep the promo after sign-in"' \
  'npm run test -- src/shared/layout/main/index.test.tsx' \
  'lsof -nP -iTCP:5173 -sTCP:LISTEN -t | xargs kill' \
  'rm -rf node_modules/.vite && npx vite --port 5173 --strictPort' \
  'git push -u origin fix/123-thing >/dev/null 2>&1' \
  'git push -u origin fix/123-thing&>/dev/null' \
  'command git push -u origin fix/123-thing' \
  '/usr/bin/git push origin fix/123-thing' \
  '\git status' \
  'git -c color.ui=never push -u origin fix/123-thing' \
  'cat .env.example' \
  'git diff -- .env.example' \
  "cat \"\$CLAUDE_PROJECT_DIR/.env.example\"" \
  'grep -rn VITE_API_BASE_URL src' \
  'grep -rn process.env src' \
  'grep -n envError src/a.ts' \
  'echo "$VITE_API_BASE_URL"' \
  'npm run build 2>&1 | tail -5' \
  'git commit -m "docs: never cat .env from the shell"' \
  "git commit -F - <<'EOF'
fix(nav): profile pill follows Figma

Never push to main from here; git push origin main is the user's call.
EOF"; do
  expect_bash allow "$FEATURE" "$cmd"
done

for cmd in \
  'gh pr create --fill' \
  'gh pr create' \
  'gh -R acme/shop pr merge 12 --squash' \
  'gh pr new --base main' \
  'gh api repos/acme/shop/pulls -X POST -f title=x' \
  'git push origin main' \
  'git push -u origin main' \
  'git push origin master' \
  'git push origin "main"' \
  'git push origin HEAD:main' \
  'git push origin fix/123-thing:master' \
  'git push origin HEAD:refs/heads/main' \
  'git -C . push origin main' \
  "git -C \"$FEATURE\" push origin master" \
  'git -c color.ui=never push origin main' \
  'git push origin --delete main' \
  'git push origin :master' \
  'git push --all origin' \
  'git push --force' \
  'git push -f origin fix/123-thing' \
  'git push -uf origin fix/123-thing' \
  'git push --force-with-lease origin fix/123-thing' \
  'git push origin +fix/123-thing' \
  'git push --no-verify' \
  'git commit --no-verify -m "x"' \
  'git commit -nm "x"' \
  'HUSKY=0 git commit -m "x"' \
  'git -c core.hooksPath=/dev/null commit -m "x"' \
  'git checkout main && git merge fix/123-thing' \
  'git switch master; git merge origin/main' \
  'git reset --hard' \
  'git reset --hard origin/main' \
  'git clean -fd' \
  'git clean -xdf' \
  'git checkout .' \
  'git checkout -- .' \
  'git restore .' \
  'git branch -D main' \
  "bash -c 'git push origin master'" \
  "sh -c \"gh pr create --fill\"" \
  'cd src && git push origin main' \
  'timeout 30 git push origin main' \
  'env GIT_TRACE=1 git push origin main' \
  'rm -rf ~/Downloads' \
  'rm -rf /' \
  'rm -fr $HOME/x' \
  'curl https://store.example.com/' \
  'curl -s "https://api.example.com/api/v1/Catalog"' \
  'wget https://store.example.com/sitemap.xml' \
  'E2E_BASE_URL=https://store.example.com npx playwright test' \
  'VITE_API_PROXY_TARGET=https://api.example.com npm run dev' \
  'npx playwright open https://store.example.com' \
  'open https://store.example.com/cards' \
  'git push origin main>/dev/null' \
  'git push origin main >/dev/null 2>&1' \
  'git push origin main 2>/dev/null' \
  'git push origin main&>/dev/null' \
  'git push origin master>>push.log' \
  'git push origin main</dev/null' \
  '\git push origin main' \
  'command git push origin main' \
  '/usr/bin/git push origin main' \
  '\command \git push origin master' \
  'git -c alias.p=push p origin main' \
  "git -c alias.p='!git push origin main' p" \
  'git -calias.p=push p origin main' \
  'git -c core.hookspath=/dev/null commit -m x' \
  'cat .env' \
  'cat .env.local' \
  'source .env.local' \
  '. .env.local' \
  'less .env' \
  'head -5 .env.production' \
  'grep VITE .env' \
  'cp .env /tmp/x' \
  'cat "$CLAUDE_PROJECT_DIR/.env"' \
  'cat $CLAUDE_PROJECT_DIR/.env.local' \
  "cat \"$FEATURE/.env\"" \
  'cat < .env' \
  'cat<.env' \
  'cat .env*' \
  'node --env-file=.env scripts/x.ts' \
  'npx dotenv -e .env.development -- vite' \
  "bash -c 'cat .env'"; do
  expect_bash deny "$FEATURE" "$cmd"
done

# On main itself, a bare push, a commit and a merge are refused too.
export CLAUDE_PROJECT_DIR="$MAIN"
expect_bash deny "$MAIN" 'git push'
expect_bash deny "$MAIN" 'git push -u origin HEAD'
expect_bash deny "$MAIN" 'git commit -m "fix: x"'
expect_bash deny "$MAIN" 'git merge origin/fix/1'
expect_bash allow "$MAIN" 'git checkout -b fix/9-x origin/main'
expect_bash allow "$MAIN" 'git status'

# The real repo, with its path full of spaces and parentheses.
export CLAUDE_PROJECT_DIR="$REPO"
# rm checks run against the real repo path: the fixtures live in the temp folder, where rm is allowed.
for cmd in 'rm -rf ..' 'rm -rf .' 'rm -rf src' 'rm -rf .git' 'rm -rf .git/hooks' 'rm -rf *' 'rm -r -f ../other-project' \
  'cd .. && rm -rf shop' 'rm -rf ./docs'; do
  expect_bash deny "$REPO" "$cmd"
done
for cmd in 'rm -rf dist' 'rm -rf node_modules/.vite coverage playwright-report' 'rm -rf src/features/website/home/old-banner' 'rm -rf .claude/state'; do
  expect_bash allow "$REPO" "$cmd"
done
expect_bash allow "$REPO" "rm -rf \"$REPO/coverage\""
expect_bash allow "$REPO" "rm -rf '$REPO/node_modules/.vite'"
expect_bash deny "$REPO" "rm -rf \"$REPO\""
expect_bash deny "$REPO" "rm -rf \"$REPO/src\""
expect_bash allow "$REPO" "git -C \"$REPO\" status --short"
expect_bash allow "$REPO" ""

# --- guard-paths.sh ----------------------------------------------------------------------------

export CLAUDE_PROJECT_DIR="$FEATURE"
PROJECT_REPO="$REPO"
REPO="$FEATURE"
expect_path() { # <allow|deny> <tool> <file> [extra tool_input json]
  local input extra="${4:-}"
  [ -z "$extra" ] && extra='{}'
  input="$(jq -n --arg t "$2" --arg f "$3" --argjson x "$extra" \
    '{hook_event_name: "PreToolUse", tool_name: $t, tool_input: ({file_path: $f} + $x)}')"
  run_hook guard-paths.sh "$input"
  local got
  got="$(decision)"
  if [ "$CODE" -eq 0 ] && [ "$got" = "$1" ]; then ok; else ko "guard-paths $1: $2 $3" "got $got (exit $CODE)"; fi
}

expect_path deny Read "$REPO/.env"
expect_path deny Read "$REPO/.env.local"
expect_path deny Read "$REPO/.env.production"
expect_path allow Read "$REPO/.env.example"
expect_path allow Read "$REPO/.github/workflows/main.yml"
expect_path allow Read "$REPO/src/shared/types/api.ts"
expect_path deny Edit "$REPO/.env"
expect_path deny Write "$REPO/.env.development"
expect_path allow Edit "$REPO/.env.example"
expect_path deny Edit "$REPO/.github/workflows/main.yml"
expect_path deny Write "$REPO/deploy/nginx.conf"
expect_path deny Edit "$REPO/server/index.ts"
expect_path deny Edit "$REPO/.git/info/exclude"
expect_path deny Edit "$REPO/src/shared/types/api.ts"
expect_path deny Write "$REPO/package-lock.json"
expect_path deny Write "$REPO/src/features/website/home/helpers.js"
expect_path deny Write "$REPO/src/features/website/home/banner.jsx"
expect_path allow Write "$REPO/src/features/website/home/banner.tsx"
expect_path allow Edit "$REPO/src/shared/types/cart.ts"
expect_path allow Write "$REPO/scripts/generate-sitemap.js"
expect_path allow Edit "$REPO/CLAUDE.md"
expect_path allow Write "/private/tmp/scratch/notes.js"
expect_path allow NotebookEdit "$REPO/docs/x.ipynb"
expect_path allow Edit "$REPO/package.json" '{"old_string": "\"lint\": \"oxlint --fix\",", "new_string": "\"lint\": \"oxlint --fix --quiet\","}'
expect_path deny Edit "$REPO/package.json" '{"old_string": "\"build\": \"vite build\",", "new_string": "\"build\": \"tsc && vite build\","}'
expect_path deny MultiEdit "$REPO/package.json" '{"edits": [{"old_string": "a", "new_string": "b"}, {"old_string": "    \"build\": \"vite build\",\n", "new_string": ""}]}'
PKG="$(cat "$REPO/package.json")"
# Paths are normalised before the checks: .. can't walk around them.
expect_path deny Edit "$REPO/src/../.github/workflows/main.yml"
expect_path deny Write "$REPO/src/features/../../deploy/nginx.conf"
expect_path deny Edit "$REPO/./.git/config"
expect_path deny Read "$REPO/src/../.env"
expect_path deny Edit "$REPO/src/shared/../shared/types/api.ts"
expect_path allow Edit "$REPO/src/../docs/notes.md"
expect_path allow Read "$REPO/src/../.env.example"
expect_path allow Write "$REPO/package.json" "$(jq -n --arg c "$(printf '%s' "$PKG" | jq '.description = "x"')" '{content: $c}')"
expect_path deny Write "$REPO/package.json" "$(jq -n --arg c "$(printf '%s' "$PKG" | jq '.scripts.build = "vite build --mode uat"')" '{content: $c}')"

REPO="$PROJECT_REPO"

# --- hooks.json and the settings templates ---------------------------------------------------

jq -e . "$PLUGIN/hooks/hooks.json" >/dev/null && ok || ko "hooks.json is valid JSON"
# /clear starts a new session: the Stop gate needs its baseline then too.
[ "$(jq -r '.hooks.SessionStart[0].matcher' "$PLUGIN/hooks/hooks.json")" = "startup|resume|clear|compact" ] && ok || ko "SessionStart matches startup|resume|clear|compact"
for SETTINGS in "$PLUGIN"/templates/*/settings.json; do
[ -f "$SETTINGS" ] || continue
jq -e . "$SETTINGS" >/dev/null && ok || ko "$SETTINGS is valid JSON"
# Read/Edit deny rules are gitignore patterns; none of them may match .env.example, and .env must be denied.
ENV_RULES="$(jq -r '.permissions.deny[] | select(test("^(Read|Edit)\\(\\./\\.env"))' "$SETTINGS")"
EXAMPLE_HIT=""
ENV_HIT=""
while IFS= read -r rule; do
  pattern="${rule#*(./}"
  pattern="${pattern%)}"
  # shellcheck disable=SC2254 # the pattern is the glob under test
  case .env.example in $pattern) EXAMPLE_HIT="$EXAMPLE_HIT $rule" ;; esac
  case .env in $pattern) ENV_HIT=1 ;; esac
done <<<"$ENV_RULES"
[ -z "$EXAMPLE_HIT" ] && ok || ko "no deny rule matches .env.example" "$EXAMPLE_HIT"
[ -n "$ENV_HIT" ] && ok || ko "a deny rule matches .env"
for name in .env.local .env.development.local .env.production .env.staging .env.test; do
  hit=""
  while IFS= read -r rule; do
    pattern="${rule#*(./}"; pattern="${pattern%)}"
    # shellcheck disable=SC2254
    case "$name" in $pattern) hit=1 ;; esac
  done <<<"$ENV_RULES"
  [ -n "$hit" ] && ok || ko "a deny rule matches $name"
done
jq -e '[.permissions.deny[] | select(contains("(!"))] | length == 0' "$SETTINGS" >/dev/null && ok || ko "no '!' rules in deny"
done

# --- guard-url.sh ------------------------------------------------------------------------------

expect_url() { # <allow|deny> <tool> <url>
  run_hook guard-url.sh "$(jq -n --arg t "$2" --arg u "$3" '{hook_event_name: "PreToolUse", tool_name: $t, tool_input: {url: $u}}')"
  local got
  got="$(decision)"
  if [ "$CODE" -eq 0 ] && [ "$got" = "$1" ]; then ok; else ko "guard-url $1: $3" "got $got"; fi
}
expect_url deny mcp__chrome-devtools__navigate_page "https://store.example.com/cards"
expect_url deny mcp__claude-in-chrome__navigate "HTTPS://Store.Example.com"
expect_url deny WebFetch "https://api.example.com/api/v1/Catalog?x=1"
expect_url allow mcp__chrome-devtools__navigate_page "http://localhost:5173/cards"
expect_url allow mcp__claude-in-chrome__navigate "https://staging.example.com/"
expect_url allow WebFetch "https://code.claude.com/docs/en/hooks"
expect_url allow WebFetch "https://cdn.example.com/x.png"

# --- prompt-hints.sh ---------------------------------------------------------------------------

expect_hint() { # <expected substring or "-" for none> <prompt>
  run_hook prompt-hints.sh "$(jq -n --arg p "$2" '{hook_event_name: "UserPromptSubmit", prompt: $p}')"
  local context
  context="$(printf '%s' "$OUT" | jq -r '.hookSpecificOutput.additionalContext // ""' 2>/dev/null)"
  if [ "$CODE" -ne 0 ]; then ko "prompt-hints: $2" "exit $CODE"; return; fi
  if [ "$1" = "-" ]; then
    if [ -z "$OUT" ]; then ok; else ko "prompt-hints none: $2" "$context"; fi
  elif printf '%s' "$context" | grep -qF "$1"; then ok; else ko "prompt-hints '$1': $2" "${context:-no output}"; fi
}
export CLAUDE_PROJECT_DIR="$REPO"
for p in "commit" "Commit" "commmit" "commit push" "commit and push" "yes commit push" "ok push commit" "commit push all think" "COMMIT ALL" "push"; do
  expect_hint "commit-push skill" "$p"
done
for p in "contine" "continue" "CONTINE." "go on"; do expect_hint "resume the last unfinished step" "$p"; done
for p in "link pr" "pr link" "gave me link off pr" "link"; do expect_hint "compare link" "$p"; done
expect_hint "task skill" "https://trello.com/c/AbC123/449-profile-pill this is the task"
expect_hint "figma-match" "follow figma https://www.figma.com/design/abc/Shop?node-id=1-2"
expect_hint "answer and explain" "why u edit the cart?"
# Long text (agent reports, pasted docs) mentions "link pr" / "all pages" in passing: no hint.
expect_hint "-" "<agent-message from=\"x\">The reviewer says: link pr after you check all pages.</agent-message>"
expect_hint "-" "$(printf 'details %.0s' $(seq 1 40)) then print the link pr and fix all pages"
expect_hint "answer and explain" "ليش صار هيج"
expect_hint "every occurrence" "cheak all if u forget any think design"
expect_hint "every occurrence" "fix it in all pages"
expect_hint "-" "fix the commit message validation in the form"
expect_hint "-" "add a push notification toggle to settings"
expect_hint "-" "make the cart faster"
expect_hint "-" "what does the checkout hook do"

# --- post-edit.sh ------------------------------------------------------------------------------

export CLAUDE_PROJECT_DIR="$FEATURE"
edit_input() { jq -n --arg f "$1" '{hook_event_name: "PostToolUse", tool_name: "Edit", tool_input: {file_path: $f}}'; }

printf 'export const   spaced =    1;\n' >"$FEATURE/src/format-me.ts"
run_hook post-edit.sh "$(edit_input "$FEATURE/src/format-me.ts")"
if [ "$CODE" -eq 0 ] && grep -q 'export const spaced = 1' "$FEATURE/src/format-me.ts"; then ok; else ko "post-edit formats a clean file" "exit $CODE: $(cat "$FEATURE/src/format-me.ts")"; fi

printf 'export function f(): void {\n  debugger\n}\n' >"$FEATURE/src/lint-me.ts"
run_hook post-edit.sh "$(edit_input "$FEATURE/src/lint-me.ts")"
if [ "$CODE" -eq 2 ] && printf '%s' "$ERR" | grep -q 'src/lint-me.ts:2'; then ok; else ko "post-edit returns oxlint errors with exit 2" "exit $CODE: $ERR"; fi

mkdir -p "$FEATURE/src/features/demo/locales"
printf '{ "demo": { "title": "عنوان" } }\n' >"$FEATURE/src/features/demo/locales/ar.json"
printf '{ "demo": { "title": "Title" } }\n' >"$FEATURE/src/features/demo/locales/en.json"
run_hook post-edit.sh "$(edit_input "$FEATURE/src/features/demo/locales/ar.json")"
if [ "$CODE" -eq 0 ]; then ok; else ko "post-edit accepts matching ar/en locales" "exit $CODE: $ERR"; fi
printf '{ "demo": { "title": "عنوان", "subtitle": "فرعي" } }\n' >"$FEATURE/src/features/demo/locales/ar.json"
run_hook post-edit.sh "$(edit_input "$FEATURE/src/features/demo/locales/ar.json")"
if [ "$CODE" -eq 0 ] && printf '%s' "$OUT" | grep -q 'ar and en differ right now'; then ok; else ko "post-edit only warns while ar and en differ midway" "exit $CODE: $ERR $OUT"; fi
printf '{ "demo": { "title": "", "subtitle": "فرعي" } }\n' >"$FEATURE/src/features/demo/locales/ar.json"
printf '{ "demo": { "title": "Title", "subtitle": "Sub" } }\n' >"$FEATURE/src/features/demo/locales/en.json"
run_hook post-edit.sh "$(edit_input "$FEATURE/src/features/demo/locales/ar.json")"
if [ "$CODE" -eq 2 ] && printf '%s' "$ERR" | grep -q 'validate-i18n.ts fails'; then ok; else ko "post-edit blocks a real locale defect (empty value)" "exit $CODE: $ERR"; fi
rm -rf "$FEATURE/src/features"

run_hook post-edit.sh "$(edit_input "$FEATURE/README.md")"
if [ "$CODE" -eq 0 ] && [ -z "$OUT$ERR" ]; then ok; else ko "post-edit ignores files outside src" "exit $CODE"; fi
run_hook post-edit.sh "$(edit_input "/private/tmp/elsewhere.ts")"
if [ "$CODE" -eq 0 ]; then ok; else ko "post-edit ignores files outside the project" "exit $CODE"; fi
rm -f "$FEATURE/src/format-me.ts" "$FEATURE/src/lint-me.ts"

# --- session-context.sh ------------------------------------------------------------------------

export CLAUDE_PROJECT_DIR="$MAIN"
run_hook session-context.sh '{"hook_event_name": "SessionStart", "source": "startup", "session_id": "s-main"}'
if [ "$CODE" -eq 0 ] && printf '%s' "$OUT" | grep -q 'branch: main' && printf '%s' "$OUT" | grep -q 'WARNING: you are on the protected branch main' &&
  printf '%s' "$OUT" | grep -q '^6\. ' && [ -f "$MAIN/.claude/state/sessions/s-main.json" ]; then ok; else ko "session-context on main" "exit $CODE: $OUT"; fi

export CLAUDE_PROJECT_DIR="$FEATURE"
run_hook session-context.sh '{"hook_event_name": "SessionStart", "source": "compact", "session_id": "s-feature"}'
if [ "$CODE" -eq 0 ] && printf '%s' "$OUT" | grep -q 'branch: fix/123-thing' && ! printf '%s' "$OUT" | grep -q WARNING &&
  printf '%s' "$OUT" | grep -q '0 ahead, 0 behind' && printf '%s' "$OUT" | grep -q ':5173'; then ok; else ko "session-context on a task branch" "exit $CODE: $OUT"; fi

# --- stop-gate.sh ------------------------------------------------------------------------------
# The settle wait (skip while background agents are mid-edit) is tested on its own below.
export HOOK_SETTLE_SECONDS=0

stop_input() { jq -n --arg s "$1" --argjson a "$2" '{hook_event_name: "Stop", session_id: $s, stop_hook_active: $a}'; }
export CLAUDE_PROJECT_DIR="$FEATURE"
GATE="$FEATURE/.claude/state/last-gate.json"

run_hook stop-gate.sh "$(stop_input s-feature false)"
if [ "$CODE" -eq 0 ] && [ ! -f "$GATE" ]; then ok; else ko "stop-gate skips when src/ is unchanged" "exit $CODE"; fi

printf 'export const b: number = "not a number"\n' >"$FEATURE/src/b.ts"
run_hook stop-gate.sh "$(stop_input s-feature false)"
if [ "$CODE" -eq 2 ] && printf '%s' "$ERR" | grep -q 'TS2322' && [ "$(jq -r .result "$GATE")" = fail ]; then ok; else ko "stop-gate blocks on a type error" "exit $CODE: $ERR"; fi

run_hook stop-gate.sh "$(stop_input s-feature false)"
if [ "$CODE" -eq 0 ]; then ok; else ko "stop-gate does not re-run on an unchanged state" "exit $CODE"; fi

printf 'export const b: number = 2\n' >"$FEATURE/src/b.ts"
run_hook stop-gate.sh "$(stop_input s-feature true)"
if [ "$CODE" -eq 0 ] && [ "$(jq -r .result "$GATE")" = pass ] && [ "$(jq -r .source "$GATE")" = stop-hook ]; then ok; else ko "stop-gate re-checks a fix and records pass" "exit $CODE: $ERR"; fi

jq '.blocks = 3' "$FEATURE/.claude/state/sessions/s-feature.json" >"$WORK/s.json" && mv "$WORK/s.json" "$FEATURE/.claude/state/sessions/s-feature.json"
printf 'export const b: number = "again"\n' >"$FEATURE/src/b.ts"
run_hook stop-gate.sh "$(stop_input s-feature true)"
if [ "$CODE" -eq 0 ]; then ok; else ko "stop-gate gives up after 3 blocks in a row" "exit $CODE"; fi

# Changes that predate the session (its baseline) are not this session's to gate.
export CLAUDE_PROJECT_DIR="$FEATURE"
run_hook session-context.sh '{"hook_event_name": "SessionStart", "source": "startup", "session_id": "s-late"}'
run_hook stop-gate.sh "$(stop_input s-late false)"
if [ "$CODE" -eq 0 ]; then ok; else ko "stop-gate skips changes made before the session" "exit $CODE"; fi

# Background agents mid-edit: a fresh src/ change that the main session didn't make waits for the
# next stop; the same change made by the main session (recorded by post-edit.sh) is gated at once.
export CLAUDE_PROJECT_DIR="$FEATURE"
run_hook session-context.sh '{"hook_event_name": "SessionStart", "source": "startup", "session_id": "s-agents"}'
printf 'export const settle: number = "not a number"\n' >"$FEATURE/src/settle.ts"
HOOK_SETTLE_SECONDS=30 run_hook stop-gate.sh "$(stop_input s-agents false)"
if [ "$CODE" -eq 0 ]; then ok; else ko "stop-gate waits while a background agent is mid-edit" "exit $CODE: $ERR"; fi
run_hook post-edit.sh "$(jq -n --arg f "$FEATURE/src/settle.ts" '{hook_event_name: "PostToolUse", tool_name: "Write", session_id: "s-agents", agent_id: "agent-1", tool_input: {file_path: $f}}')"
HOOK_SETTLE_SECONDS=30 run_hook stop-gate.sh "$(stop_input s-agents false)"
if [ "$CODE" -eq 0 ]; then ok; else ko "an agent's own edit doesn't count as the main session's" "exit $CODE: $ERR"; fi
run_hook post-edit.sh "$(jq -n --arg f "$FEATURE/src/settle.ts" '{hook_event_name: "PostToolUse", tool_name: "Write", session_id: "s-agents", tool_input: {file_path: $f}}')"
HOOK_SETTLE_SECONDS=30 run_hook stop-gate.sh "$(stop_input s-agents false)"
if [ "$CODE" -eq 2 ] && printf '%s' "$ERR" | grep -q 'TS2322'; then ok; else ko "stop-gate still gates the main session's own fresh edit" "exit $CODE: $ERR"; fi
rm -f "$FEATURE/src/settle.ts"

# --- record-gate.sh ----------------------------------------------------------------------------

"$HOOKS/record-gate.sh" pass verify "typecheck, lint, tests, build" && [ "$(jq -r '.source + ":" + .result' "$GATE")" = "verify:pass" ] && ok || ko "record-gate writes last-gate.json"
"$HOOKS/record-gate.sh" maybe verify x 2>/dev/null
[ $? -eq 64 ] && ok || ko "record-gate rejects an unknown result"

# A missing tool (no npm install yet) is skipped, not reported as a type failure.
BARE="$WORK/Projects (x)/no-tools"
make_repo "$BARE" "fix/7-bare"
rm "$BARE/node_modules"
printf 'export const c: number = "not a number"\n' >"$BARE/src/c.ts"
export CLAUDE_PROJECT_DIR="$BARE"
run_hook stop-gate.sh "$(stop_input s-bare false)"
if [ "$CODE" -eq 0 ] && [ -z "$ERR" ] && [ ! -f "$BARE/.claude/state/last-gate.json" ]; then ok; else ko "stop-gate skips tsc/vitest that aren't installed" "exit $CODE: $ERR"; fi

# --- Fail closed -------------------------------------------------------------------------------
# Claude Code blocks a call only on exit 2 or a JSON deny; exit 1 or a crash lets it through.

# run_hook_with_path <PATH> <script> <json> → sets OUT, ERR, CODE
run_hook_with_path() {
  OUT="$(printf '%s' "$3" | PATH="$1" "$HOOKS/$2" 2>"$WORK/stderr")"
  CODE=$?
  ERR="$(cat "$WORK/stderr")"
}

# A PATH with every system tool except jq.
NO_JQ="$WORK/no-jq-bin"
mkdir -p "$NO_JQ"
for dir in /usr/bin /bin /usr/sbin /sbin /opt/homebrew/bin /usr/local/bin; do
  [ -d "$dir" ] || continue
  for tool in "$dir"/*; do
    name="${tool##*/}"
    [ "$name" = jq ] && continue
    [ -e "$NO_JQ/$name" ] || ln -s "$tool" "$NO_JQ/$name"
  done
done
# A fresh shell: this one has jq hashed already.
if PATH="$NO_JQ" /bin/bash -c 'command -v jq' >/dev/null 2>&1; then
  ko "the no-jq PATH still finds jq" "$(PATH="$NO_JQ" /bin/bash -c 'command -v jq')"
else
  export CLAUDE_PROJECT_DIR="$FEATURE"
  run_hook_with_path "$NO_JQ" guard-bash.sh "$(bash_input 'git status' "$FEATURE")"
  if [ "$CODE" -eq 2 ] && printf '%s' "$ERR" | grep -q 'need jq'; then ok; else ko "guard-bash without jq blocks (exit 2)" "exit $CODE: $ERR"; fi
  run_hook_with_path "$NO_JQ" guard-bash.sh "$(bash_input 'git push origin main' "$FEATURE")"
  if [ "$CODE" -eq 2 ]; then ok; else ko "guard-bash without jq blocks a push to main" "exit $CODE"; fi
  run_hook_with_path "$NO_JQ" guard-paths.sh '{"tool_name": "Read", "tool_input": {"file_path": "/x/.env"}}'
  if [ "$CODE" -eq 2 ] && printf '%s' "$ERR" | grep -q 'need jq'; then ok; else ko "guard-paths without jq blocks (exit 2)" "exit $CODE: $ERR"; fi
  run_hook_with_path "$NO_JQ" guard-url.sh '{"tool_name": "WebFetch", "tool_input": {"url": "https://store.example.com"}}'
  if [ "$CODE" -eq 2 ]; then ok; else ko "guard-url without jq blocks (exit 2)" "exit $CODE"; fi
  # Everything else degrades quietly.
  run_hook_with_path "$NO_JQ" post-edit.sh "$(edit_input "$FEATURE/src/a.ts")"
  if [ "$CODE" -eq 0 ] && [ -z "$OUT$ERR" ]; then ok; else ko "post-edit without jq exits 0" "exit $CODE: $ERR"; fi
  run_hook_with_path "$NO_JQ" prompt-hints.sh '{"prompt": "commit"}'
  if [ "$CODE" -eq 0 ] && [ -z "$OUT$ERR" ]; then ok; else ko "prompt-hints without jq exits 0" "exit $CODE: $ERR"; fi
  run_hook_with_path "$NO_JQ" session-context.sh '{"source": "startup", "session_id": "s-nojq"}'
  if [ "$CODE" -eq 0 ] && [ -z "$ERR" ]; then ok; else ko "session-context without jq exits 0" "exit $CODE: $ERR"; fi
  printf 'export const d: number = "x"\n' >"$FEATURE/src/d.ts"
  run_hook_with_path "$NO_JQ" stop-gate.sh "$(stop_input s-nojq false)"
  if [ "$CODE" -eq 0 ] && [ -z "$ERR" ]; then ok; else ko "stop-gate without jq exits 0" "exit $CODE: $ERR"; fi
  rm -f "$FEATURE/src/d.ts"
  OUT="$(PATH="$NO_JQ" "$HOOKS/record-gate.sh" pass verify x 2>&1)"
  CODE=$?
  if [ "$CODE" -eq 0 ]; then ok; else ko "record-gate without jq exits 0" "exit $CODE: $OUT"; fi
fi

# A jq that can read input but can't build the deny JSON: hook_deny falls back to exit 2 + stderr.
BROKEN_JQ="$WORK/broken-jq-bin"
mkdir -p "$BROKEN_JQ"
printf '#!/bin/bash\n[ "$1" = -n ] && exit 127\nexec %q "$@"\n' "$(command -v jq)" >"$BROKEN_JQ/jq"
chmod +x "$BROKEN_JQ/jq"
export CLAUDE_PROJECT_DIR="$REPO"
run_hook_with_path "$BROKEN_JQ:$PATH" guard-paths.sh "$(jq -n --arg f "$REPO/.env" '{tool_name: "Read", tool_input: {file_path: $f}}')"
if [ "$CODE" -eq 2 ] && [ -z "$OUT" ] && printf '%s' "$ERR" | grep -q 'holds secrets'; then ok; else ko "hook_deny falls back to exit 2 when jq can't build JSON" "exit $CODE: $OUT $ERR"; fi
export CLAUDE_PROJECT_DIR="$FEATURE"
run_hook_with_path "$BROKEN_JQ:$PATH" guard-bash.sh "$(bash_input 'git push origin main' "$FEATURE")"
if [ "$CODE" -eq 2 ] && printf '%s' "$ERR" | grep -q 'never push to a protected branch'; then ok; else ko "guard-bash deny falls back to exit 2" "exit $CODE: $ERR"; fi

# A guard that crashes (here: an unbound variable under set -u) blocks instead of exiting 1.
CODE=0
CLAUDE_PROJECT_DIR="$FEATURE" bash -c 'set -u; HOOK_KIND=guard; . "$1/lib.sh"; echo "$NOT_SET"' guard-crash "$HOOKS" >/dev/null 2>"$WORK/stderr" || CODE=$?
if [ "$CODE" -eq 2 ] && grep -q 'hook failed' "$WORK/stderr"; then ok; else ko "a crashing guard exits 2" "exit $CODE: $(cat "$WORK/stderr")"; fi
CODE=0
CLAUDE_PROJECT_DIR="$FEATURE" bash -c 'set -u; . "$1/lib.sh"; exit 1' other-hook "$HOOKS" 2>/dev/null || CODE=$?
[ "$CODE" -eq 1 ] && ok || ko "non-guard hooks keep their own exit codes" "exit $CODE"

# --- Notification, PostToolUseFailure, SessionEnd ---------------------------------------------

export CLAUDE_PROJECT_DIR="$FEATURE"
HOOK_NOTIFY=0 run_hook notify.sh '{"hook_event_name":"Notification","message":"Claude needs your permission to use Bash"}'
[ "$CODE" -eq 0 ] && [ -z "$OUT" ] && ok || ko "notify exits quietly" "exit $CODE: $OUT"
run_hook notify.sh 'not json'
[ "$CODE" -eq 0 ] && ok || ko "notify survives bad input" "exit $CODE"

rm -f "$FEATURE/.claude/state/tool-failures.log"
run_hook tool-failure.sh '{"hook_event_name":"PostToolUseFailure","tool_name":"Bash","tool_input":{"command":"npm run build"},"error":"exit 1\nboom"}'
if [ "$CODE" -eq 0 ] && grep -q $'\tBash\tnpm run build\texit 1 boom' "$FEATURE/.claude/state/tool-failures.log"; then ok; else ko "tool-failure logs tool, command and error on one line" "exit $CODE: $(cat "$FEATURE/.claude/state/tool-failures.log" 2>/dev/null)"; fi
run_hook tool-failure.sh '{"hook_event_name":"PostToolUseFailure","tool_name":"Edit","tool_input":{"file_path":"src/a.ts"},"error":"old_string not found"}'
grep -q $'\tEdit\tsrc/a.ts\told_string not found' "$FEATURE/.claude/state/tool-failures.log" && ok || ko "tool-failure logs the edited path"

mkdir -p "$FEATURE/.claude/state/sessions"
printf 'src/a.ts\n' >"$FEATURE/.claude/state/sessions/s-end.main-edits"
printf 'src/b.ts\n' >"$FEATURE/.claude/state/sessions/s-other.main-edits"
run_hook session-end.sh '{"hook_event_name":"SessionEnd","session_id":"s-end","reason":"logout"}'
if [ "$CODE" -eq 0 ] && [ ! -f "$FEATURE/.claude/state/sessions/s-end.main-edits" ] && [ -f "$FEATURE/.claude/state/sessions/s-other.main-edits" ]; then ok; else ko "session-end removes only its own session's edit list" "exit $CODE"; fi

# --- SubagentStop gate --------------------------------------------------------------------------

export CLAUDE_PROJECT_DIR="$FEATURE"
run_hook subagent-gate.sh '{"hook_event_name":"SubagentStop","agent_type":"frontend-reviewer","stop_hook_active":false}'
[ "$CODE" -eq 0 ] && [ -z "$OUT" ] && ok || ko "subagent-gate leaves read-only agents alone" "exit $CODE: $OUT"
run_hook subagent-gate.sh '{"hook_event_name":"SubagentStop","agent_type":"frontend-dev","stop_hook_active":true}'
[ "$CODE" -eq 0 ] && [ -z "$OUT" ] && ok || ko "subagent-gate lets an agent stop after one retry" "exit $CODE: $OUT"
printf '{ "name": "fixture", "scripts": { "typecheck": "tsc -p tsconfig.json" } }\n' >"$FEATURE/package.json"
printf 'export const b: number = "text"\n' >"$FEATURE/src/b.ts"
run_hook subagent-gate.sh '{"hook_event_name":"SubagentStop","agent_type":"frontend-dev","stop_hook_active":false}'
if [ "$CODE" -eq 0 ] && [ "$(printf '%s' "$OUT" | jq -r '.decision')" = block ] && printf '%s' "$OUT" | jq -r '.reason' | grep -q 'b.ts'; then ok; else ko "subagent-gate sends frontend-dev back with the type errors" "exit $CODE: $OUT"; fi
run_hook subagent-gate.sh '{"hook_event_name":"SubagentStop","agent_type":"frontend-kit:frontend-dev","stop_hook_active":false}'
if [ "$CODE" -eq 0 ] && [ "$(printf '%s' "$OUT" | jq -r '.decision')" = block ]; then ok; else ko "subagent-gate also gates the plugin-qualified agent name" "exit $CODE: $OUT"; fi
rm -f "$FEATURE/src/b.ts"
run_hook subagent-gate.sh '{"hook_event_name":"SubagentStop","agent_type":"test-engineer","stop_hook_active":false}'
[ "$CODE" -eq 0 ] && [ -z "$OUT" ] && ok || ko "subagent-gate passes clean work" "exit $CODE: $OUT"
rm -f "$FEATURE/package.json"

# --- skill-suggest.sh ----------------------------------------------------------------------------

SUGGEST="$WORK/suggest"
mkdir -p "$SUGGEST/.claude/skills/invoice-export"
printf -- '---\nname: invoice-export\ndescription: Export invoices to a spreadsheet with totals per customer\n---\n' >"$SUGGEST/.claude/skills/invoice-export/SKILL.md"
expect_skill() { # <expected skill or "-" for none> <prompt>
  run_hook skill-suggest.sh "$(jq -n --arg p "$2" '{hook_event_name: "UserPromptSubmit", prompt: $p}')"
  local context
  context="$(printf '%s' "$OUT" | jq -r '.hookSpecificOutput.additionalContext // ""' 2>/dev/null)"
  if [ "$CODE" -ne 0 ]; then ko "skill-suggest: $2" "exit $CODE"; return; fi
  if [ "$1" = "-" ]; then
    if [ -z "$OUT" ]; then ok; else ko "skill-suggest none: $2" "$context"; fi
  elif printf '%s' "$context" | grep -qF "$1"; then ok; else ko "skill-suggest '$1': $2" "${context:-no output}"; fi
}
export CLAUDE_PROJECT_DIR="$SUGGEST"
expect_skill "dash-create-table" "add a new table for the orders list"
expect_skill "dash-create-settings-form" "اضافة صفحة اعدادات"
expect_skill "i18n-conventions" "add the arabic text for this label"
expect_skill "invoice-export" "export all invoices with totals per customer to a spreadsheet"
expect_skill "-" "hello there my friend"
expect_skill "-" "/dev restart"
expect_skill "-" "<task-notification>the table build finished</task-notification>"
# At most three suggestions, kit skills first.
run_hook skill-suggest.sh "$(jq -n --arg p "add a table with a filter bar and a form, then commit and refactor it" '{prompt: $p}')"
[ "$(printf '%s' "$OUT" | jq -r '.hookSpecificOutput.additionalContext' | grep -c '^- ')" -le 3 ] && ok || ko "skill-suggest caps the list at 3"
# A dashboard project never gets website skills (and the other way round).
printf '{"profile":"dashboard"}\n' >"$SUGGEST/.claude/frontend-kit.json"
expect_skill "-" "add a server function for the cart"
printf '{"profile":"website"}\n' >"$SUGGEST/.claude/frontend-kit.json"
expect_skill "web-server-fn" "add a server function for the cart"
expect_skill "-" "add a new table for the orders list"
printf '{"hooks":{"skillSuggest":false}}\n' >"$SUGGEST/.claude/frontend-kit.json"
expect_skill "-" "add a new table for the orders list"
# Plan mode points at the personal /spec skill (only when that file exists).
rm -f "$SUGGEST/.claude/frontend-kit.json"
SPEC_HOME="$WORK/spec-home"
mkdir -p "$SPEC_HOME/.claude/skills/spec" "$WORK/no-spec-home"
printf -- '---\nname: spec\n---\n' >"$SPEC_HOME/.claude/skills/spec/SKILL.md"
plan_input() { jq -n --arg p "$1" --arg m "$2" '{hook_event_name: "UserPromptSubmit", prompt: $p, permission_mode: $m}'; }
OLD_HOME="$HOME"
export HOME="$WORK/no-spec-home"
run_hook skill-suggest.sh "$(plan_input "plan the new orders page" plan)"
[ -z "$OUT" ] && ok || ko "skill-suggest: plan mode without the spec file adds nothing extra" "$OUT"
export HOME="$SPEC_HOME"
run_hook skill-suggest.sh "$(plan_input "plan the new orders page" plan)"
printf '%s' "$OUT" | jq -r '.hookSpecificOutput.additionalContext' | grep -q 'Plan mode is on. Read .*/skills/spec/SKILL.md' && ok || ko "skill-suggest: plan mode points at the spec skill" "$OUT"
run_hook skill-suggest.sh "$(plan_input "plan the new orders page" default)"
[ -z "$OUT" ] && ok || ko "skill-suggest: no spec note outside plan mode" "$OUT"
export HOME="$OLD_HOME"
# Every skill named in the trigger file exists.
while IFS="$(printf '\t')" read -r skill _; do
  case "$skill" in '' | '#'*) continue ;; esac
  [ -f "$PLUGIN/skills/$skill/SKILL.md" ] && ok || ko "skill-triggers.tsv names a missing skill: $skill"
done <"$HOOKS/skill-triggers.tsv"

# --- commit-gate.sh ------------------------------------------------------------------------------

CG="$WORK/commit-gate"
make_repo "$CG" feature/x
export CLAUDE_PROJECT_DIR="$CG"
git_commit_input() { jq -n --arg c "$1" '{hook_event_name: "PreToolUse", tool_name: "Bash", tool_input: {command: $c}}'; }
printf 'export const c: number = 3\n' >"$CG/src/c.ts"
run_hook commit-gate.sh "$(git_commit_input 'git commit -m "feat: c"')"
if [ "$CODE" -eq 0 ] && printf '%s' "$OUT" | jq -r '.hookSpecificOutput.additionalContext' | grep -q 'no quality gate has run'; then ok; else ko "commit-gate warns when no gate ran" "exit $CODE: $OUT"; fi
run_hook commit-gate.sh "$(git_commit_input 'git status')"
[ "$CODE" -eq 0 ] && [ -z "$OUT" ] && ok || ko "commit-gate ignores other commands" "exit $CODE: $OUT"
"$HOOKS/record-gate.sh" fail verify "typecheck failed"
run_hook commit-gate.sh "$(git_commit_input 'git add -A && git commit -m x')"
printf '%s' "$OUT" | jq -r '.hookSpecificOutput.additionalContext' | grep -q 'last quality gate failed' && ok || ko "commit-gate warns after a failed gate" "$OUT"
"$HOOKS/record-gate.sh" pass verify "all green"
run_hook commit-gate.sh "$(git_commit_input 'git commit -m x')"
[ "$CODE" -eq 0 ] && [ -z "$OUT" ] && ok || ko "commit-gate is quiet after a passing gate on the same changes" "exit $CODE: $OUT"
printf 'export const c: number = 4\n' >"$CG/src/c.ts"
run_hook commit-gate.sh "$(git_commit_input 'git commit -m x')"
printf '%s' "$OUT" | jq -r '.hookSpecificOutput.additionalContext' | grep -q 'changed since the last passing' && ok || ko "commit-gate warns when src/ changed after the gate" "$OUT"

# --- stop-gate.sh: stopGate.tests = all ---------------------------------------------------------------

SG="$WORK/stop-all"
make_repo "$SG" feature/y
export CLAUDE_PROJECT_DIR="$SG"
printf 'export const d: number = 4\n' >"$SG/src/d.ts"
printf '{"stopGate":{"tests":"all","review":false},"commands":{"allTests":"echo boom-from-suite; exit 1"}}\n' >"$SG/.claude/frontend-kit.json"
run_hook stop-gate.sh "$(stop_input s-all false)"
if [ "$CODE" -eq 2 ] && printf '%s' "$ERR" | grep -q 'boom-from-suite'; then ok; else ko "stop-gate runs the whole suite when stopGate.tests is all" "exit $CODE: $ERR"; fi
printf '{"stopGate":{"tests":"all","review":false},"commands":{"allTests":"true"}}\n' >"$SG/.claude/frontend-kit.json"
printf 'export const d: number = 5\n' >"$SG/src/d.ts"
run_hook stop-gate.sh "$(stop_input s-all true)"
if [ "$CODE" -eq 0 ] && jq -r .summary "$SG/.claude/state/last-gate.json" | grep -q 'all tests'; then ok; else ko "stop-gate passes when the whole suite passes" "exit $CODE: $ERR"; fi

# --- stop-gate.sh: the code review request -----------------------------------------------------------

RG="$WORK/review-gate"
make_repo "$RG" feature/z
jq 'del(.stopGate)' "$RG/.claude/frontend-kit.json" >"$WORK/rg.json" && mv "$WORK/rg.json" "$RG/.claude/frontend-kit.json"
export CLAUDE_PROJECT_DIR="$RG"
printf 'export const e: number = 5\n' >"$RG/src/e.ts"
run_hook stop-gate.sh "$(stop_input s-rev false)"
if [ "$CODE" -eq 2 ] && printf '%s' "$ERR" | grep -q 'frontend-reviewer'; then ok; else ko "stop-gate asks for a code review once the gate passes" "exit $CODE: $ERR"; fi
run_hook stop-gate.sh "$(stop_input s-rev true)"
if [ "$CODE" -eq 0 ]; then ok; else ko "stop-gate does not ask twice for the same state" "exit $CODE: $ERR"; fi
printf 'export const e: number = 6\n' >"$RG/src/e.ts"
run_hook stop-gate.sh "$(stop_input s-rev true)"
if [ "$CODE" -eq 0 ]; then ok; else ko "stop-gate asks for one review per stop chain (fixes after the review are not reviewed again)" "exit $CODE: $ERR"; fi
printf 'export const e: number = 7\n' >"$RG/src/e.ts"
run_hook stop-gate.sh "$(stop_input s-rev false)"
if [ "$CODE" -eq 2 ] && printf '%s' "$ERR" | grep -q 'frontend-reviewer'; then ok; else ko "stop-gate asks again on the next prompt's changes" "exit $CODE: $ERR"; fi
printf '{"stopGate":{"review":false}}\n' >"$RG/.claude/frontend-kit.json"
printf 'export const e: number = 8\n' >"$RG/src/e.ts"
run_hook stop-gate.sh "$(stop_input s-rev false)"
if [ "$CODE" -eq 0 ]; then ok; else ko "stop-gate review is off with stopGate.review=false" "exit $CODE: $ERR"; fi

# --- Any project layout: srcDirs and commands from the config ------------------------------------------

AD="$WORK/Projects (y)/adaptive"
make_repo "$AD" feature/w
mkdir -p "$AD/app"
printf 'export const f = 1\n' >"$AD/app/f.ts"
git -C "$AD" add -A && git -C "$AD" commit -q -m app
printf '{"srcDirs":["app"],"stopGate":{"review":false},"commands":{"typecheck":"echo custom-typecheck-failed >&2; exit 1","lintFile":"echo custom-lint-failed; exit 1"}}\n' >"$AD/.claude/frontend-kit.json"
export CLAUDE_PROJECT_DIR="$AD"
printf 'export const f = 2\n' >"$AD/app/f.ts"
run_hook stop-gate.sh "$(stop_input s-adaptive false)"
if [ "$CODE" -eq 2 ] && printf '%s' "$ERR" | grep -q 'custom-typecheck-failed'; then ok; else ko "stop-gate watches srcDirs and runs commands.typecheck" "exit $CODE: $ERR"; fi
run_hook post-edit.sh "$(jq -n --arg f "$AD/app/f.ts" '{hook_event_name: "PostToolUse", tool_name: "Edit", tool_input: {file_path: $f}}')"
if [ "$CODE" -eq 2 ] && printf '%s' "$ERR" | grep -q 'custom-lint-failed'; then ok; else ko "post-edit lints files under srcDirs with commands.lintFile" "exit $CODE: $ERR"; fi
printf 'export const g = 1\n' >"$AD/src/g.ts"
run_hook post-edit.sh "$(jq -n --arg f "$AD/src/g.ts" '{hook_event_name: "PostToolUse", tool_name: "Edit", tool_input: {file_path: $f}}')"
[ "$CODE" -eq 0 ] && [ -z "$ERR" ] && ok || ko "post-edit ignores files outside srcDirs" "exit $CODE: $ERR"

# --- mode: new | existing | refactor ------------------------------------------------------------------

MD="$WORK/mode"
make_repo "$MD" feature/m
export CLAUDE_PROJECT_DIR="$MD"
session_input='{"hook_event_name":"SessionStart","session_id":"s-mode","source":"startup"}'
run_hook session-context.sh "$session_input"
printf '%s' "$OUT" | grep -q 'REFACTOR MODE' && ko "session-context stays quiet about refactor mode when the mode is not refactor" || ok
jq '.mode = "refactor"' "$MD/.claude/frontend-kit.json" >"$WORK/m.json" && mv "$WORK/m.json" "$MD/.claude/frontend-kit.json"
run_hook session-context.sh "$session_input"
printf '%s' "$OUT" | grep -q 'REFACTOR MODE IS ON' && ok || ko "session-context announces refactor mode" "$OUT"
run_hook skill-suggest.sh "$(jq -n '{hook_event_name: "UserPromptSubmit", prompt: "fix the header spacing please"}')"
printf '%s' "$OUT" | jq -r '.hookSpecificOutput.additionalContext' | grep -q 'Refactor mode is ON' && ok || ko "skill-suggest reminds Claude that refactor mode is on" "$OUT"
jq '.mode = "new"' "$MD/.claude/frontend-kit.json" >"$WORK/m.json" && mv "$WORK/m.json" "$MD/.claude/frontend-kit.json"
run_hook session-context.sh "$session_input"
printf '%s' "$OUT" | grep -q 'NEW PROJECT' && ok || ko "session-context announces a new project" "$OUT"
# The generic react profile never gets web-* or dash-* skills.
jq '.mode = "existing" | .profile = "react"' "$MD/.claude/frontend-kit.json" >"$WORK/m.json" && mv "$WORK/m.json" "$MD/.claude/frontend-kit.json"
run_hook skill-suggest.sh "$(jq -n '{hook_event_name: "UserPromptSubmit", prompt: "add a server function and a new table"}')"
printf '%s' "$OUT" | grep -qE 'web-server-fn|dash-create-table' && ko "skill-suggest hides web-* and dash-* skills in the react profile" "$OUT" || ok
# Lockfiles of every package manager are protected; JS is allowed when the project says so.
run_hook guard-paths.sh "$(jq -n --arg f "$MD/pnpm-lock.yaml" '{hook_event_name: "PreToolUse", tool_name: "Write", tool_input: {file_path: $f, content: "x"}}')"
[ "$(decision)" = deny ] && ok || ko "guard-paths protects pnpm-lock.yaml" "$OUT"
run_hook guard-paths.sh "$(jq -n --arg f "$MD/src/old.js" '{hook_event_name: "PreToolUse", tool_name: "Write", tool_input: {file_path: $f, content: "x"}}')"
[ "$(decision)" = deny ] && ok || ko "guard-paths keeps JS out of a TypeScript project" "$OUT"
jq '.allowJs = true' "$MD/.claude/frontend-kit.json" >"$WORK/m.json" && mv "$WORK/m.json" "$MD/.claude/frontend-kit.json"
run_hook guard-paths.sh "$(jq -n --arg f "$MD/src/old.js" '{hook_event_name: "PreToolUse", tool_name: "Write", tool_input: {file_path: $f, content: "x"}}')"
[ "$(decision)" = allow ] && ok || ko "guard-paths allows JS with allowJs" "$OUT"
# Every profile template parses and names a profile and a mode.
for profile in website dashboard react; do
  [ "$(jq -r .profile "$PLUGIN/templates/$profile/frontend-kit.json")" = "$profile" ] && ok || ko "templates/$profile/frontend-kit.json names its profile"
done

# --- Every hook script is executable and valid bash -------------------------------------------

for script in "$HOOKS"/*.sh; do
  bash -n "$script" && ok || ko "bash -n $(basename "$script")"
  case "$(basename "$script")" in lib.sh) continue ;; esac
  [ -x "$script" ] && ok || ko "$(basename "$script") is not executable"
done

echo "hook tests: $PASS passed, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then
  printf '%s\n' "$FAILED_NAMES"
  exit 1
fi
