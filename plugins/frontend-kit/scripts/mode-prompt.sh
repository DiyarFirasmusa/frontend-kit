#!/bin/bash
# UserPromptSubmit: one short reminder per turn while a mode with rules is on, so that a long session does not drift
# from it. Context only, never blocks. In new, existing and without a config it ends before jq and lib.sh.
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
case "$(hook_field '.prompt')" in /frontend-kit:mode* | /frontend-kit:refactor-mode* | /frontend-kit:upgrade-mode*) exit 0 ;; esac
LINES=""
for m in $MODE_PROJECT ${MODE_TASK:+$MODE_TASK}; do
  mode_is_project "$m" && case "$m" in new | existing) continue ;; esac
  LINES="${LINES:+$LINES
}Mode $m is ON: $(mode_summary "$m"). Rules: the session start block or the switch's message; only the user switches (/frontend-kit:mode status)."
done
[ -n "$LINES" ] && hook_context UserPromptSubmit "$LINES"
exit 0
