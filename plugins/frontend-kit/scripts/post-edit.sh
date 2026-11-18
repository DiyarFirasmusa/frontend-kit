#!/bin/bash
# PostToolUse(Edit|Write|MultiEdit): formats and lints the file Claude just changed.
#
#   <srcDir>/**/*.{ts,tsx,js,jsx,css,json} → the project's formatter writes its formatting
#                                            (oxfmt, prettier or biome, whichever is installed)
#   <srcDir>/**/*.{ts,tsx,js,jsx}          → the project's linter (oxlint, eslint or biome); errors go back to
#                                            Claude (exit 2), oxlint warnings as context
#   <srcDir>/**/locales/*.json             → the i18n validator; violations go back to Claude (exit 2)
# <srcDir> is srcDirs / srcDir in .claude/frontend-kit.json (default src). {"commands": {"formatFile": "...",
# "lintFile": "..."}} replaces the detection; the file path is appended to the command.
#
# PostToolUse can't undo the edit: exit 2 only puts stderr in front of Claude so it fixes the problem.
set -u
. "$(dirname "$0")/lib.sh"

hook_read_input
FILE="$(hook_field '.tool_input.file_path')"
[ -z "$FILE" ] && exit 0
REL="$(hook_rel_path "$FILE")"
[ -f "$HOOK_ROOT/$REL" ] || exit 0

kit_in_src "$REL" || exit 0
case "$REL" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.css | *.json) ;;
  *) exit 0 ;;
esac

# Remember the src/ files the MAIN session edited (subagent hook input carries an agent_id), so the
# Stop gate can tell "my own unfinished work" from "a background agent is still mid-edit".
EDIT_AGENT="$(hook_field '.agent_id')"
EDIT_SESSION="$(hook_field '.session_id')"
if [ -z "$EDIT_AGENT" ] && [ -n "$EDIT_SESSION" ]; then
  mkdir -p "$HOOK_STATE_DIR/sessions" 2>/dev/null &&
    printf '%s\n' "$REL" >>"$HOOK_STATE_DIR/sessions/$EDIT_SESSION.main-edits" 2>/dev/null
fi

BIN="$HOOK_ROOT/node_modules/.bin"
cd "$HOOK_ROOT" || exit 0

FORMAT_CMD="$(kit_get '.commands.formatFile' '')"
if [ -n "$FORMAT_CMD" ]; then
  sh -c "$FORMAT_CMD \"\$0\"" "$REL" >/dev/null 2>&1
else
  case "$(kit_tool oxfmt prettier biome)" in
    oxfmt) "$BIN/oxfmt" --no-error-on-unmatched-pattern "$REL" >/dev/null 2>&1 ;;
    prettier) "$BIN/prettier" --write --ignore-unknown "$REL" >/dev/null 2>&1 ;;
    biome) "$BIN/biome" format --write --no-errors-on-unmatched "$REL" >/dev/null 2>&1 ;;
  esac
fi

PROBLEMS=""
WARNINGS=""

LINT_CMD="$(kit_get '.commands.lintFile' '')"
LINTER="$(kit_tool oxlint eslint biome)"
case "$REL" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs)
    if [ -n "$LINT_CMD" ]; then
      LINT="$(sh -c "$LINT_CMD \"\$0\"" "$REL" 2>&1)" || PROBLEMS="lint errors in $REL (fix them; don't silence them):
$(printf '%s\n' "$LINT" | grep -vE '^\s*$' | tail -n 30)"
    elif [ "$LINTER" = oxlint ]; then
      LINT="$("$BIN/oxlint" --format=unix "$REL" 2>&1)"
      LINT_STATUS=$?
      # An ancestor .gitignore that ignores the whole project (nested apps, playgrounds) makes oxlint find no
      # file to lint: that is "nothing checked", not a failure.
      printf '%s' "$LINT" | grep -q 'No files found to lint' && LINT_STATUS=0
      FINDINGS="$(printf '%s\n' "$LINT" | grep -E "^$REL:[0-9]+:[0-9]+:" | head -n 30)"
      if [ $LINT_STATUS -ne 0 ]; then
        PROBLEMS="oxlint errors in $REL (fix them; don't silence them):
$FINDINGS"
      elif [ -n "$FINDINGS" ]; then
        WARNINGS="oxlint warnings in $REL (fix the ones your change introduced):
$FINDINGS"
      fi
    elif [ -n "$LINTER" ]; then
      # eslint / biome: the exit status is the verdict (non-zero = errors); the output tail is what Claude fixes.
      case "$LINTER" in
        eslint) LINT="$("$BIN/eslint" "$REL" 2>&1)" ;;
        biome) LINT="$("$BIN/biome" lint "$REL" 2>&1)" ;;
      esac || PROBLEMS="$LINTER errors in $REL (fix them; don't silence them):
$(printf '%s\n' "$LINT" | grep -vE '^\s*$' | tail -n 30)"
    fi
    ;;
esac

case "$REL" in
  */locales/*.json | locales/*.json)
    I18N_CMD="$(kit_app_cmd "$(kit_app_of "$REL")" i18nValidate)"
    [ -n "$I18N_CMD" ] || I18N_CMD="$([ -f scripts/validate-i18n.ts ] && echo 'node scripts/validate-i18n.ts')"
    I18N_STATUS=0
    [ -n "$I18N_CMD" ] && { I18N="$(sh -c "$I18N_CMD" 2>&1)" || I18N_STATUS=$?; }
    if [ "$I18N_STATUS" -ne 0 ]; then
      I18N_TAIL="$(printf '%s\n' "$I18N" | grep -vE '^\s*$' | tail -n 30)"
      # ar and en are edited one after the other, so a key that exists in only one of them is expected midway.
      # The Stop gate still blocks if the pair is not whole at the end. Anything else is a real defect now.
      I18N_REAL="$(printf '%s\n' "$I18N" | grep -E '^error ' | grep -vE 'is in (ar|en)\.json but missing from (ar|en)\.json|needs both ar\.json and en\.json')"
      if [ -n "$I18N_REAL" ] || ! printf '%s\n' "$I18N" | grep -qE '^error '; then
        PROBLEMS="${PROBLEMS:+$PROBLEMS

}$I18N_CMD fails:
$I18N_TAIL"
      else
        WARNINGS="${WARNINGS:+$WARNINGS

}$I18N_CMD: ar and en differ right now (expected until you edit the other language; the Stop gate blocks if they still differ):
$I18N_TAIL"
      fi
    fi
    ;;
esac

# The kit's hard rule "no any, no casts, no ts-ignore" does not depend on the project's linter: say so right away.
case "$REL" in
  *.ts | *.tsx)
    ANY_HITS="$(grep -nE '(:[[:space:]]*any\b|<any>|\bas any\b|\bas unknown as\b|@ts-ignore|@ts-expect-error)' "$REL" 2>/dev/null | grep -vE '^[0-9]+:[[:space:]]*(//|\*)' | head -n 8)"
    if [ -n "$ANY_HITS" ]; then
      WARNINGS="${WARNINGS:+$WARNINGS

}Hard rule: no any, no casts to silence the compiler, no @ts-ignore. Fix these in $REL (use unknown and narrow, or fix the type):
$ANY_HITS"
    fi
    ;;
esac

if [ -n "$PROBLEMS" ]; then
  printf '%s\n' "$PROBLEMS" >&2
  exit 2
fi
[ -n "$WARNINGS" ] && hook_context PostToolUse "$WARNINGS"
exit 0
