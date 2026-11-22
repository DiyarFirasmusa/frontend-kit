#!/bin/bash
# SubagentStart: a helper agent does not get the session-start context, so it gets the mode rules here.
set -u
. "$(dirname "$0")/lib.sh"
. "$(dirname "$0")/mode-lib.sh"
hook_read_input
mode_restricted || exit 0
hook_context SubagentStart "Working mode of this project (the user's, not yours to change):
$(mode_blocks)"
exit 0
