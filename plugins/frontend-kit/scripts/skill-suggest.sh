#!/bin/bash
# UserPromptSubmit: checks the skills we have against the prompt and tells Claude which ones fit,
# before it starts. Two sources:
#   1. the kit's own skills, matched by the trigger regexes in skill-triggers.tsv (first 3 win), filtered
#      to the project's profile (a dashboard never gets web-* skills, a website never gets dash-*);
#   2. the project's own skills in .claude/skills/*, matched by description words (>= 3 distinct words).
# In plan mode (permission_mode "plan") it also points Claude at the personal /spec workflow,
# ~/.claude/skills/spec/SKILL.md, when that file exists. That skill is user-only (disable-model-invocation),
# so Claude reads the file instead of invoking it.
# Context only: it never blocks and never rewrites the prompt. Off with {"hooks": {"skillSuggest": false}}
# in .claude/frontend-kit.json.
set -u
. "$(dirname "$0")/lib.sh"

MAX_SUGGESTIONS=3

hook_read_input
[ -f "$KIT_CONFIG" ] && [ "$(jq -r '.hooks.skillSuggest' "$KIT_CONFIG" 2>/dev/null)" = false ] && exit 0

PROMPT="$(hook_field '.prompt' | tr '[:upper:]' '[:lower:]' | tr '\n' ' ')"
[ "${#PROMPT}" -lt 6 ] && exit 0
# Slash commands already name their skill; agent hand-backs and notifications aren't the user's task.
case "$PROMPT" in
  '/'* | *'<agent-message'* | *'<task-notification'* | *'subagent hand-back'*) exit 0 ;;
esac

PROFILE="$(kit_get '.profile' '')"
TRIGGERS="$(dirname "$0")/skill-triggers.tsv"
FOUND=""
COUNT=0

add() {
  FOUND="${FOUND:+$FOUND
}- $1"
  COUNT=$((COUNT + 1))
}

if [ -f "$TRIGGERS" ]; then
  while IFS="$(printf '\t')" read -r skill regex; do
    [ "$COUNT" -ge "$MAX_SUGGESTIONS" ] && break
    case "$skill" in '' | '#'*) continue ;; esac
    case "$PROFILE:$skill" in
      dashboard:web-* | website:dash-* | react:web-* | react:dash-*) continue ;;
    esac
    printf '%s' "$PROMPT" | grep -Eq "$regex" && add "frontend-kit:$skill"
  done <"$TRIGGERS"
fi

# The project's own skills: words of the description that appear in the prompt.
for file in "$HOOK_ROOT"/.claude/skills/*/SKILL.md; do
  [ -f "$file" ] || continue
  [ "$COUNT" -ge "$MAX_SUGGESTIONS" ] && break
  name="$(basename "$(dirname "$file")")"
  hits=0
  for word in $(sed -n 's/^description: *//p' "$file" | head -n1 | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '\n' | awk 'length($0) >= 5' | sort -u); do
    case "$PROMPT" in *"$word"*) hits=$((hits + 1)) ;; esac
  done
  [ "$hits" -ge 3 ] && add "$name"
done

SPEC_FILE="$HOME/.claude/skills/spec/SKILL.md"
PLAN_NOTE=""
MODE_NOTE=""
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
hook_context UserPromptSubmit "$CONTEXT"
exit 0
