#!/usr/bin/env bash
# SubagentStop: when frontend-dev, test-engineer or refactor-architect reports back, the typecheck must pass first.
# refactor-architect is gated only when it changed source (SubagentStart records where it began: a plan is no edit),
# and nobody is gated in read-only mode. A failure
# keeps that agent working with the errors as its next instruction, so broken code never reaches the main
# session. Reviewers and auditors only read, so they are not gated. One retry: when the agent was already
# sent back once (stop_hook_active), it may stop and report the failure itself.
set -u
. "$(dirname "$0")/lib.sh"
hook_read_input

AGENT="$(hook_field '.agent_type')"
AGENT="${AGENT#wajiha-kit:}" # this plugin's agents may come with their scope; another plugin's are not ours
case "$AGENT" in
  frontend-dev | test-engineer | refactor-architect) ;;
  *) exit 0 ;;
esac
AGENT_ID="$(hook_field '.agent_id' | tr -cd 'A-Za-z0-9_-')"
START_FP="$HOOK_STATE_DIR/sessions/agent-$AGENT_ID.src-fp" # session-end drops it after three days
if [ "$(hook_field '.hook_event_name')" = SubagentStart ]; then
  if [ -n "$AGENT_ID" ] && [ "$AGENT" = refactor-architect ]; then
    mkdir -p "$HOOK_STATE_DIR/sessions" 2>/dev/null && hook_src_fingerprint >"$START_FP" 2>/dev/null
  fi
  exit 0
fi
[ "$(hook_field '.stop_hook_active')" = true ] && exit 0
if [ -f "$HOOK_STATE_DIR/task-mode.json" ] && [ "$(jq -r '.mode // empty' "$HOOK_STATE_DIR/task-mode.json" 2>/dev/null)" = read-only ]; then
  exit 0
fi
if [ "$AGENT" = refactor-architect ] && [ -n "$AGENT_ID" ] && [ -f "$START_FP" ]; then
  [ "$(cat "$START_FP" 2>/dev/null)" = "$(hook_src_fingerprint)" ] && exit 0
fi
[ "${HOOK_SUBAGENT_GATE:-1}" = 0 ] && exit 0

cd "$HOOK_ROOT" || exit 0
[ -d node_modules ] || exit 0
PATH="$HOOK_ROOT/node_modules/.bin:$PATH"
TYPECHECK="$(kit_typecheck_cmd)"
[ -n "$TYPECHECK" ] || exit 0
STATUS=0
OUTPUT="$(sh -c "$TYPECHECK" 2>&1)" || STATUS=$?
# tsc -b leaves a build-info file at the root; it is not part of any change.
rm -f "$HOOK_ROOT/tsconfig.tsbuildinfo" 2>/dev/null
[ "$STATUS" -eq 0 ] && exit 0

ERRORS="$(printf '%s\n' "$OUTPUT" | grep -E 'error TS' | head -20)"
[ -n "$ERRORS" ] || ERRORS="$(printf '%s\n' "$OUTPUT" | tail -20)"
jq -n --arg reason "The typecheck fails, so this work is not finished. Fix these errors (no any, casts or ts-ignore), run the typecheck again, then report:
$ERRORS" '{decision: "block", reason: $reason}'
exit 0
