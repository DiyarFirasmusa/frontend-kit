#!/usr/bin/env bash
# PostToolUse(Bash): a source file changed through the shell (sed -i, a redirect, a codemod, git apply) never passes
# post-edit.sh, so the Stop gate could not tell the main session's own work from a background agent's mid-edit and
# waited instead of gating it. This records that the main session changed src/ this way (the same list post-edit.sh
# keeps), only when the command looks like a write and the source really changed. Context-free and fast.
set -u
. "$(dirname "$0")/lib.sh"
hook_read_input
[ -z "$(hook_field '.agent_id')" ] || exit 0
SESSION_ID="$(hook_field '.session_id')"
[ -n "$SESSION_ID" ] || exit 0
COMMAND="$(hook_field '.tool_input.command')"
printf '%s' "$COMMAND" | grep -Eq '(sed[[:space:]]+(-[A-Za-z]*i|--in-place)|perl[[:space:]]+-[A-Za-z]*i|[^<>0-9&]>>?[[:space:]]*[^&|[:space:]]|\btee\b|\bmv\b|\bcp\b|\bpatch\b|git[[:space:]]+(apply|checkout|restore|stash|am|cherry-pick|revert|reset)|--write|--fix|codemod)' || exit 0
FINGERPRINT="$(hook_src_fingerprint)"
STATE="$HOOK_STATE_DIR/sessions/$SESSION_ID.bash-fp"
[ "$(cat "$STATE" 2>/dev/null)" = "$FINGERPRINT" ] && exit 0
[ -n "$(hook_changed_src_files)" ] || exit 0
mkdir -p "$HOOK_STATE_DIR/sessions" 2>/dev/null || exit 0
printf '%s\n' "$FINGERPRINT" >"$STATE" 2>/dev/null
printf '(bash)\n' >>"$HOOK_STATE_DIR/sessions/$SESSION_ID.main-edits" 2>/dev/null
exit 0
