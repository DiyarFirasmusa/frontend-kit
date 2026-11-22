#!/bin/bash
# UserPromptSubmit: checks the skills we have against the prompt and tells Claude which ones fit,
# before it starts. Two sources:
#   1. the kit's own skills, matched by the English regexes in skill-triggers.tsv and the Arabic rules in
#      skill-triggers-ar.txt (arabic-hints.awk; first 3 in the order of the .tsv win), filtered to the
#      project's profile (a dashboard never gets web-* skills, a website never gets dash-*);
#   2. the project's own skills in .claude/skills/*, matched by description words (>= 3 distinct words,
#      Arabic ones whatever their spelling or attached prefixes).
# In plan mode (permission_mode "plan") it also points Claude at the personal /spec workflow,
# ~/.claude/skills/spec/SKILL.md, when that file exists. That skill is user-only (disable-model-invocation),
# so Claude reads the file instead of invoking it.
# Context only: it never blocks and never rewrites the prompt. Off with {"hooks": {"skillSuggest": false}}
# in .claude/frontend-kit.json.
set -u
. "$(dirname "$0")/lib.sh"

MAX_SUGGESTIONS=3
SCRIPTS="$(dirname "$0")"

hook_read_input
[ -f "$KIT_CONFIG" ] && [ "$(jq -r '.hooks.skillSuggest' "$KIT_CONFIG" 2>/dev/null)" = false ] && exit 0

# Bytes from here on: the same answer in every locale, and broken UTF-8 in a paste stops neither tr nor awk.
export LC_ALL=C
RAW_PROMPT="$(hook_field '.prompt')"
PROMPT="$(printf '%s' "$RAW_PROMPT" | tr '[:upper:]' '[:lower:]' | tr '\n' ' ')"
[ "${#PROMPT}" -lt 6 ] && exit 0
# Slash commands already name their skill; agent hand-backs and notifications aren't the user's task.
case "$PROMPT" in
  '/'* | *'<agent-message'* | *'<task-notification'* | *'subagent hand-back'*) exit 0 ;;
esac

PROFILE="$(kit_get '.profile' '')"
# Several apps in one project: every app's skills stay available, and Claude is told which app is which.
APPS_LINE=""
[ -f "$KIT_CONFIG" ] && APPS_LINE="$(jq -r '[.apps[]? | "\(.name) = \(.profile // "react") app under \(.path)"] | join("; ")' "$KIT_CONFIG" 2>/dev/null)"
[ -n "$APPS_LINE" ] && PROFILE=""
TRIGGERS="$SCRIPTS/skill-triggers.tsv"
TAB="$(printf '\t')"
NEWLINE="
"
FOUND=""
COUNT=0

add() {
  FOUND="${FOUND:+$FOUND
}- $1"
  COUNT=$((COUNT + 1))
}

# What fits in Arabic: "K<tab>skill" for the kit's skills, "N<tab>name<tab>words" for the project's.
# The bytes D8 and D9 start the Arabic letters; a prompt without them costs nothing.
ARABIC=""
case "$PROMPT" in
  *$'\330'* | *$'\331'*)
    ARABIC="$NEWLINE$(
      {
        printf '%s\n' "$RAW_PROMPT" | sed "s/^/P$TAB/"
        for file in "$HOOK_ROOT"/.claude/skills/*/SKILL.md; do
          [ -f "$file" ] || continue
          printf 'S\t%s\t%s\n' "$(basename "$(dirname "$file")")" "$(sed -n 's/^description: *//p' "$file" | head -n1)"
        done
      } | awk -v rules="$SCRIPTS/skill-triggers-ar.txt" -f "$SCRIPTS/arabic-hints.awk" 2>/dev/null
    )$NEWLINE"
    ;;
esac

if [ -f "$TRIGGERS" ]; then
  while IFS="$(printf '\t')" read -r skill regex; do
    [ "$COUNT" -ge "$MAX_SUGGESTIONS" ] && break
    case "$skill" in '' | '#'*) continue ;; esac
    case "$PROFILE:$skill" in
      dashboard:web-create-* | dashboard:web-server-fn | dashboard:web-seo-page) continue ;;
      website:dash-*) continue ;;
      react:web-create-* | react:web-server-fn | react:web-seo-page | react:dash-*) continue ;;
    esac
    case "$ARABIC" in
      *"${NEWLINE}K$TAB$skill$NEWLINE"*) add "frontend-kit:$skill" ;;
      *) printf '%s' "$PROMPT" | grep -Eq "$regex" && add "frontend-kit:$skill" ;;
    esac
  done <"$TRIGGERS"
fi

# The project's own skills: words of the description that appear in the prompt.
for file in "$HOOK_ROOT"/.claude/skills/*/SKILL.md; do
  [ -f "$file" ] || continue
  [ "$COUNT" -ge "$MAX_SUGGESTIONS" ] && break
  name="$(basename "$(dirname "$file")")"
  hits=0
  case "$ARABIC" in
    *"${NEWLINE}N$TAB$name$TAB"*)
      hits="${ARABIC#*"${NEWLINE}N$TAB$name$TAB"}"
      hits="${hits%%"$NEWLINE"*}"
      ;;
  esac
  for word in $(sed -n 's/^description: *//p' "$file" | head -n1 | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '\n' | awk 'length($0) >= 5' | sort -u); do
    case "$PROMPT" in *"$word"*) hits=$((hits + 1)) ;; esac
  done
  [ "$hits" -ge 3 ] && add "$name"
done

SPEC_FILE="$HOME/.claude/skills/spec/SKILL.md"
PLAN_NOTE=""
MODE_NOTE=""
APPS_NOTE=""
if [ -n "$APPS_LINE" ] && [ -n "$FOUND" ]; then
  APPS_NOTE="This project has several apps: $APPS_LINE. Use the skill of the app the files belong to (web-* for a website app, dash-* for a dashboard app) and the rules scoped to that app."
fi
[ "$KIT_MODE" = refactor ] && MODE_NOTE="Refactor mode is ON: only the approved phase of docs/refactor-plan.md may restructure code; behaviour stays frozen (/frontend-kit:refactor-mode)."
if [ "$(hook_field '.permission_mode')" = plan ] && [ -f "$SPEC_FILE" ]; then
  PLAN_NOTE="Plan mode is on. Read $SPEC_FILE and follow its spec workflow (questions, spec, wait for OK, then plan) before you write the plan."
fi

[ -z "$FOUND$PLAN_NOTE$MODE_NOTE" ] && exit 0
CONTEXT=""
[ -n "$FOUND" ] && CONTEXT="Skills that may fit this prompt (checked against the project's skills):
$FOUND
Open the matching skill with the Skill tool before you start and follow it. If the prompt is only a question or none of them fits the actual task, ignore this list."
[ -n "$PLAN_NOTE" ] && CONTEXT="${CONTEXT:+$CONTEXT

}$PLAN_NOTE"
[ -n "$MODE_NOTE" ] && CONTEXT="${CONTEXT:+$CONTEXT

}$MODE_NOTE"
[ -n "$APPS_NOTE" ] && CONTEXT="${CONTEXT:+$CONTEXT

}$APPS_NOTE"
hook_context UserPromptSubmit "$CONTEXT"
exit 0
