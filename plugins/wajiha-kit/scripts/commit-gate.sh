#!/bin/bash
# PreToolUse (Bash): before `git commit`, tells Claude when the src/ changes being committed have not
# passed the quality gate (stop gate or verify skill). Context only, never a block: the user's
# "commit" is a decision, this just stops an unchecked commit from being a surprise.
set -u
. "$(dirname "$0")/lib.sh"

hook_read_input
COMMAND="$(hook_field '.tool_input.command')"
printf '%s' "$COMMAND" | grep -Eq '(^|[;&|[:space:]])git[[:space:]]+(-C[[:space:]]+[^[:space:]]+[[:space:]]+)?commit([[:space:]]|$)' || exit 0

[ -z "$(hook_changed_src_files)" ] && exit 0
GATE="$HOOK_STATE_DIR/last-gate.json"
RESULT="$(jq -r '.result // empty' "$GATE" 2>/dev/null)"
GATED="$(jq -r '.fingerprint // empty' "$GATE" 2>/dev/null)"
if [ "$RESULT" = pass ] && [ "$GATED" = "$(hook_src_fingerprint)" ]; then
  exit 0
fi

if [ -z "$RESULT" ]; then
  WHY="no quality gate has run in this project yet"
elif [ "$RESULT" = fail ]; then
  WHY="the last quality gate failed"
else
  WHY="src/ changed since the last passing quality gate"
fi
hook_context PreToolUse "About to commit source changes, but $WHY. Run the verify skill (or npm run check) first and commit only when it passes, unless the user said to commit as is."
exit 0
