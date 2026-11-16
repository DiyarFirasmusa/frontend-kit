# Shared helpers for the project's Claude Code hooks. Sourced, never run.
# Bash 3.2 compatible (macOS /bin/bash): no associative arrays, no ${var,,}, no mapfile.
#
# Guards (PreToolUse scripts that set HOOK_KIND=guard before sourcing this file) must fail CLOSED:
# Claude Code blocks a tool call only on exit 2 or a JSON "deny"; exit 1 or a crash lets it through.
# So a guard without jq refuses everything, and any unexpected exit (an unbound variable under
# set -u, a failed command) is turned into exit 2. Every other hook degrades to a silent exit 0.

if [ "${HOOK_KIND:-}" = guard ]; then
  # exit inside an EXIT trap replaces the exit status: anything but 0 or 2 becomes a block.
  trap 'hook_status=$?; if [ "$hook_status" -ne 0 ] && [ "$hook_status" -ne 2 ]; then echo "Blocked: the ${0##*/} hook failed (exit $hook_status), so this call is refused. Run bash ${CLAUDE_PLUGIN_ROOT:-<plugin>}/scripts/test-hooks.sh to find the cause." >&2; exit 2; fi' EXIT
fi

if ! command -v jq >/dev/null 2>&1; then
  if [ "${HOOK_KIND:-}" = guard ]; then
    echo "Claude hooks need jq (brew install jq)" >&2
    exit 2
  fi
  exit 0
fi

# The project root. Claude Code exports CLAUDE_PROJECT_DIR to hooks; tests set it too.
HOOK_ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
HOOK_STATE_DIR="$HOOK_ROOT/.claude/state"

# The project's own settings for these hooks, written by /frontend-kit:setup. Every value has a safe
# default, so a project without the file still gets the git guards (main/master) and the quality gate.
KIT_CONFIG="$HOOK_ROOT/.claude/frontend-kit.json"

# kit_get '.commands.typecheck' 'npm run typecheck' → the configured value, else the default.
kit_get() {
  local value=""
  [ -f "$KIT_CONFIG" ] && value="$(jq -r "$1 // empty" "$KIT_CONFIG" 2>/dev/null)"
  printf '%s' "${value:-$2}"
}

# kit_list '.liveHosts' → one value per line (empty when unset).
kit_list() {
  [ -f "$KIT_CONFIG" ] && jq -r "($1 // [])[]" "$KIT_CONFIG" 2>/dev/null
}

# a|b|c from a list, regex-escaped (dots and the like), or the given fallback.
kit_alternation() {
  local joined
  joined="$(kit_list "$1" | sed 's/[][\.^$*+?(){}|]/\\&/g' | paste -sd'|' -)"
  printf '%s' "${joined:-$2}"
}

# The source folders the gates watch: .srcDirs (list) or .srcDir (string) in frontend-kit.json, default src.
# Any layout works (src, app, pages, packages/web/src): list the folders once and every hook follows.
KIT_SRC_DIRS="$(kit_list '.srcDirs')"
[ -n "$KIT_SRC_DIRS" ] || KIT_SRC_DIRS="$(kit_get '.srcDir' 'src')"

# The first of these tools installed in node_modules/.bin (name only), e.g. kit_tool oxlint eslint biome.
kit_tool() {
  local tool
  for tool in "$@"; do
    [ -x "$HOOK_ROOT/node_modules/.bin/$tool" ] && { printf '%s' "$tool"; return 0; }
  done
  return 1
}

# True when the project-relative path lies under one of the source folders.
kit_in_src() {
  local dir
  while IFS= read -r dir; do
    [ -n "$dir" ] && case "$1" in "${dir%/}"/*) return 0 ;; esac
  done <<<"$KIT_SRC_DIRS"
  return 1
}

KIT_PROJECT_NAME="$(kit_get '.projectName' 'this project')"
# new | existing | refactor: how the project is being worked on (asked by /frontend-kit:setup).
KIT_MODE="$(kit_get '.mode' 'existing')"
KIT_DEFAULT_BRANCH="$(kit_get '.defaultBranch' 'main')"
KIT_GITHUB_REPO="$(kit_get '.githubRepo' '')"
KIT_UAT_HOST="$(kit_get '.uatHost' 'the test environment')"
KIT_DEV_PORT="$(kit_get '.devPort' '5173')"
KIT_PROTECTED_BRANCHES="$(kit_list '.protectedBranches' | paste -sd'/' -)"
KIT_PROTECTED_BRANCHES="${KIT_PROTECTED_BRANCHES:-main/master}"
KIT_LIVE_HOSTS="$(kit_list '.liveHosts' | paste -sd',' - | sed 's/,/, /g')"

# The compare link printed instead of opening a PR.
kit_compare_link() {
  if [ -n "$KIT_GITHUB_REPO" ]; then
    printf 'https://github.com/%s/compare/%s...<branch>?expand=1' "$KIT_GITHUB_REPO" "$KIT_DEFAULT_BRANCH"
  else
    printf 'the GitHub compare link for the branch'
  fi
}

# Reads the whole hook input once; every helper below reads from HOOK_INPUT.
hook_read_input() {
  HOOK_INPUT="$(cat)"
}

# hook_field '.tool_input.command' → the value, or empty when absent.
hook_field() {
  printf '%s' "$HOOK_INPUT" | jq -r "$1 // empty" 2>/dev/null
}

# Denies a PreToolUse call with a reason Claude reads. Always exits: with the JSON deny (exit 0), or,
# when the JSON can't be built, with the reason on stderr and exit 2 (which blocks just the same).
hook_deny() {
  local json
  json="$(jq -n --arg reason "$1" \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $reason}}' 2>/dev/null)"
  if [ $? -eq 0 ] && [ -n "$json" ]; then
    printf '%s\n' "$json"
    exit 0
  fi
  printf '%s\n' "$1" >&2
  exit 2
}

# Adds context for Claude on events that accept it (UserPromptSubmit, PostToolUse, SessionStart).
hook_context() {
  jq -n --arg event "$1" --arg context "$2" \
    '{hookSpecificOutput: {hookEventName: $event, additionalContext: $context}}'
}

# The project-relative form of an absolute path, or empty when it lies outside the project.
hook_rel_path() {
  case "$1" in
    "$HOOK_ROOT"/*) printf '%s' "${1#"$HOOK_ROOT"/}" ;;
    /*) printf '' ;;
    *) printf '%s' "${1#./}" ;;
  esac
}

# Lexically normalises a path: resolves . and .. (no symlinks); a relative path is taken from the
# project root. src/../.github/x → <root>/.github/x
hook_normalise_path() {
  local path="$1" out="" part
  case "$path" in
    /*) ;;
    *) path="$HOOK_ROOT/$path" ;;
  esac
  set -f
  local IFS='/'
  for part in $path; do
    case "$part" in
      "" | .) ;;
      ..) out="${out%/*}" ;;
      *) out="$out/$part" ;;
    esac
  done
  printf '%s' "${out:-/}"
}

# A fingerprint of every uncommitted change under src/ (tracked diff + untracked files).
# Equal fingerprints mean nothing in src/ changed between two moments.
hook_src_fingerprint() {
  local dirs
  dirs="$(printf '%s\n' "$KIT_SRC_DIRS" | tr '\n' ' ')"
  {
    # shellcheck disable=SC2086
    git -C "$HOOK_ROOT" diff HEAD -- $dirs 2>/dev/null
    # shellcheck disable=SC2086
    git -C "$HOOK_ROOT" ls-files --others --exclude-standard -z -- $dirs 2>/dev/null |
      while IFS= read -r -d '' file; do
        printf '%s\n' "$file"
        cat "$HOOK_ROOT/$file" 2>/dev/null
      done
  } | shasum | cut -c1-16
}

# Changed src/ files (tracked edits + untracked), one project-relative path per line.
hook_changed_src_files() {
  local dirs
  dirs="$(printf '%s\n' "$KIT_SRC_DIRS" | tr '\n' ' ')"
  {
    # shellcheck disable=SC2086
    git -C "$HOOK_ROOT" diff --name-only --diff-filter=ACMR HEAD -- $dirs 2>/dev/null
    # shellcheck disable=SC2086
    git -C "$HOOK_ROOT" ls-files --others --exclude-standard -- $dirs 2>/dev/null
  } | sort -u
}
