#!/bin/bash
# Says whether Claude Code will update the kit in this project on its own, and how to update it by hand.
# /wajiha-kit:setup runs it at the end. Reads settings and the environment, changes nothing, uses no network.
#
#   kit-update-check.sh [project]
#
# Auto-update runs only in interactive sessions (up to ten minutes after the first message), when the marketplace's
# `autoUpdate` is true (off by default for a third-party one) and none of the environment switches turns it off.
set -u

PROJECT="${1:-${CLAUDE_PROJECT_DIR:-$PWD}}"
CONFIG="${CLAUDE_CONFIG_DIR:-${HOME:-}/.claude}"
BY_HAND="claude plugin marketplace update wajiha-kit && claude plugin update wajiha-kit@wajiha-kit"

report() { # <on | off | unknown> <why>
  echo "auto-update: $1 ($2)"
  echo "update by hand, in this project's folder: $BY_HAND"
  echo "then restart Claude Code, and run /wajiha-kit:setup again to get template changes"
  exit 0
}

case "${FORCE_AUTOUPDATE_PLUGINS:-}" in
  1 | true) ;;
  *)
    for name in DISABLE_AUTOUPDATER DISABLE_UPDATES CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC; do
      case "${!name:-}" in
        '' | 0 | false) ;;
        *) report off "$name is set where Claude Code runs; the Claude desktop app sets DISABLE_AUTOUPDATER" ;;
      esac
    done
    ;;
esac

command -v jq >/dev/null 2>&1 || report unknown "jq is missing, so the settings can't be read"
. "$(dirname "$0")/jq-compat.sh"

# auto_update <file> <jq path to the marketplace's entry> → true, false, or nothing when the file doesn't say.
# Not `//`: jq takes false for a missing value.
auto_update() {
  [ -f "$1" ] || return 0
  jq -r "$2 | if type == \"object\" and has(\"autoUpdate\") and .autoUpdate != null then (.autoUpdate | tostring) else empty end" "$1" 2>/dev/null
}

value=""
for file in "$PROJECT/.claude/settings.local.json" "$PROJECT/.claude/settings.json" "$CONFIG/settings.json"; do
  value="$(auto_update "$file" '.extraKnownMarketplaces?."wajiha-kit"?')"
  [ -n "$value" ] && break
done
[ -n "$value" ] || value="$(auto_update "$CONFIG/plugins/known_marketplaces.json" '."wajiha-kit"?')"

case "$value" in
  true) report on "interactive sessions only, up to ten minutes after the first message; a session with updates disabled skips it" ;;
  *) report off "autoUpdate is not true for the wajiha-kit marketplace, and it is off by default" ;;
esac
