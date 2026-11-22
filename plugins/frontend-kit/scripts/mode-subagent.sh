#!/bin/bash
# SubagentStart: a helper agent does not get the session-start context, so it gets the mode rules here.
# In new, existing and without a config it ends before jq and lib.sh.
set -u
case "$0" in */*) HERE="${0%/*}" ;; *) HERE=. ;; esac
. "$HERE/mode-active.sh"
if [ -n "${CLAUDE_PROJECT_DIR:-}" ] && ! mode_maybe_on "${CLAUDE_PROJECT_DIR%/}"; then
  exec cat >/dev/null
fi
. "$HERE/lib.sh"
. "$HERE/mode-lib.sh"
hook_read_input
mode_restricted || exit 0
hook_context SubagentStart "Working mode of this project as of now (the user's, not yours to change):
$(mode_blocks)"
exit 0
