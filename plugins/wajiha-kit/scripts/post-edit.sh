#!/bin/bash
# PostToolUse(Edit|Write|MultiEdit): formats and lints the file Claude just changed.
#
#   source and style files, locale JSON    → the project's formatter writes its formatting
#                                            (oxfmt, prettier or biome, whichever is installed)
#   ts, js, vue, svelte, astro             → the project's linter (oxlint, eslint or biome); errors go back to
#                                            Claude (exit 2), oxlint warnings as context
#   <srcDir>/**/locales/*.json             → the i18n validator; violations go back to Claude (exit 2)
# Which files: srcDirs / srcDir in .claude/wajiha-kit.json, else the code wherever it is (kit_watched). {"commands": {"formatFile": "...",
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

# An edit of what the checks accept is named, wherever the file is (a note, never a block).
CONFIG_NOTE=""
case "/$REL" in
  */node_modules/* | */dist/*) ;;
  *)
    case "${REL##*/}" in
      tsconfig*.json | eslint.config.* | .eslintrc* | .oxlintrc* | oxlint.config.* | biome.json | biome.jsonc | vitest.config.* | jest.config.* | playwright.config.*)
        kit_switch codeChecks &&
          CONFIG_NOTE="$REL changes what the checks accept (types, lint or tests). Say why in your report; never loosen a check to get it green." ;;
    esac
    ;;
esac
note_and_exit() {
  [ -n "$CONFIG_NOTE" ] && hook_context PostToolUse "$CONFIG_NOTE"
  exit 0
}

kit_watched "$REL" || note_and_exit
case "$REL" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.mts | *.cts | *.vue | *.svelte | *.astro | *.html | *.css | *.scss | *.sass | *.less | *.json) ;;
  *) note_and_exit ;;
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
  *.vue | *.svelte | *.astro)
    # biome fails on a file type it is not set up for: only a configured command lints these then.
    [ "$LINTER" = biome ] && LINTER=""
    ;;
esac
case "$REL" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.mts | *.cts | *.vue | *.svelte | *.astro)
    if [ -n "$LINT_CMD" ]; then
      LINT="$(sh -c "$LINT_CMD \"\$0\"" "$REL" 2>&1)" || PROBLEMS="lint errors in $REL (fix them; don't silence them):
$(printf '%s\n' "$LINT" | grep -vE '^\s*$' | tail -n 30)"
    elif [ "$LINTER" = oxlint ]; then
      LINT="$("$BIN/oxlint" --format=unix "$REL" 2>&1)"
      LINT_STATUS=$?
      # An ancestor .gitignore that ignores the whole project (nested apps, playgrounds) makes oxlint find no
      # file to lint: that is "nothing checked", not a failure.
      printf '%s' "$LINT" | grep -q 'No files found to lint' && LINT_STATUS=0
      # The path is text, not a pattern: $id.tsx and [id].tsx are ordinary route file names.
      FINDINGS="$(printf '%s\n' "$LINT" | FINDINGS_PREFIX="$REL:" awk 'index($0, ENVIRON["FINDINGS_PREFIX"]) == 1 && substr($0, length(ENVIRON["FINDINGS_PREFIX"]) + 1) ~ /^[0-9]+:[0-9]+:/' | head -n 30)"
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
      esac || {
        # ESLint installed but never configured checked nothing: that is the project's setup, not this edit's error.
        case "$LINT" in
          *"couldn't find an eslint.config"* | *"couldn't find a configuration file"*)
            WARNINGS="eslint has no config in this project, so $REL was not linted. Don't add one unless the user asks."
            ;;
          *)
            PROBLEMS="$LINTER errors in $REL (fix them; don't silence them):
$(printf '%s\n' "$LINT" | grep -vE '^\s*$' | tail -n 30)"
            ;;
        esac
      }
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
  *.ts | *.tsx | *.mts | *.cts | *.vue | *.svelte | *.astro)
    ANY_HITS="$(grep -nE '(:[[:space:]]*any\b|<any>|\bas any\b|\bas unknown as\b|@ts-ignore|@ts-expect-error)' "$REL" 2>/dev/null | grep -vE '^[0-9]+:[[:space:]]*(//|\*)' | head -n 8)"
    if [ -n "$ANY_HITS" ]; then
      WARNINGS="${WARNINGS:+$WARNINGS

}Hard rule: no any, no casts to silence the compiler, no @ts-ignore. Fix these in $REL (use unknown and narrow, or fix the type):
$ANY_HITS"
    fi
    ;;
esac

# What a coding agent does to get a green check without fixing the cause. Context only, never a block;
# {"guards": {"codeChecks": false}} in .claude/wajiha-kit.json turns these notes off.
if kit_switch codeChecks; then
  case "$REL" in
    *.test.* | *.spec.* | */__tests__/*)
      MARKER_RE='\b(describe|it|test)\.(only|skip)\b|(^|[^.A-Za-z0-9_$])(fdescribe|fit|xit|xdescribe|xtest)\(|\bit\.todo\b'
      TEST_HITS="$(grep -nE "$MARKER_RE" "$REL" 2>/dev/null | head -n 5)"
      # An edit that adds none is not blamed for the markers that were already there.
      if [ -n "$TEST_HITS" ] && printf '%s' "$HOOK_INPUT" | jq -e '(.tool_input.old_string != null) or (.tool_input.edits != null)' >/dev/null 2>&1; then
        markers() { printf '%s' "$HOOK_INPUT" | jq -r "[.tool_input | .$1?, (.edits? | arrays | .[] | .$1?)] | .[] | strings" | grep -cE "$MARKER_RE"; }
        [ "$(markers new_string)" -gt "$(markers old_string)" ] || TEST_HITS=""
      fi
      if [ -n "$TEST_HITS" ]; then
        WARNINGS="${WARNINGS:+$WARNINGS

}Hard rule: no skipped or focused tests (.only, .skip, xit). A .only makes the gate pass on one test; a .skip hides a failure. Fix the cause in $REL:
$TEST_HITS"
      fi
      ;;
  esac
  case "$REL" in
    *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.mts | *.cts | *.vue | *.svelte | *.astro | *.html)
      SUPPRESS_HITS="$(grep -nE '(@ts-nocheck|eslint-disable|oxlint-disable|biome-ignore)' "$REL" 2>/dev/null | head -n 5)"
      if [ -n "$SUPPRESS_HITS" ]; then
        WARNINGS="${WARNINGS:+$WARNINGS

}Lint or type suppressions in $REL hide the finding instead of fixing it. Fix the cause, or keep the comment only with a reason the reviewer can accept:
$SUPPRESS_HITS"
      fi
      SINK_HITS="$(grep -nE '(dangerouslySetInnerHTML|\.(inner|outer)HTML[[:space:]]*=([^=]|$)|insertAdjacentHTML\(|v-html=|\{@html |bypassSecurityTrust|(^|[^.$A-Za-z0-9_])eval\(|new Function\(|document\.write\()' "$REL" 2>/dev/null | grep -vE '^[0-9]+:[[:space:]]*(//|\*)' | head -n 5)"
      if [ -n "$SINK_HITS" ]; then
        WARNINGS="${WARNINGS:+$WARNINGS

}Unsafe sink in $REL: never feed it user, URL or API text unsanitised (XSS). Prefer the framework's plain text binding, or sanitise with a vetted library first:
$SINK_HITS"
      fi
      PUBLIC_HITS="$(grep -nE '(VITE_|NEXT_PUBLIC_|PUBLIC_|EXPO_PUBLIC_|GATSBY_|NUXT_PUBLIC_|REACT_APP_)[A-Z0-9_]*(SECRET|PRIVATE_KEY|PASSWORD|SERVICE_ROLE)' "$REL" 2>/dev/null | head -n 3)"
      if [ -n "$PUBLIC_HITS" ]; then
        WARNINGS="${WARNINGS:+$WARNINGS

}Variables with these prefixes are copied into the browser bundle, so a secret named this way is public. Keep it server-side without the prefix:
$PUBLIC_HITS"
      fi
      ;;
  esac
  CONFLICT_HITS="$(grep -nE '^(<<<<<<< |>>>>>>> )' "$REL" 2>/dev/null | head -n 3)"
  [ -n "$CONFLICT_HITS" ] && WARNINGS="${WARNINGS:+$WARNINGS

}Merge conflict markers are left in $REL. Resolve them:
$CONFLICT_HITS"
fi

[ -n "$CONFIG_NOTE" ] && WARNINGS="${WARNINGS:+$WARNINGS

}$CONFIG_NOTE"
if [ -n "$PROBLEMS" ]; then
  printf '%s\n' "$PROBLEMS" >&2
  # Exit 2 shows stderr alone: the notes would be lost with a lint error beside them.
  [ -n "$WARNINGS" ] && printf '\n%s\n' "$WARNINGS" >&2
  exit 2
fi
[ -n "$WARNINGS" ] && hook_context PostToolUse "$WARNINGS"
exit 0
