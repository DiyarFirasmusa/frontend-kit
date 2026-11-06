#!/usr/bin/env bash
# SubagentStop: when frontend-dev or test-engineer reports back, the typecheck must pass first. A failure
# keeps that agent working with the errors as its next instruction, so broken code never reaches the main
# session. Reviewers and auditors only read, so they are not gated. One retry: when the agent was already
# sent back once (stop_hook_active), it may stop and report the failure itself.
set -u
. "$(dirname "$0")/lib.sh"
hook_read_input

AGENT="$(hook_field '.agent_type')"
case "$AGENT" in
  frontend-dev | test-engineer) ;;
  *) exit 0 ;;
esac
[ "$(hook_field '.stop_hook_active')" = true ] && exit 0
[ "${HOOK_SUBAGENT_GATE:-1}" = 0 ] && exit 0

cd "$HOOK_ROOT" || exit 0
[ -d node_modules ] || exit 0
TYPECHECK="$(kit_get '.commands.typecheck' 'npm run --silent typecheck')"
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
