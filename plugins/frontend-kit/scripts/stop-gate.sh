#!/bin/bash
# Stop: the quality gate Claude can't skip. When src/ changed during this session (uncommitted, or committed
# since the session started or the gate last passed), it runs
#   the typecheck: commands.typecheck, else tsc --noEmit -p tsconfig.json
#   the related tests: commands.relatedTests (the changed files are appended), else vitest related or jest --findRelatedTests
#   commands.i18nValidate from .claude/frontend-kit.json (only when a locale file changed)
# and, on failure, blocks the stop (exit 2) with the errors so Claude fixes them first. When it passes,
# it blocks once more per stop chain to ask for a code review by the frontend-reviewer agent (Opus).
#
# It stays out of the way: nothing changed in src/ this session → skip; the same src/ state was
# already gated → skip; and it gives up after 3 blocks in a row so a stubborn failure can't loop
# (Claude Code's own cap is 8). Typical run: 3–20 s (the full unit suite takes ~17 s).
set -u
. "$(dirname "$0")/lib.sh"

MAX_BLOCKS_IN_A_ROW=3
OUTPUT_LINES=60

hook_read_input
ACTIVE="$(hook_field '.stop_hook_active')"
SESSION_ID="$(hook_field '.session_id')"
SESSION_FILE="$HOOK_STATE_DIR/sessions/${SESSION_ID:-unknown}.json"

read_session() { jq -r "$1 // empty" "$SESSION_FILE" 2>/dev/null; }
SINCE_HEAD="$(read_session '.sinceHead')"
SINCE_TIME="$(read_session '.sinceTime')"
UNCOMMITTED="$(hook_changed_src_files)"
COMMITTED="$(hook_committed_src_files "$SINCE_HEAD" "$SINCE_TIME")"
CHANGED="$(printf '%s\n%s\n' "$UNCOMMITTED" "$COMMITTED" | sed '/^$/d' | sort -u)"
[ -z "$CHANGED" ] && exit 0

FINGERPRINT="$(printf '%s\n' "$CHANGED" | hook_files_fingerprint)"
BASELINE="$(read_session '.baseline')"
LAST_GATED="$(read_session '.lastGated')"
BLOCKS="$(read_session '.blocks')"
BLOCKS="${BLOCKS:-0}"
# One review request per stop chain: a stop that nothing blocked yet (stop_hook_active false) starts a new chain.
REVIEW_DONE="$(read_session '.reviewDone')"
[ "$ACTIVE" = "true" ] || REVIEW_DONE=""

# Untouched since the session started (the changes predate it) or since the last gate ran.
[ "$FINGERPRINT" = "$BASELINE" ] && exit 0
[ "$FINGERPRINT" = "$LAST_GATED" ] && exit 0
# A stop that a previous block forced may re-check a fix, but never more than the cap.
[ "$ACTIVE" = "true" ] && [ "$BLOCKS" -ge "$MAX_BLOCKS_IN_A_ROW" ] && exit 0

# Background agents edit src/ while the main session talks to the user. When this session made no
# src/ edit of its own and src/ changed in the last few seconds, an agent is mid-edit: its half-done
# files would fail the gate for work that isn't finished (or ours). Wait for the next stop instead.
# Our own edits always get gated. HOOK_SETTLE_SECONDS=0 turns the wait off (the hook tests do).
SETTLE_SECONDS="${HOOK_SETTLE_SECONDS:-30}"
MAIN_EDITS="$HOOK_STATE_DIR/sessions/${SESSION_ID:-unknown}.main-edits"
if [ "$SETTLE_SECONDS" -gt 0 ] && [ ! -s "$MAIN_EDITS" ] && command -v perl >/dev/null 2>&1; then
  SRC_PATHS=()
  while IFS= read -r src_dir; do [ -d "$HOOK_ROOT/$src_dir" ] && SRC_PATHS+=("$HOOK_ROOT/$src_dir"); done <<<"$KIT_SRC_DIRS"
  NEWEST_AGE=""
  [ ${#SRC_PATHS[@]} -gt 0 ] && NEWEST_AGE="$(perl -MFile::Find -e 'my $newest = 0; find(sub { return unless -f $_; my $mtime = (stat _)[9]; $newest = $mtime if $mtime > $newest }, @ARGV); print time() - $newest' "${SRC_PATHS[@]}" 2>/dev/null)"
  if [ -n "$NEWEST_AGE" ] && [ "$NEWEST_AGE" -lt "$SETTLE_SECONDS" ]; then
    exit 0
  fi
fi

cd "$HOOK_ROOT" || exit 0
BIN="$HOOK_ROOT/node_modules/.bin"
# Commands below are run through sh -c: bare tool names + PATH survive spaces and parentheses in the project path.
PATH="$BIN:$PATH"
FAILURES=""
PASSED=""

# A tool that isn't installed (no npm install yet, a fresh worktree) is skipped, not reported as a
# failure: the gate can only judge what it can run.
TYPECHECK_CMD="$(kit_typecheck_cmd)"
if [ -n "$TYPECHECK_CMD" ]; then
  TSC_OUT="$(sh -c "$TYPECHECK_CMD" 2>&1)"
  if [ $? -eq 0 ]; then
    PASSED="typecheck"
  else
    FAILURES="## typecheck: $TYPECHECK_CMD
$(printf '%s\n' "$TSC_OUT" | head -n "$OUTPUT_LINES")"
  fi
fi

TEST_FILES=()
while IFS= read -r file; do
  case "$file" in *.ts | *.tsx | *.js | *.jsx) [ -f "$file" ] && TEST_FILES+=("$file") ;; esac
done <<<"$CHANGED"
# {"stopGate": {"tests": "all"}} runs the whole unit suite (commands.allTests, default `vitest run`)
# instead of only the tests related to the changed files.
ALL_CMD=""
if [ "$(kit_get '.stopGate.tests' 'related')" = all ]; then
  ALL_CMD="$(kit_get '.commands.allTests' '')"
  if [ -z "$ALL_CMD" ]; then
    case "$(kit_tool vitest jest)" in
      vitest) ALL_CMD="vitest run --passWithNoTests --reporter=dot" ;;
      jest) ALL_CMD="jest --passWithNoTests" ;;
    esac
  fi
fi
if [ -n "$ALL_CMD" ]; then
  TEST_OUT="$(sh -c "$ALL_CMD" 2>&1)"
  if [ $? -eq 0 ]; then
    PASSED="$PASSED, all tests"
  else
    FAILURES="${FAILURES:+$FAILURES

}## $ALL_CMD
$(printf '%s\n' "$TEST_OUT" | grep -vE '^\s*$' | grep -vE '^ *(✓|·)' | tail -n "$OUTPUT_LINES")"
  fi
elif [ ${#TEST_FILES[@]} -gt 0 ]; then
  # With "apps" in frontend-kit.json each app runs its own related-tests command on its own files.
  APP_NAMES="$(for file in "${TEST_FILES[@]}"; do kit_app_of "$file"; echo; done | sort -u)"
  while IFS= read -r app; do
    APP_FILES=()
    for file in "${TEST_FILES[@]}"; do
      [ "$(kit_app_of "$file")" = "$app" ] && APP_FILES+=("$file")
    done
    [ ${#APP_FILES[@]} -gt 0 ] || continue
    RELATED_CMD="$(kit_app_cmd "$app" relatedTests)"
    if [ -z "$RELATED_CMD" ]; then
      case "$(kit_tool vitest jest)" in
        vitest) RELATED_CMD="vitest related --run --passWithNoTests --reporter=dot" ;;
        jest) RELATED_CMD="jest --findRelatedTests --passWithNoTests" ;;
      esac
    fi
    [ -n "$RELATED_CMD" ] || continue
    APP_CWD="$(kit_app_cwd "$app")"
    if [ -n "$APP_CWD" ] && [ -d "$HOOK_ROOT/$APP_CWD" ]; then
      REL_FILES=()
      for file in "${APP_FILES[@]}"; do REL_FILES+=("${file#"$APP_CWD"/}"); done
      TEST_OUT="$(cd "$HOOK_ROOT/$APP_CWD" && PATH="$HOOK_ROOT/$APP_CWD/node_modules/.bin:$PATH" sh -c "$RELATED_CMD \"\$@\"" related "${REL_FILES[@]}" 2>&1)"
    else
      TEST_OUT="$(sh -c "$RELATED_CMD \"\$@\"" related "${APP_FILES[@]}" 2>&1)"
    fi
    if [ $? -eq 0 ]; then
      PASSED="$PASSED, related tests${app:+ ($app)}"
    else
      FAILURES="${FAILURES:+$FAILURES

}## $RELATED_CMD ${APP_FILES[*]}
$(printf '%s\n' "$TEST_OUT" | grep -vE '^\s*$' | grep -vE '^ *(✓|·)' | tail -n "$OUTPUT_LINES")"
    fi
  done <<<"$APP_NAMES"
fi

# The i18n validator runs once per distinct command: each app can have its own (commands.i18nValidate under "apps").
LOCALE_FILES="$(printf '%s\n' "$CHANGED" | grep -E '/locales/[^/]+\.json$')"
if [ -n "$LOCALE_FILES" ]; then
  I18N_CMDS=""
  while IFS= read -r locale; do
    cmd="$(kit_app_cmd "$(kit_app_of "$locale")" i18nValidate)"
    [ -n "$cmd" ] || cmd="$([ -f scripts/validate-i18n.ts ] && echo 'node scripts/validate-i18n.ts')"
    [ -n "$cmd" ] && I18N_CMDS="$I18N_CMDS
$cmd"
  done <<<"$LOCALE_FILES"
  while IFS= read -r I18N_CMD; do
    [ -n "$I18N_CMD" ] || continue
    I18N_STATUS=0
    I18N_OUT="$(sh -c "$I18N_CMD" 2>&1)" || I18N_STATUS=$?
    if [ "$I18N_STATUS" -eq 0 ]; then
      PASSED="$PASSED, i18n"
    else
      FAILURES="${FAILURES:+$FAILURES

}## $I18N_CMD
$(printf '%s\n' "$I18N_OUT" | grep -vE '^\s*$' | tail -n "$OUTPUT_LINES")"
    fi
  done <<<"$(printf '%s\n' "$I18N_CMDS" | sort -u)"
fi

# Nothing could run: no verdict to record.
[ -z "$PASSED$FAILURES" ] && exit 0

mkdir -p "$HOOK_STATE_DIR/sessions"
if [ -z "$FAILURES" ]; then
  NEXT_BLOCKS=0
else
  NEXT_BLOCKS=$((BLOCKS + 1))
fi
# Gate passed and no review was asked for in this chain yet: ask for one (see the end of this file).
# {"stopGate": {"review": false}} in .claude/frontend-kit.json turns it off.
REVIEW_NOW=false
if [ -z "$FAILURES" ] && [ "$REVIEW_DONE" != true ] && ! { [ -f "$KIT_CONFIG" ] && [ "$(jq -r '.stopGate.review' "$KIT_CONFIG" 2>/dev/null)" = false ]; }; then
  REVIEW_NOW=true
  REVIEW_DONE=true
fi
REVIEW_SCOPE="the uncommitted changes"
[ -n "$COMMITTED" ] && REVIEW_SCOPE="what this session committed (git log -p ${SINCE_HEAD:+${SINCE_HEAD:0:10}..}HEAD) and the uncommitted changes"
GATED="$FINGERPRINT"
if [ -z "$FAILURES" ]; then
  # Passed: later commits count from here, and committing exactly what just passed is no new change.
  GATED="$(printf '%s\n' "$UNCOMMITTED" | hook_files_fingerprint)"
  SINCE_HEAD="$(git -C "$HOOK_ROOT" rev-parse -q --verify HEAD 2>/dev/null)"
  SINCE_TIME="$(date +%s)"
fi
jq -n --arg baseline "$BASELINE" --arg gated "$GATED" --arg head "$SINCE_HEAD" --arg at "$SINCE_TIME" \
  --argjson blocks "$NEXT_BLOCKS" --argjson reviewDone "${REVIEW_DONE:-false}" \
  '{baseline: $baseline, sinceHead: $head, sinceTime: $at, lastGated: $gated, blocks: $blocks, reviewDone: $reviewDone}' >"$SESSION_FILE"

FILE_COUNT="$(printf '%s\n' "$CHANGED" | grep -c .)"
if [ -z "$FAILURES" ]; then
  "$(dirname "$0")/record-gate.sh" pass stop-hook "${PASSED#, } on $FILE_COUNT changed src files"
  if [ "$REVIEW_NOW" = true ]; then
    echo "The quality gate passed on $FILE_COUNT changed src files. Before you finish, run a code review: start the frontend-reviewer agent (Agent tool, subagent_type \"frontend-reviewer\"; it runs on Opus) on $REVIEW_SCOPE. Fix every real finding (correctness, the project's rules); skip nitpicks. Do not run the review a second time after fixing. Then finish." >&2
    exit 2
  fi
  exit 0
fi

"$(dirname "$0")/record-gate.sh" fail stop-hook "stop gate failed on $FILE_COUNT changed src files"
{
  echo "Quality gate failed on the src/ changes from this session. Fix the cause (no any, casts or skipped tests), then finish:"
  echo
  printf '%s\n' "$FAILURES"
} >&2
exit 2
