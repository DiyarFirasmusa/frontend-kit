#!/usr/bin/env bash
# PreToolUse + PostToolUse(Bash): a source file changed through the shell (sed -i, a redirect, a codemod, git apply)
# never passes post-edit.sh, so the Stop gate could not tell the main session's own work from a background agent's
# mid-edit and waited instead of gating it. Before a command that looks like a write the state of the source is
# saved; after it, the main session's edit list (the one post-edit.sh keeps) gets an entry only when the source
# really changed. A redirect to /dev/null is no write. Context-free and fast.
set -u
. "$(dirname "$0")/lib.sh"
hook_read_input
[ -z "$(hook_field '.agent_id')" ] || exit 0
SESSION_ID="$(hook_field '.session_id')"
[ -n "$SESSION_ID" ] || exit 0
case "$SESSION_ID" in *[!A-Za-z0-9._-]* | .*) exit 0 ;; esac
COMMAND="$(hook_field '.tool_input.command' | sed -E 's#(&|[0-9]*)>>?[[:space:]]*/dev/[a-z]+##g; s#[0-9]*>&[0-9-]##g')"
printf '%s' "$COMMAND" | grep -Eq '(sed[[:space:]]+(-[A-Za-z]*i|--in-place)|perl[[:space:]]+-[A-Za-z]*i|(^|[^<>0-9&])>>?[[:space:]]*[^&|[:space:]]|\btee\b|\bmv\b|\bcp\b|\bpatch\b|git[[:space:]]+(apply|checkout|restore|stash|am|cherry-pick|revert|reset)|--write|--fix|codemod)' || exit 0

SESSIONS="$HOOK_STATE_DIR/sessions"
CALL_ID="$(hook_field '.tool_use_id')"
case "$CALL_ID" in *[!A-Za-z0-9_-]*) CALL_ID="" ;; esac
BEFORE="$SESSIONS/$SESSION_ID.${CALL_ID:-call}.before"
if [ "$(hook_field '.hook_event_name')" = PreToolUse ]; then
  mkdir -p "$SESSIONS" 2>/dev/null || exit 0
  hook_src_fingerprint >"$BEFORE" 2>/dev/null
  exit 0
fi

FINGERPRINT="$(hook_src_fingerprint)"
STATE="$SESSIONS/$SESSION_ID.bash-fp"
if [ -f "$BEFORE" ]; then
  SAVED="$(cat "$BEFORE" 2>/dev/null)"
  rm -f "$BEFORE" 2>/dev/null
  [ "$SAVED" = "$FINGERPRINT" ] && exit 0
else
  # No saved state (the hook wasn't there before the command): the last recorded one is the comparison.
  [ "$(cat "$STATE" 2>/dev/null)" = "$FINGERPRINT" ] && exit 0
  [ -n "$(hook_changed_src_files)" ] || exit 0
fi
mkdir -p "$SESSIONS" 2>/dev/null || exit 0
printf '%s\n' "$FINGERPRINT" >"$STATE" 2>/dev/null
printf '(bash)\n' >>"$SESSIONS/$SESSION_ID.main-edits" 2>/dev/null
exit 0
