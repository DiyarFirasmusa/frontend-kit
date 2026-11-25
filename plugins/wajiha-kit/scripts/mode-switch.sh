#!/bin/bash
# Turns a working mode on or off, or shows where things stand. Run by the user's /wajiha-kit:mode,
# /wajiha-kit:refactor-mode and /wajiha-kit:upgrade-mode commands, not by Claude: in a restricted mode the guard
# refuses the common ways of doing that, otherwise it is an instruction.
#
#   mode-switch.sh <project dir>            the words of the command arrive on stdin, one line:
#     (nothing) | status                    what is on, what is enforced
#     list                                  every mode, in one line each
#     <mode> [--until YYYY-MM-DD | --days N] [--base REF] [--files N] [--note TEXT...]
#     off [<mode> | all]                    the narrowest mode first; a project mode returns to what it replaced
set -u
PROJECT="${1:-}"
[ -d "$PROJECT" ] || { echo "mode-switch: no project folder given."; exit 0; }
export CLAUDE_PROJECT_DIR="$PROJECT"
HERE="$(cd "$(dirname "$0")" && pwd)"
NL='
'
ARGS="$(cat)"
ARGS="${ARGS#"${ARGS%%[![:space:]]*}"}"
FIRST="${ARGS%%[[:space:]]*}"
REST="${ARGS#"$FIRST"}"
REST="${REST#"${REST%%[![:space:]]*}"}"
BY_HAND="To leave by hand, the user (not Claude) sets \"mode\": \"existing\" in .claude/wajiha-kit.json in an editor and deletes .claude/state/task-mode.json."

if ! command -v jq >/dev/null 2>&1; then
  # A task mode can still be left; the project's mode needs jq to keep the rest of the file.
  if [ "$FIRST" = off ] && [ -f "${PROJECT%/}/.claude/state/task-mode.json" ]; then
    printf '%s\n' '{"mode":"off"}' >"${PROJECT%/}/.claude/state/task-mode.json" && echo "The task mode is off. A project mode was not touched (that needs jq)."
  else
    echo "Modes need jq. Nothing changed. Install it, then try again: Mac: brew install jq. Windows: winget install jqlang.jq. Linux: sudo apt install jq."
  fi
  echo "$BY_HAND"
  exit 0
fi
. "$HERE/lib.sh"
. "$HERE/mode-lib.sh"

# /wajiha-kit:refactor-mode and /wajiha-kit:upgrade-mode pass their own mode as the second argument:
# "on" and "off" mean that mode, every other word (audit, plan, next) only reports whether it is on.
SKILL_MODE="${2:-}"
if [ -n "$SKILL_MODE" ]; then
  case "$FIRST" in
    on)
      case "$REST" in --*) ARGS="$SKILL_MODE $REST" ;; *) ARGS="$SKILL_MODE" ;; esac ;;
    off) ARGS="off $SKILL_MODE" ;;
    status | '') ARGS="status" ;;
    *) if [ "$MODE_PROJECT" = "$SKILL_MODE" ]; then echo "$SKILL_MODE mode is on."; else echo "$SKILL_MODE mode is NOT on (on now: $(mode_label)). Turn it on first: /wajiha-kit:${SKILL_MODE}-mode on"; fi; exit 0 ;;
  esac
fi
case "$ARGS" in *"$NL"*) echo "Give the command and its options on one line. Nothing changed."; exit 0 ;; esac
set -f
# shellcheck disable=SC2086
set -- $ARGS
set +f
ACTION="${1:-status}"
[ $# -gt 0 ] && shift

LIFECYCLE=" new existing maintenance "
today() { date +%F; }
add_days() { date -v+"$1"d +%F 2>/dev/null || date -d "+$1 days" +%F 2>/dev/null; }
real_date() { # BSD date rolls an impossible day over, GNU date refuses it: only the same text back is a date
  local out
  out="$(date -j -f %Y-%m-%d "$1" +%F 2>/dev/null || date -d "$1" +%F 2>/dev/null)"
  [ "$out" = "$1" ]
}

write_config() { # <jq filter> [jq args...]: written in place, so the file keeps its permissions and links
  local filter="$1" body
  shift
  if body="$(jq "$@" "$filter" "$KIT_CONFIG" 2>/dev/null)" && [ -n "$body" ] && jq -e 'type == "object"' >/dev/null 2>&1 <<<"$body" && [ -w "$KIT_CONFIG" ]; then
    printf '%s\n' "$body" >"$KIT_CONFIG" && return 0
  fi
  echo "Could not update $KIT_CONFIG (is it valid JSON and writable?). Nothing changed. $BY_HAND"
  return 1
}

task_off() { # "off" is written, so that it differs from a damaged file
  [ -f "$MODE_TASK_FILE" ] || return 0
  printf '%s\n' "$MODE_TASK_OFF" >"$MODE_TASK_FILE" || { echo "Could not write $MODE_TASK_FILE. $BY_HAND"; return 1; }
}

show_status() {
  echo "Mode: $(mode_label)"
  [ -n "$MODE_BROKEN" ] && echo "WARNING: .claude/wajiha-kit.json is not valid JSON; a restricted mode named in it stays on until it is repaired."
  [ -n "$MODE_UNKNOWN" ] && echo "WARNING: \"$MODE_UNKNOWN\" is not a mode of this plugin version, so none of its rules apply (/wajiha-kit:mode list)."
  local m detail key wired=""
  mode_guard_wired && wired=1
  for m in $MODE_PROJECT ${MODE_TASK:+$MODE_TASK}; do
    echo "- $m: $(mode_summary "$m")"
    for key in since until base note; do
      detail="$(mode_detail "$m" "$key")"
      [ -n "$detail" ] && echo "    $key: $detail"
    done
    detail="$(mode_enforced "$m")"
    if [ -z "$detail" ]; then
      echo "    enforced: nothing, instruction only"
    elif [ -n "$wired" ]; then
      echo "    enforced for the edit tools: $detail"
      echo "    caught in common forms only (a guard rail, not a sandbox): $(mode_enforced_shell "$m")"
    else
      echo "    NOT enforced: this plugin copy does not register the mode guard (instruction only)"
    fi
  done
  echo "Turn off: /wajiha-kit:mode off · all modes: /wajiha-kit:mode list"
}

show_list() {
  local m detail
  echo "Project modes (kept in .claude/wajiha-kit.json, shared with the team through git, so they follow the branch):"
  for m in $MODE_PROJECT_NAMES; do printf -- '- %s: %s\n' "$m" "$(mode_summary "$m")"; done
  echo "Task modes (this checkout only, never committed):"
  for m in $MODE_TASK_NAMES; do printf -- '- %s: %s\n' "$m" "$(mode_summary "$m")"; done
  echo "Enforced for the edit tools:"
  for m in $MODE_PROJECT_NAMES $MODE_TASK_NAMES; do
    detail="$(mode_enforced "$m")"
    [ -n "$detail" ] && printf -- '- %s: %s\n' "$m" "$detail"
  done
  echo "Turn on: /wajiha-kit:mode <name> [--until YYYY-MM-DD | --days N] [--note why] (hotfix also --base REF --files N)."
  echo "In the shell the mode guard catches common forms only (a guard rail, not a sandbox); every other rule is an instruction to Claude."
}

announce() { # <mode> <replaced text>
  echo "Mode ON: $1 — $(mode_summary "$1")${2:+ ($2)}"
  mode_block "$1" | sed 's/^/  /'
  if mode_is_project "$1"; then
    case "$1" in existing) ;; *) echo "The project mode lives in .claude/wajiha-kit.json: commit it, or a branch without it won't have the mode." ;; esac
  fi
  echo "Status: /wajiha-kit:mode status · off: /wajiha-kit:mode off. Claude reads these rules from this message now and from the session start after /clear, /compact or a resume."
  mode_guard_wired || echo "NOTE: this plugin copy does not register the mode guard, so the blocks above are not active; Claude is asked to hold the rules itself."
}

turn_on() {
  local mode="$1" until="" base="" files="" note="" days="" previous replaced="" kept="" since arg filter
  shift
  mode_is_project "$mode" || mode_is_task "$mode" || { echo "\"$mode\" is not a mode (/wajiha-kit:mode list)."; return 0; }
  while [ $# -gt 0 ]; do
    arg="$1"
    shift
    case "$arg" in
      --until | --days | --base | --files)
        [ $# -gt 0 ] || { echo "$arg needs a value. Nothing changed."; return 0; }
        case "$arg" in --until) until="$1" ;; --days) days="$1" ;; --base) base="$1" ;; --files) files="$1" ;; esac
        shift ;;
      --note) note="$*"; break ;;
      *) echo "Unknown option $arg. Options: --until DATE, --days N, --base REF, --files N, --note TEXT."; return 0 ;;
    esac
  done
  if [ -n "$days" ]; then
    case "$days" in *[!0-9]* | ?????*) echo "--days needs a number (up to 9999)."; return 0 ;; esac
    until="$(add_days "$((10#$days))")"
    [ -n "$until" ] || { echo "--days could not be turned into a date. Nothing changed."; return 0; }
  fi
  if [ -n "$until" ]; then
    { printf '%s' "$until" | grep -Eq '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' && real_date "$until"; } || { echo "--until needs a date like 2026-12-01."; return 0; }
  fi
  if [ -n "$base" ]; then
    { printf '%s' "$base" | grep -Eq '^[A-Za-z0-9._/@{}~^-]+$' && [ "${base#-}" = "$base" ]; } || { echo "--base needs a branch, tag or commit name."; return 0; }
    git -C "$HOOK_ROOT" rev-parse -q --verify "$base^{commit}" >/dev/null 2>&1 || { echo "--base $base is not a known commit here (git fetch --tags?). Nothing changed."; return 0; }
  fi
  if [ -n "$files" ]; then
    case "$files" in *[!0-9]* | ??????*) echo "--files needs a number from 1 up."; return 0 ;; esac
    [ "$((10#$files))" -ge 1 ] || { echo "--files needs a number from 1 up."; return 0; }
    files="$((10#$files))"
  fi
  note="$(printf '%s' "$note" | tr -d '\000-\037' | cut -c1-200)"

  if mode_is_task "$mode"; then
    # The same mode again only changes what was given: --files 9 keeps the base and the note.
    if [ "$MODE_TASK" = "$mode" ]; then
      [ -n "$until" ] || until="$(mode_detail "$mode" until)"
      [ -n "$base" ] || base="$(mode_detail "$mode" base)"
      [ -n "$files" ] || files="$(mode_detail "$mode" files)"
      [ -n "$note" ] || note="$(mode_detail "$mode" note)"
      kept="$(mode_detail "$mode" since)"
    fi
    case "$files" in *[!0-9]*) files="" ;; esac
    mkdir -p "$HOOK_STATE_DIR" || { echo "Could not write $MODE_TASK_FILE."; return 0; }
    # The state stays out of every commit, also on a release tag whose .gitignore does not know it.
    [ -f "$HOOK_STATE_DIR/.gitignore" ] || printf '*\n' >"$HOOK_STATE_DIR/.gitignore"
    filter='{mode: $m, since: $s} + (if $u != "" then {until: $u} else {} end) + (if $b != "" then {base: $b} else {} end) + (if $f != "" then {files: ($f | tonumber)} else {} end) + (if $n != "" then {note: $n} else {} end)'
    if ! arg="$(jq -n --arg m "$mode" --arg s "${kept:-$(today)}" --arg u "$until" --arg b "$base" --arg f "$files" --arg n "$note" "$filter")" ||
      ! printf '%s\n' "$arg" >"$MODE_TASK_FILE"; then
      echo "Could not write $MODE_TASK_FILE."
      return 0
    fi
    MODE_TASK="$mode"
    announce "$mode" "task mode, this checkout only; on top of $MODE_PROJECT"
    return 0
  fi

  [ -f "$KIT_CONFIG" ] || { echo "There is no .claude/wajiha-kit.json: run /wajiha-kit:setup first."; return 0; }
  [ -z "$MODE_BROKEN" ] || { echo "Fix .claude/wajiha-kit.json first (it is not valid JSON). $BY_HAND"; return 0; }
  case "$LIFECYCLE" in
    *" $MODE_PROJECT "*) previous="$MODE_PROJECT" ;;
    *) previous="$(return_to)" ;;
  esac
  case "$LIFECYCLE" in *" $mode "*) previous="" ;; esac
  since="$(today)"
  if [ "$MODE_PROJECT" = "$mode" ]; then
    arg="$(mode_detail "$mode" since)"
    [ -z "$arg" ] || since="$arg"
    [ -n "$until" ] || until="$(mode_detail "$mode" until)"
    [ -n "$note" ] || note="$(mode_detail "$mode" note)"
  else
    replaced="replaces $MODE_PROJECT"
    case "$MODE_PROJECT" in refactor | upgrade) replaced="$replaced; its plan in docs/$MODE_PROJECT-plan.md is kept" ;; esac
  fi
  write_config '.mode = $m | .modeState = ({mode: $m, since: $s} + (if $p != "" then {previous: $p} else {} end) + (if $u != "" then {until: $u} else {} end) + (if $n != "" then {note: $n} else {} end))' \
    --arg m "$mode" --arg s "$since" --arg p "$previous" --arg u "$until" --arg n "$note" || return 0
  MODE_PROJECT="$mode"
  announce "$mode" "$replaced"
}

return_to() { # what "off" goes back to: never another restricted campaign
  local back
  back="$(jq -r '.modeState.previous // "existing"' "$KIT_CONFIG" 2>/dev/null)"
  case "$LIFECYCLE" in *" $back "*) printf '%s' "$back" ;; *) printf existing ;; esac
}

leave_project() {
  local back left="${MODE_UNKNOWN:-$MODE_PROJECT}"
  back="$(return_to)"
  write_config '.mode = $m | del(.modeState)' --arg m "$back" || return 1
  echo "Mode OFF: $left. Back to: $back. Unfinished plans (docs/refactor-plan.md, docs/upgrade-plan.md) are kept."
  if [ "$back" != existing ]; then
    MODE_PROJECT="$back"
    mode_block "$back" | sed 's/^/  /'
  fi
}

turn_off() {
  local which="${1:-}" project_on=""
  case "$MODE_PROJECT" in new | existing) ;; *) project_on=1 ;; esac
  [ -n "$MODE_UNKNOWN" ] && project_on=1
  if [ "$which" = all ]; then
    task_off || return 0
    MODE_TASK=""
    if [ -n "$MODE_BROKEN" ]; then
      echo "The task mode is off, but .claude/wajiha-kit.json is not valid JSON, so the project mode is unchanged. $BY_HAND"
      return 0
    fi
    if [ -n "$project_on" ]; then leave_project || return 0; fi
    echo "All modes off. Back to: $(kit_get '.mode' existing)."
    return 0
  fi
  if [ -n "$which" ] && ! mode_is_task "$which" && ! mode_is_project "$which" && [ "$which" != "$MODE_UNKNOWN" ]; then
    echo "\"$which\" is not a mode (/wajiha-kit:mode list)."
    return 0
  fi
  if [ -n "$MODE_TASK" ] && { [ -z "$which" ] || [ "$which" = "$MODE_TASK" ]; }; then
    task_off || return 0
    echo "Mode OFF: $MODE_TASK. Still on: $MODE_PROJECT. Turn that off too with /wajiha-kit:mode off."
    return 0
  fi
  if [ -n "$which" ] && [ "$which" != "${MODE_UNKNOWN:-$MODE_PROJECT}" ]; then
    echo "$which is not on (on now: $(mode_label))."
    return 0
  fi
  [ -f "$KIT_CONFIG" ] || { echo "There is no .claude/wajiha-kit.json, so no project mode is on."; return 0; }
  [ -z "$MODE_BROKEN" ] || { echo "Fix .claude/wajiha-kit.json first (it is not valid JSON). $BY_HAND"; return 0; }
  if [ "$MODE_PROJECT" = existing ] && [ -z "$MODE_UNKNOWN" ]; then
    echo "The project is in the default mode (existing); there is nothing to turn off. To change it: /wajiha-kit:mode <name>."
    return 0
  fi
  leave_project
}

case "$ACTION" in
  status) show_status ;;
  list) show_list ;;
  off) turn_off "${1:-}" ;;
  on) if [ -n "${1:-}" ]; then turn_on "$@"; else echo "Which mode? /wajiha-kit:mode list"; fi ;;
  *)
    if mode_is_project "$ACTION" || mode_is_task "$ACTION"; then turn_on "$ACTION" "$@"; else echo "\"$ACTION\" is not a mode or a command (status, list, off). /wajiha-kit:mode list shows the modes."; fi ;;
esac
exit 0
