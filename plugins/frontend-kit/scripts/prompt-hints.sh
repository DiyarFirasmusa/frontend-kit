#!/bin/bash
# UserPromptSubmit: maps the user's short, often misspelled phrasing to what they mean, as context
# for Claude. Never blocks and never rewrites the prompt. Patterns come from ~5,800 of their prompts.
set -u
. "$(dirname "$0")/lib.sh"

hook_read_input
PROMPT="$(hook_field '.prompt' | tr '[:upper:]' '[:lower:]')"
[ -z "$PROMPT" ] && exit 0
# Hints are for short commands the user types ("commit", "link pr", "check all"). Long text — pasted
# documents, agent reports, task descriptions — mentions these words in passing and must not trigger them.
case "$PROMPT" in
  *'<agent-message'*|*'subagent hand-back'*|*'<task-notification'*|*'<pasted_content'*) exit 0 ;;
esac
[ "${#PROMPT}" -gt 280 ] && exit 0
# The prompt with surrounding spaces and trailing punctuation removed, for whole-prompt matches.
BARE="$(printf '%s' "$PROMPT" | tr '\n' ' ' | sed -E 's/^[[:space:]]+//; s/[[:space:].!?]+$//')"

HINTS=""
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

[ -z "$HINTS" ] && exit 0
hook_context UserPromptSubmit "How to read this prompt (from the user's usual phrasing):
$HINTS"
exit 0
