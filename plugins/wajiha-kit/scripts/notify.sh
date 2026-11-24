#!/usr/bin/env bash
# Notification: a desktop alert when Claude waits for the user (a permission prompt, or idle input),
# so a long run never sits unnoticed in a background terminal. macOS only; silent elsewhere.
set -u
. "$(dirname "$0")/lib.sh"
hook_read_input

MESSAGE="$(hook_field '.message')"
[ -n "$MESSAGE" ] || MESSAGE="Claude is waiting for you"
command -v osascript >/dev/null 2>&1 || exit 0
[ "${HOOK_NOTIFY:-1}" = 0 ] && exit 0

# The text goes in as an argument, never into the script source, so quotes in it cannot break out.
osascript - "$MESSAGE" "$KIT_PROJECT_NAME — Claude" >/dev/null 2>&1 <<'APPLESCRIPT' || true
on run argv
  display notification (item 1 of argv) with title (item 2 of argv)
end run
APPLESCRIPT
exit 0
