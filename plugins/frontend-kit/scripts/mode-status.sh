#!/bin/bash
# One line for a status line or a script: "mode: existing + hotfix" (--json: the same as JSON). Changes nothing.
#   bash mode-status.sh [project dir] [--json]
set -u
[ -d "${1:-}" ] && export CLAUDE_PROJECT_DIR="$1"
. "$(dirname "$0")/lib.sh"
. "$(dirname "$0")/mode-lib.sh"
if [ "${2:-${1:-}}" = --json ]; then
  jq -n --arg p "$MODE_PROJECT" --arg t "$MODE_TASK" --argjson g "$(mode_guard_wired && echo true || echo false)" '{project: $p, task: ($t | select(. != "")), guardWired: $g}'
else
  echo "mode: $(mode_label)"
fi
