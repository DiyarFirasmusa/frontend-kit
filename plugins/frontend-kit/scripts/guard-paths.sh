#!/bin/bash
# PreToolUse(Edit|Write|MultiEdit|NotebookEdit|Read): keeps Claude's file tools off files it must not touch.
#
#   read + write: .env and .env.* (secrets) — .env.example stays readable and editable
#   write only:   .git/ (at any depth), lockfiles (the package manager owns them), the package.json "build" script,
#                 any .js/.jsx/.mjs/.cjs file under the source folders of a TypeScript project (allowJs lifts it),
#                 and from .claude/frontend-kit.json: protectedPaths (deploy config, by default
#                 .github/ deploy/ server/) and generatedPaths (generated files, e.g. the route tree)
#
# Names are compared without regard to case (on macOS .ENV is .env), and a link is checked both as the path
# given and as the file it points at.
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

lower() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]'; }

# The file behind links: follows a linked file, and the linked folders of the part of the path that exists.
physical_path() {
  local path="$1" target parent rest="" hops=0
  while [ -L "$path" ] && [ "$hops" -lt 20 ]; do
    target="$(readlink "$path")" || break
    case "$target" in
      /*) path="$target" ;;
      *) path="${path%/*}/$target" ;;
    esac
    hops=$((hops + 1))
  done
  parent="$path"
  while [ -n "$parent" ] && [ ! -d "$parent" ]; do
    rest="/${parent##*/}$rest"
    parent="${parent%/*}"
  done
  parent="$(cd "${parent:-/}" 2>/dev/null && pwd -P)" || { printf '%s' "$1"; return 0; }
  printf '%s%s' "${parent%/}" "$rest"
}

# rel_under <root> <path> → the lower-case path below root, empty when it isn't below it.
rel_under() {
  local root path
  root="$(lower "${1%/}")"
  path="$(lower "$2")"
  case "$path" in "$root"/*) printf '%s' "${path:${#root}+1}" ;; esac
}

REAL="$(physical_path "$FILE")"
for path in "$FILE" "$REAL"; do
  base="${path##*/}"
  case "$(lower "$base")" in
    .env.example) ;;
    .env | .env.*)
      hook_deny "Blocked: $base holds secrets and stays out of Claude's context. Use .env.example for names and defaults, and ask the user for any value you need." ;;
  esac
done

[ "$TOOL" = "Read" ] && exit 0

REL="$(rel_under "$HOOK_ROOT" "$FILE")"
REAL_REL="$(rel_under "$(physical_path "$HOOK_ROOT")" "$REAL")"
# Files outside the project (the scratchpad, ~/.claude) are not this repo's business.
[ -z "$REL$REAL_REL" ] && exit 0
[ -n "$REL" ] || REL="$REAL_REL"
[ -n "$REAL_REL" ] || REAL_REL="$REL"

# Globs from the project config ("deploy/**" → deploy/*); bash `case` patterns match across slashes.
kit_matches() {
  local pattern rel="$1"
  while IFS= read -r pattern; do
    [ -z "$pattern" ] && continue
    pattern="${pattern%%/\*\*}"
    case "$pattern" in .env | .env.*) continue ;; esac
    # shellcheck disable=SC2254
    case "$rel" in $pattern | $pattern/*) return 0 ;; esac
  done
  return 1
}
PROTECTED="$(kit_list '.protectedPaths' | tr '[:upper:]' '[:lower:]')"
[ -n "$PROTECTED" ] || PROTECTED="$(printf '.github/**\ndeploy/**\nserver/**')"
GENERATED="$(kit_list '.generatedPaths' | tr '[:upper:]' '[:lower:]')"

check_write() {
  local rel="$1" base="${1##*/}" in_src=""
  if printf '%s\n' "$PROTECTED" | kit_matches "$rel"; then
    hook_deny "Blocked: $rel is deploy config owned outside this task (protectedPaths in .claude/frontend-kit.json). Tell the user what should change instead."
  fi
  if printf '%s\n' "$GENERATED" | kit_matches "$rel"; then
    hook_deny "Blocked: $rel is generated (generatedPaths in .claude/frontend-kit.json). Change its source and run the generator instead."
  fi
  case "/$rel" in
    */.git/* | */.git)
      hook_deny "Blocked: never edit files inside .git/. Tell the user the exact change and let them make it." ;;
  esac
  case "$base" in
    package-lock.json | pnpm-lock.yaml | yarn.lock | bun.lock | bun.lockb)
      hook_deny "Blocked: $base is written by the package manager. Change package.json and ask the user to run the install." ;;
  esac
  # A TypeScript project keeps its source folders TypeScript only; "allowJs": true in .claude/frontend-kit.json
  # (or no tsconfig.json at all) lifts this for JavaScript projects.
  case "$base" in
    *.js | *.jsx | *.mjs | *.cjs)
      shopt -s nocasematch
      kit_in_src "$rel" && in_src=1
      shopt -u nocasematch
      if [ -n "$in_src" ] && [ -f "$HOOK_ROOT/tsconfig.json" ] && [ "$(kit_get '.allowJs' false)" != true ]; then
        hook_deny "Blocked: every source file is .ts or .tsx here. Name it ${base%.*}.ts (or .tsx for JSX)."
      fi
      ;;
  esac
}
check_write "$REL"
[ "$REAL_REL" = "$REL" ] || check_write "$REAL_REL"

# The package.json "build" script is what CI and the deploy run; an existing one is never changed from here.
# A project that has none yet may get one (a new app needs a build script to exist at all).
if [ "$REL" = "package.json" ] || [ "$REAL_REL" = "package.json" ]; then
  build_lines() { grep -E '"build"[[:space:]]*:' | sed -E 's/[[:space:]]+//g; s/,$//'; }
  case "$TOOL" in
    Write)
      CURRENT="$(jq -r '.scripts.build // ""' "$FILE" 2>/dev/null)"
      NEXT="$(hook_field '.tool_input.content' | jq -r '.scripts.build // ""' 2>/dev/null)"
      [ -n "$CURRENT" ] && [ "$CURRENT" != "$NEXT" ] &&
        hook_deny "Blocked: the package.json \"build\" script is deploy config. Keep it exactly as it is: $CURRENT"
      ;;
    Edit | MultiEdit)
      [ -z "$(jq -r '.scripts.build // ""' "$FILE" 2>/dev/null)" ] && exit 0
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
