# shellcheck shell=bash
# The cheap question that comes before lib.sh and jq: can a working mode be on? Sourced, never run. Reads two small
# files with builtins only, so a project with no config, or in new or existing, costs no process and needs no jq.
# "Maybe" goes on to mode-lib.sh, which really answers.

MODE_RAW_RE='"mode"[[:space:]]*:[[:space:]]*"[[:space:]]*(maintenance|refactor|upgrade|freeze)[[:space:]]*"'
MODE_TASK_OFF='{"mode":"off"}' # what "off" leaves in task-mode.json; anything else unreadable there means read-only

# mode_raw_project <config file>: sets MODE_RAW to the restricted project mode its text names (lower case), else empty.
mode_raw_project() {
  local body=""
  MODE_RAW=""
  [ -f "$1" ] && [ -r "$1" ] || return 1
  IFS= read -r -d '' body <"$1"
  mode_raw_text "$body"
}

mode_raw_text() { # <the config's text>: the same
  local found="" name
  MODE_RAW=""
  shopt -s nocasematch
  if [[ "$1" =~ $MODE_RAW_RE ]]; then
    found="${BASH_REMATCH[1]}"
    for name in maintenance refactor upgrade freeze; do
      [[ "$found" == "$name" ]] && MODE_RAW="$name"
    done
  fi
  shopt -u nocasematch
  [ -n "$MODE_RAW" ]
}

mode_maybe_on() { # <project root>
  local body=""
  if [ -f "$1/.claude/state/task-mode.json" ]; then
    IFS= read -r -d '' body <"$1/.claude/state/task-mode.json"
    [ "${body//[[:space:]]/}" = "$MODE_TASK_OFF" ] || return 0
  fi
  mode_raw_project "$1/.claude/frontend-kit.json"
}
