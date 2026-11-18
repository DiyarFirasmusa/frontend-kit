#!/bin/bash
# PreToolUse(Edit|Write|MultiEdit|NotebookEdit|Read): keeps Claude's file tools off files it must not touch.
#
#   read + write: .env and .env.* (secrets) — .env.example stays readable and editable
#   write only:   .git/, lockfiles (the package manager owns them), the package.json "build" script,
#                 any .js/.jsx/.mjs/.cjs file under the source folders of a TypeScript project (allowJs lifts it),
#                 and from .claude/frontend-kit.json: protectedPaths (deploy config, by default
#                 .github/ deploy/ server/) and generatedPaths (generated files, e.g. the route tree)
set -u
# shellcheck disable=SC2034 # read by lib.sh
HOOK_KIND=guard # fail closed: see lib.sh
. "$(dirname "$0")/lib.sh"

hook_read_input
TOOL="$(hook_field '.tool_name')"
FILE="$(hook_field '.tool_input.file_path')"
[ -z "$FILE" ] && FILE="$(hook_field '.tool_input.notebook_path')"
[ -z "$FILE" ] && exit 0
# src/../.github/x must be checked as .github/x.
FILE="$(hook_normalise_path "$FILE")"

REL="$(hook_rel_path "$FILE")"
BASE="${FILE##*/}"

case "$BASE" in
  .env.example) ;;
  .env | .env.*)
    hook_deny "Blocked: $BASE holds secrets and stays out of Claude's context. Use .env.example for names and defaults, and ask the user for any value you need." ;;
esac

[ "$TOOL" = "Read" ] && exit 0
# Files outside the project (the scratchpad, ~/.claude) are not this repo's business.
[ -z "$REL" ] && exit 0

# Globs from the project config ("deploy/**" → deploy/*); bash `case` patterns match across slashes.
kit_matches() {
  local pattern
  while IFS= read -r pattern; do
    [ -z "$pattern" ] && continue
    pattern="${pattern%%/\*\*}"
    case "$pattern" in .env | .env.*) continue ;; esac
    # shellcheck disable=SC2254
    case "$REL" in $pattern | $pattern/*) return 0 ;; esac
  done
  return 1
}
PROTECTED="$(kit_list '.protectedPaths')"
[ -n "$PROTECTED" ] || PROTECTED="$(printf '.github/**\ndeploy/**\nserver/**')"
if printf '%s\n' "$PROTECTED" | kit_matches; then
  hook_deny "Blocked: $REL is deploy config owned outside this task (protectedPaths in .claude/frontend-kit.json). Tell the user what should change instead."
fi
if kit_list '.generatedPaths' | kit_matches; then
  hook_deny "Blocked: $REL is generated (generatedPaths in .claude/frontend-kit.json). Change its source and run the generator instead."
fi

case "$REL" in
  .git/*)
    hook_deny "Blocked: never edit files inside .git/. Tell the user the exact change and let them make it." ;;
  package-lock.json | */package-lock.json | pnpm-lock.yaml | */pnpm-lock.yaml | yarn.lock | */yarn.lock | bun.lock | */bun.lock | bun.lockb | */bun.lockb)
    hook_deny "Blocked: $BASE is written by the package manager. Change package.json and ask the user to run the install." ;;
esac
# A TypeScript project keeps its source folders TypeScript only; "allowJs": true in .claude/frontend-kit.json
# (or no tsconfig.json at all) lifts this for JavaScript projects.
if [ -f "$HOOK_ROOT/tsconfig.json" ] && [ "$(kit_get '.allowJs' false)" != true ] && kit_in_src "$REL"; then
  case "$REL" in
    *.js | *.jsx | *.mjs | *.cjs)
      hook_deny "Blocked: every source file is .ts or .tsx here. Name it ${BASE%.*}.ts (or .tsx for JSX)." ;;
  esac
fi

# The package.json "build" script is what CI and the deploy run; it is never changed from here.
if [ "$REL" = "package.json" ]; then
  build_lines() { grep -E '"build"[[:space:]]*:' | sed -E 's/[[:space:]]+//g; s/,$//'; }
  case "$TOOL" in
    Write)
      CURRENT="$(jq -r '.scripts.build // ""' "$FILE" 2>/dev/null)"
      NEXT="$(hook_field '.tool_input.content' | jq -r '.scripts.build // ""' 2>/dev/null)"
      [ "$CURRENT" != "$NEXT" ] &&
        hook_deny "Blocked: the package.json \"build\" script is deploy config. Keep it exactly as it is: $CURRENT"
      ;;
    Edit | MultiEdit)
      EDITS="$(printf '%s' "$HOOK_INPUT" | jq -c '(.tool_input.edits // [.tool_input]) | .[] | {old: (.old_string // ""), new: (.new_string // "")}')"
      while IFS= read -r edit; do
        [ -z "$edit" ] && continue
        OLD="$(printf '%s' "$edit" | jq -r '.old' | build_lines)"
        NEW="$(printf '%s' "$edit" | jq -r '.new' | build_lines)"
        [ "$OLD" != "$NEW" ] &&
          hook_deny "Blocked: the package.json \"build\" script is deploy config. Edit around it and leave that line unchanged."
      done <<<"$EDITS"
      ;;
  esac
fi

exit 0
