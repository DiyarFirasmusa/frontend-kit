#!/bin/bash
# UserPromptSubmit: maps the user's short, often misspelled phrasing to what they mean, as context
# for Claude. Never blocks and never rewrites the prompt. Patterns come from real short prompts.
set -u
. "$(dirname "$0")/lib.sh"

hook_read_input
PROMPT="$(hook_field '.prompt' | tr '[:upper:]' '[:lower:]')"
[ -z "$PROMPT" ] && exit 0
SECRET_MSG=""
HINTS=""
# A hook prints one JSON object or none: the warning and the hints go out together, at every exit.
finish() {
  [ -n "$SECRET_MSG$HINTS" ] || exit 0
  jq -n --arg warning "$SECRET_MSG" --arg hints "$HINTS" \
    '(if $warning == "" then {} else {systemMessage: $warning} end)
     + (if $hints == "" then {} else {hookSpecificOutput: {hookEventName: "UserPromptSubmit",
         additionalContext: ("How to read this prompt (from the user\u0027s usual phrasing):\n" + $hints)}} end)'
  exit 0
}
# A credential pasted into a prompt is stored in the transcript and sent to the model. Say so to the user (never
# blocks, never echoes the value). {"guards": {"promptSecrets": false}} turns it off.
if kit_switch promptSecrets && [ -n "$(printf '%s' "$HOOK_INPUT" | jq -r '.prompt // ""' | kit_token_hit)" ]; then
  SECRET_MSG="frontend-kit: your prompt looks like it contains a real API key or private key. It is now in this session and its transcript: revoke it at the provider and use a new one, and keep secrets in .env (which Claude never reads)."
fi
# Hints are for short commands the user types ("commit", "link pr", "check all"). Long text — pasted
# documents, agent reports, task descriptions — mentions these words in passing and must not trigger them.
case "$PROMPT" in
  *'<agent-message'*|*'subagent hand-back'*|*'<task-notification'*|*'<pasted_content'*) finish ;;
esac
[ "${#PROMPT}" -gt 280 ] && finish
# The prompt with surrounding spaces and trailing punctuation removed, for whole-prompt matches.
BARE="$(printf '%s' "$PROMPT" | tr '\n' ' ' | sed -E 's/^[[:space:]]+//; s/[[:space:].!?]+$//')"

hint() { HINTS="${HINTS:+$HINTS
}- $1"; }
matches() { printf '%s' "$2" | grep -Eq "$1"; }

COMMIT_WORD='(c+o+m+i+t+|comit|commt|comitt)'
PUSH_WORD='(push|psuh|puhs)'
if matches "^((yes|yeah|yep|ok|okay|y|sure|go)[ ,]+)*(${COMMIT_WORD}|${PUSH_WORD})([ ,]+(and|&|\+)?[ ,]*(${COMMIT_WORD}|${PUSH_WORD}))*([ ,]+(all|all ?(think|thing|things)|it|now|them))*\$" "$BARE"; then
  hint "The user approves committing and pushing the current task's changes (\"commit\" alone means commit + push). Use the commit-push skill now, then print the compare link."
fi

if matches '^(contine|continue|contiue|contien|continw|contnue|contenue|cont|go on|keep going|go|next|carry on)$' "$BARE"; then
  hint "\"Continue\": resume the last unfinished step of the current plan or todo list. Don't restart, re-plan or re-ask what was already answered."
fi

if matches '(link ?(off? |of |for |the )?pr|pr ?link|compare link|link to (open|make) (the )?pr|^link$)' "$BARE"; then
  hint "\"Link PR\": print the GitHub compare link for the current branch (pr-link skill). The user opens the PR by hand; never run gh pr create."
fi

if matches '(trello\.com/c/|atlassian\.net/browse/|github\.com/[^ ]+/issues/[0-9]+)' "$PROMPT"; then
  hint "A ticket link (Trello, Jira, GitHub issue): start the task skill (read it, branch from origin/$KIT_DEFAULT_BRANCH, implement, verify, then ask before commit/push)."
fi

if matches 'figma\.com/(design|file|proto|make|board)/' "$PROMPT"; then
  hint "A Figma link: the UI must match it exactly (figma-match skill: design context + screenshot, project tokens, phone + desktop, ar + en, no layout shift)."
fi

if matches '^(why|ليش|لماذا|ليه|شنو سبب)( |$)' "$BARE"; then
  hint "This is a question: answer and explain (explain skill). Don't edit files unless the user also asks for a change."
fi

if matches '(che?a?c?k (in )?all|\ball (the )?(places|placses|pages|page|screens|files)\b|every ?where|in all (places|placses|pages))' "$BARE"; then
  hint "\"All\" means every occurrence repo-wide: find them all with grep, fix each, and prove it with a final grep (fix-everywhere skill)."
fi

finish
