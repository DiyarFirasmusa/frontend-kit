#!/bin/bash
# Turns a working mode on or off, or shows where things stand. Run by the user's /frontend-kit:mode and
# /frontend-kit:refactor-mode commands, never by Claude (mode-guard.sh refuses it).
#
#   mode-switch.sh <project dir>            the words of the command arrive on stdin:
#     (nothing) | status                    what is on, what is enforced
#     list                                  every mode, in one line each
#     <mode> [--until YYYY-MM-DD | --days N] [--base REF] [--files N] [--note TEXT...]
#     off [<mode> | all]                    the narrowest mode first; a project mode returns to what it replaced
set -u
PROJECT="${1:-}"
[ -d "$PROJECT" ] || { echo "mode-switch: no project folder given."; exit 0; }
export CLAUDE_PROJECT_DIR="$PROJECT"
. "$(dirname "$0")/lib.sh"
. "$(dirname "$0")/mode-lib.sh"

ARGS="$(cat)"
# /frontend-kit:refactor-mode and /frontend-kit:upgrade-mode pass their own mode as the second argument:
# "on" and "off" mean that mode, every other word (audit, plan, next) only reports whether it is on.
SKILL_MODE="${2:-}"
if [ -n "$SKILL_MODE" ]; then
  # shellcheck disable=SC2086
  case "$(printf '%s' $ARGS | cut -d' ' -f1)" in
    on) ARGS="$SKILL_MODE" ;;
    off) ARGS="off $SKILL_MODE" ;;
    status | '') ARGS="status" ;;
    *) if [ "$MODE_PROJECT" = "$SKILL_MODE" ]; then echo "$SKILL_MODE mode is on."; else echo "$SKILL_MODE mode is NOT on (on now: $(mode_label)). Turn it on first: /frontend-kit:${SKILL_MODE}-mode on"; fi; exit 0 ;;
  esac
fi
set -f
# shellcheck disable=SC2086
set -- $ARGS
set +f
ACTION="${1:-status}"
[ $# -gt 0 ] && shift

LIFECYCLE=" new existing maintenance "
today() { date +%F; }
add_days() { date -v+"$1"d +%F 2>/dev/null || date -d "+$1 days" +%F 2>/dev/null; }

write_config() { # <jq filter> [jq args...]
  local filter="$1" tmp
  shift
  tmp="$(mktemp "$KIT_CONFIG.XXXXXX")" || { echo "Could not write $KIT_CONFIG."; return 1; }
  if jq "$@" "$filter" "$KIT_CONFIG" >"$tmp" 2>/dev/null && jq -e 'type == "object"' "$tmp" >/dev/null 2>&1; then
    mv "$tmp" "$KIT_CONFIG"
  else
    rm -f "$tmp"
    echo "Could not update $KIT_CONFIG (is it valid JSON?). Nothing changed."
    return 1
  fi
}

show_status() {
  echo "Mode: $(mode_label)"
  [ -n "$MODE_BROKEN" ] && echo "WARNING: .claude/frontend-kit.json is not valid JSON; the project mode is unknown."
  [ -n "$MODE_UNKNOWN" ] && echo "WARNING: \"$MODE_UNKNOWN\" is not a mode of this plugin version, so none of its rules apply (/frontend-kit:mode list)."
  local m detail
  for m in $MODE_PROJECT ${MODE_TASK:+$MODE_TASK}; do
    echo "- $m: $(mode_summary "$m")"
    detail="$(mode_detail "$m" since)"; [ -n "$detail" ] && echo "    since: $detail"
    detail="$(mode_detail "$m" until)"; [ -n "$detail" ] && echo "    until: $detail"
    detail="$(mode_detail "$m" base)"; [ -n "$detail" ] && echo "    base: $detail"
    detail="$(mode_detail "$m" note)"; [ -n "$detail" ] && echo "    note: $detail"
    detail="$(mode_enforced "$m")"
    if [ -n "$detail" ]; then
      if mode_guard_wired; then echo "    enforced by the mode guard: $detail"; else echo "    NOT enforced: this plugin copy does not register the mode guard (instruction only)"; fi
    else
      echo "    enforced: nothing, instruction only"
    fi
  done
  echo "Turn off: /frontend-kit:mode off · all modes: /frontend-kit:mode list"
}

show_list() {
  local m
  echo "Project modes (kept in .claude/frontend-kit.json, shared with the team):"
  for m in $MODE_PROJECT_NAMES; do printf -- '- %s: %s\n' "$m" "$(mode_summary "$m")"; done
  echo "Task modes (this checkout only, never committed):"
  for m in $MODE_TASK_NAMES; do printf -- '- %s: %s\n' "$m" "$(mode_summary "$m")"; done
  echo "Turn on: /frontend-kit:mode <name> [--until YYYY-MM-DD | --days N] [--note why] (hotfix also --base REF --files N)."
  echo "The mode guard blocks only what a hook can see; every other rule is an instruction to Claude."
}

announce() { # <mode> <replaced text>
  echo "Mode ON: $1 — $(mode_summary "$1")${2:+ ($2)}"
  mode_block "$1" | sed 's/^/  /'
  echo "Status: /frontend-kit:mode status · off: /frontend-kit:mode off. Claude reads these rules from this message now and from the session start after /clear, /compact or a resume."
  mode_guard_wired || echo "NOTE: this plugin copy does not register the mode guard, so the blocks above are not active; Claude is asked to hold the rules itself."
}

turn_on() {
  local mode="$1" until="" base="" files="" note="" days="" previous replaced="" sentence arg
  shift
  while [ $# -gt 0 ]; do
    arg="$1"
    shift
    case "$arg" in
      --until) until="${1:-}"; shift ;;
      --days) days="${1:-}"; shift ;;
      --base) base="${1:-}"; shift ;;
      --files) files="${1:-}"; shift ;;
      --note) note="$*"; break ;;
      *) echo "Unknown option $arg. Options: --until DATE, --days N, --base REF, --files N, --note TEXT."; return 0 ;;
    esac
  done
  if [ -n "$days" ]; then
    case "$days" in '' | *[!0-9]*) echo "--days needs a number."; return 0 ;; esac
    until="$(add_days "$days")"
  fi
  if [ -n "$until" ]; then
    printf '%s' "$until" | grep -Eq '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' || { echo "--until needs a date like 2026-12-01."; return 0; }
  fi
  if [ -n "$base" ]; then
    printf '%s' "$base" | grep -Eq '^[A-Za-z0-9._/@{}~^-]+$' && [ "${base#-}" = "$base" ] || { echo "--base needs a branch, tag or commit name."; return 0; }
    git -C "$HOOK_ROOT" rev-parse -q --verify "$base^{commit}" >/dev/null 2>&1 || { echo "--base $base is not a known commit here (git fetch --tags?). Nothing changed."; return 0; }
  fi
  if [ -n "$files" ]; then
    case "$files" in '' | *[!0-9]*) echo "--files needs a number."; return 0 ;; esac
  fi
  note="$(printf '%s' "$note" | tr -d '\000-\037' | cut -c1-200)"

  if mode_is_task "$mode"; then
    mkdir -p "$HOOK_STATE_DIR"
    jq -n --arg m "$mode" --arg s "$(today)" --arg u "$until" --arg b "$base" --arg f "$files" --arg n "$note" \
      '{mode: $m, since: $s} + (if $u != "" then {until: $u} else {} end) + (if $b != "" then {base: $b} else {} end) + (if $f != "" then {files: ($f | tonumber)} else {} end) + (if $n != "" then {note: $n} else {} end)' \
      >"$MODE_TASK_FILE.tmp" && mv "$MODE_TASK_FILE.tmp" "$MODE_TASK_FILE" || { echo "Could not write $MODE_TASK_FILE."; return 0; }
    MODE_TASK="$mode"
    announce "$mode" "task mode, this checkout only; on top of $MODE_PROJECT"
    return 0
  fi

  [ -f "$KIT_CONFIG" ] || { echo "There is no .claude/frontend-kit.json: run /frontend-kit:setup first."; return 0; }
  [ -z "$MODE_BROKEN" ] || { echo "Fix .claude/frontend-kit.json first (it is not valid JSON)."; return 0; }
  case "$LIFECYCLE" in
    *" $MODE_PROJECT "*) previous="$MODE_PROJECT" ;;
    *) previous="$(jq -r '.modeState.previous // "existing"' "$KIT_CONFIG" 2>/dev/null)" ;;
  esac
  case "$LIFECYCLE" in *" $mode "*) previous="" ;; esac
  [ "$MODE_PROJECT" != "$mode" ] && replaced="replaces $MODE_PROJECT"
  case "$MODE_PROJECT" in refactor) [ "$mode" != refactor ] && replaced="$replaced; its plan in docs/refactor-plan.md is kept" ;; upgrade) [ "$mode" != upgrade ] && replaced="$replaced; its plan in docs/upgrade-plan.md is kept" ;; esac
  write_config '.mode = $m | .modeState = ({mode: $m, since: $s} + (if $p != "" then {previous: $p} else {} end) + (if $u != "" then {until: $u} else {} end) + (if $n != "" then {note: $n} else {} end))' \
    --arg m "$mode" --arg s "$(today)" --arg p "$previous" --arg u "$until" --arg n "$note" || return 0
  KIT_MODE="$mode"
  MODE_PROJECT="$mode"
  sentence="$replaced"
  announce "$mode" "${sentence# }"
}

turn_off() {
  local which="${1:-}" back
  if [ "$which" = all ]; then
    rm -f "$MODE_TASK_FILE"
    [ -f "$KIT_CONFIG" ] && [ -z "$MODE_BROKEN" ] && write_config '.mode = (.modeState.previous // "existing") | del(.modeState)'
    echo "All modes off. Back to: $(kit_get '.mode' existing)."
    return 0
  fi
  if [ -n "$which" ] && ! mode_is_task "$which" && ! mode_is_project "$which"; then
    echo "\"$which\" is not a mode (/frontend-kit:mode list)."
    return 0
  fi
  if { [ -z "$which" ] || mode_is_task "$which"; } && [ -n "$MODE_TASK" ] && { [ -z "$which" ] || [ "$which" = "$MODE_TASK" ]; }; then
    rm -f "$MODE_TASK_FILE"
    echo "Mode OFF: $MODE_TASK. Still on: $MODE_PROJECT. Turn that off too with /frontend-kit:mode off."
    return 0
  fi
  if [ -n "$which" ] && [ "$which" != "$MODE_PROJECT" ]; then
    echo "$which is not on (on now: $(mode_label))."
    return 0
  fi
  [ -f "$KIT_CONFIG" ] || { echo "There is no .claude/frontend-kit.json."; return 0; }
  [ -z "$MODE_BROKEN" ] || { echo "Fix .claude/frontend-kit.json first (it is not valid JSON)."; return 0; }
  case "$LIFECYCLE" in
    *" $MODE_PROJECT "*)
      if [ "$MODE_PROJECT" = existing ]; then echo "The project is in the default mode (existing); there is nothing to turn off. To change it: /frontend-kit:mode <name>."; return 0; fi ;;
  esac
  back="$(jq -r '.modeState.previous // "existing"' "$KIT_CONFIG" 2>/dev/null)"
  write_config '.mode = (.modeState.previous // "existing") | del(.modeState)' || return 0
  echo "Mode OFF: $MODE_PROJECT. Back to: $back. Unfinished plans (docs/refactor-plan.md, docs/upgrade-plan.md) are kept."
  echo "Hooks and the rules for $back apply from now; Claude reads $back's rules at the next session start."
}

case "$ACTION" in
  status | '') show_status ;;
  list) show_list ;;
  off) turn_off "${1:-}" ;;
  on) [ -n "${1:-}" ] && turn_on "$@" || echo "Which mode? /frontend-kit:mode list" ;;
  *)
    if mode_is_project "$ACTION" || mode_is_task "$ACTION"; then turn_on "$ACTION" "$@"; else echo "\"$ACTION\" is not a mode or a command (status, list, off). /frontend-kit:mode list shows the modes."; fi ;;
esac
exit 0
