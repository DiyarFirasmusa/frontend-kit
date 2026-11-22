#!/bin/bash
# SessionStart(startup|resume|clear|compact): one compact block of where the work stands plus the
# hard rules, re-injected after /clear and /compact. Reads local refs only (no fetch), so it is instant and offline.
# It also records the src/ fingerprint, commit and time the session starts from, so the Stop gate checks
# the changes made in this session, committed or not, and only those.
set -u
. "$(dirname "$0")/lib.sh"

hook_read_input
SESSION_ID="$(hook_field '.session_id')"
git_() { git -C "$HOOK_ROOT" "$@" 2>/dev/null; }

mkdir -p "$HOOK_STATE_DIR/sessions"
find "$HOOK_STATE_DIR/sessions" -name '*.json' -mtime +3 -delete 2>/dev/null
SESSION_FILE="$HOOK_STATE_DIR/sessions/${SESSION_ID:-unknown}.json"
# A resumed or compacted session keeps the baseline it started with.
if [ ! -f "$SESSION_FILE" ]; then
  jq -n --arg baseline "$(hook_src_fingerprint)" --arg head "$(git_ rev-parse -q --verify HEAD)" --arg at "$(date +%s)" \
    '{baseline: $baseline, sinceHead: $head, sinceTime: $at, lastGated: "", blocks: 0}' >"$SESSION_FILE"
fi

BRANCH="$(git_ branch --show-current)"
BRANCH="${BRANCH:-detached at $(git_ rev-parse --short HEAD)}"
DIRTY="$(git_ status --porcelain | grep -c .)"

BASE="origin/$KIT_DEFAULT_BRANCH"
BASE_LINE="$BASE not fetched yet"
if git_ rev-parse --verify -q "$BASE" >/dev/null; then
  COUNTS="$(git_ rev-list --left-right --count "$BASE...HEAD")"
  BEHIND="${COUNTS%%[[:space:]]*}"
  AHEAD="${COUNTS##*[[:space:]]}"
  BASE_LINE="vs $BASE: $AHEAD ahead, $BEHIND behind (as of the last fetch)"
fi
UPSTREAM="$(git_ rev-parse --abbrev-ref --symbolic-full-name '@{upstream}')"
if [ -n "$UPSTREAM" ]; then
  UNPUSHED="$(git_ rev-list --count "$UPSTREAM..HEAD")"
  UPSTREAM_LINE="upstream $UPSTREAM, $UNPUSHED unpushed commit(s)"
else
  UPSTREAM_LINE="no upstream yet (first push: git push -u origin $BRANCH)"
fi

PORT_PID="$(lsof -nP -iTCP:"$KIT_DEV_PORT" -sTCP:LISTEN -t 2>/dev/null | head -n 1)"
if [ -n "$PORT_PID" ]; then
  PORT_LINE=":$KIT_DEV_PORT in use by $(ps -o comm= -p "$PORT_PID" 2>/dev/null | sed 's#.*/##') (pid $PORT_PID)"
else
  PORT_LINE=":$KIT_DEV_PORT free"
fi

GATE_LINE="no gate recorded yet"
if [ -f "$HOOK_STATE_DIR/last-gate.json" ]; then
  GATE_LINE="$(jq -r '"last gate: \(.result) (\(.source), \(.branch) @ \(.head), \(.at)) \(.summary)"' "$HOOK_STATE_DIR/last-gate.json" 2>/dev/null)"
fi

WARNING=""
if printf '%s' "$BRANCH" | grep -Eq "^($(kit_alternation '.protectedBranches' 'main|master'))$"; then
  WARNING="
WARNING: you are on the protected branch $BRANCH. Never edit or commit here — create a task branch from $BASE first."
fi
LIVE="${KIT_LIVE_HOSTS:-the live site}"

APPS_BLOCK=""
APPS_LINE="$([ -f "$KIT_CONFIG" ] && jq -r '[.apps[]? | "\(.name) (\(.profile // "react")) under \(.path)"] | join(", ")' "$KIT_CONFIG" 2>/dev/null)"
[ -n "$APPS_LINE" ] && APPS_BLOCK="
Apps in this project: $APPS_LINE. Rules and checks follow the app a file belongs to."
MODE_BLOCK=""
case "$KIT_MODE" in
  refactor) MODE_BLOCK="
REFACTOR MODE IS ON: restructure the project to the standards in .claude/rules/ through /frontend-kit:refactor-mode (audit, plan the user approves, one phase at a time, behaviour frozen, gate green between phases). Drive-by refactors outside the plan stay off." ;;
  new) MODE_BLOCK="
NEW PROJECT: build to the standards from the first file (feature folders, strict types, tests, i18n); no shortcuts to refactor later." ;;
esac

cat <<EOF
$KIT_PROJECT_NAME — session context
branch: $BRANCH · $BASE_LINE · $UPSTREAM_LINE
working tree: $DIRTY changed file(s) · dev server $PORT_LINE · $GATE_LINE
last commits:
$(git_ log --oneline -3 | sed 's/^/  /')$WARNING
Hard rules (hooks and deny rules enforce them):
1. One branch per task from $BASE. Never commit, push or merge on $KIT_PROTECTED_BRANCHES.
2. Ask before every commit and push ("commit" from the user is that yes). Never --no-verify, never force push.
3. Never open or merge a PR. After a push, print $(kit_compare_link)
4. Never test against $LIVE — local (:$KIT_DEV_PORT) or $KIT_UAT_HOST only.
5. Never touch deploy config, the build script, .env* or generated files (protectedPaths / generatedPaths in .claude/frontend-kit.json).
6. Every change ships with tests, Arabic + English strings, and passes typecheck, lint and tests.$APPS_BLOCK$MODE_BLOCK
EOF
