#!/usr/bin/env bash
# SessionEnd: removes this session's working files from .claude/state (the main-session edit list the
# Stop gate reads) and any older than three days, so state never grows without bound.
set -u
. "$(dirname "$0")/lib.sh"
hook_read_input

SESSION_ID="$(hook_field '.session_id')"
SESSIONS="$HOOK_STATE_DIR/sessions"
[ -d "$SESSIONS" ] || exit 0
if [ -n "$SESSION_ID" ]; then
  rm -f "$SESSIONS/$SESSION_ID.main-edits" 2>/dev/null
fi
find "$SESSIONS" -type f -mtime +3 -delete 2>/dev/null
exit 0
