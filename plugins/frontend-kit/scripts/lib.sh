# shellcheck shell=bash disable=SC2034,SC2154
# (the KIT_* and HOOK_* variables are read by the scripts that source this file)
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
# A trailing slash would make every "inside the project" comparison below fail.
[ "${#HOOK_ROOT}" -gt 1 ] && HOOK_ROOT="${HOOK_ROOT%/}"
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

KIT_SRC_UNSET="" # 1 when no source folder is configured (set below)

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

# One jq call reads every value the hooks need on each run (a jq start costs ~8 ms on macOS, and ten of
# them were the main cost of a guard). Fields are separated by \036, list items by \037.
KIT_RAW_LISTS=""
if [ -f "$KIT_CONFIG" ]; then
  KIT_RAW_LISTS="$(jq -r '[(.srcDirs // [] | map(tostring) | join("\u001f")), (.srcDir // "" | tostring), (.projectName // "" | tostring),
    (.mode // "" | tostring), (.defaultBranch // "" | tostring), (.githubRepo // "" | tostring), (.uatHost // "" | tostring),
    (.devPort // "" | tostring), (.protectedBranches // [] | map(tostring) | join("\u001f")), (.liveHosts // [] | map(tostring) | join("\u001f"))] | join("\u001e")' "$KIT_CONFIG" 2>/dev/null)"
fi
IFS=$'\036' read -r RAW_SRC_DIRS RAW_SRC_DIR RAW_NAME RAW_MODE RAW_BRANCH RAW_REPO RAW_UAT RAW_PORT RAW_PROTECTED RAW_LIVE <<<"$KIT_RAW_LISTS"

# The source folders the gates watch: .srcDirs (list) or .srcDir (string) in frontend-kit.json, default src.
# Any layout works (src, app, pages, packages/web/src): list the folders once and every hook follows.
KIT_SRC_DIRS="$(printf '%s' "$RAW_SRC_DIRS" | tr '\037' '\n')"
[ -n "$KIT_SRC_DIRS" ] || KIT_SRC_DIRS="$RAW_SRC_DIR"
if [ -z "$KIT_SRC_DIRS" ]; then
  KIT_SRC_UNSET=1
  # Nothing configured: watch the folders that exist (Next.js and React Router keep code in app/, not src/).
  for dir in src app pages components lib; do
    [ -d "$HOOK_ROOT/$dir" ] && KIT_SRC_DIRS="${KIT_SRC_DIRS:+$KIT_SRC_DIRS
}$dir"
  done
  [ -n "$KIT_SRC_DIRS" ] || KIT_SRC_DIRS="src"
fi

# The first of these tools installed in node_modules/.bin (name only), e.g. kit_tool oxlint eslint biome.
kit_tool() {
  local tool
  for tool in "$@"; do
    [ -x "$HOOK_ROOT/node_modules/.bin/$tool" ] && { printf '%s' "$tool"; return 0; }
  done
  return 1
}

# Projects with several apps in one tree (a website and an admin under src/admin) list them in
# frontend-kit.json: "apps": [{"name": "site", "path": "src", "commands": {...}}, {"name": "admin", "path": "src/admin", ...}]
# The app of a file is the one with the longest "path" prefix; empty when the project has no apps.
kit_app_of() {
  [ -f "$KIT_CONFIG" ] || return 0
  jq -r --arg f "$1" '[.apps[]? | select(.path as $p | $f | startswith($p + "/"))] | sort_by(.path | length) | last | .name // empty' "$KIT_CONFIG" 2>/dev/null
}

# kit_app_cmd <app> <key> → commands.<key> of that app, else the project's own, else empty.
kit_app_cmd() {
  local value=""
  if [ -n "$1" ] && [ -f "$KIT_CONFIG" ]; then
    value="$(jq -r --arg a "$1" --arg k "$2" '.apps[]? | select(.name == $a) | .commands[$k] // empty' "$KIT_CONFIG" 2>/dev/null)"
  fi
  printf '%s' "${value:-$(kit_get ".commands.$2" '')}"
}

# The typecheck command: commands.typecheck, else the project's own `typecheck` script, else tsc. A solution-style
# tsconfig.json ("references", no files) is checked with `tsc -b`: `tsc --noEmit` on it checks nothing and passes.
# Tool names are bare: callers put node_modules/.bin on PATH.
kit_typecheck_cmd() {
  local configured
  configured="$(kit_get '.commands.typecheck' '')"
  [ -n "$configured" ] && { printf '%s' "$configured"; return 0; }
  if [ -f "$HOOK_ROOT/package.json" ] && jq -e '.scripts.typecheck' "$HOOK_ROOT/package.json" >/dev/null 2>&1; then
    printf '%s' 'npm run --silent typecheck'
    return 0
  fi
  # tsc can't read .vue or .svelte files: the stack's own checker does.
  if [ -f "$HOOK_ROOT/tsconfig.json" ]; then
    case "$(kit_tool vue-tsc svelte-check)" in
      vue-tsc)
        if grep -q '"references"' "$HOOK_ROOT/tsconfig.json"; then printf '%s' 'vue-tsc -b'; else printf '%s' 'vue-tsc --noEmit'; fi
        return 0
        ;;
      svelte-check) printf '%s' 'svelte-check --tsconfig ./tsconfig.json'; return 0 ;;
    esac
  fi
  [ -x "$HOOK_ROOT/node_modules/.bin/tsc" ] || return 0
  if grep -q '"references"' "$HOOK_ROOT/tsconfig.json" 2>/dev/null; then
    printf '%s' 'tsc -b'
  else
    printf '%s' 'tsc --noEmit -p tsconfig.json'
  fi
}

# kit_app_cwd <app> → the folder an app's commands run in (apps[].cwd, project-relative), empty = the project root.
kit_app_cwd() {
  [ -n "$1" ] && [ -f "$KIT_CONFIG" ] && jq -r --arg a "$1" '.apps[]? | select(.name == $a) | .cwd // empty' "$KIT_CONFIG" 2>/dev/null
  return 0
}

# True when the project-relative path lies under one of the source folders.
kit_in_src() {
  local dir
  while IFS= read -r dir; do
    [ -n "$dir" ] && case "$1" in "${dir%/}"/*) return 0 ;; esac
  done <<<"$KIT_SRC_DIRS"
  return 1
}

KIT_PROJECT_NAME="${RAW_NAME:-this project}"
# new | existing | refactor: how the project is being worked on (asked by /frontend-kit:setup).
KIT_MODE="${RAW_MODE:-existing}"
KIT_DEFAULT_BRANCH="${RAW_BRANCH:-main}"
KIT_GITHUB_REPO="$RAW_REPO"
KIT_UAT_HOST="${RAW_UAT:-the test environment}"
KIT_DEV_PORT="${RAW_PORT:-5173}"
KIT_PROTECTED_BRANCHES="$(printf '%s' "$RAW_PROTECTED" | tr '\037' '/')"
KIT_PROTECTED_BRANCHES="${KIT_PROTECTED_BRANCHES:-main/master}"
KIT_LIVE_HOSTS="$(printf '%s' "$RAW_LIVE" | sed 's/\x1f/, /g')"

# owner/name on GitHub: githubRepo from the config, else read from the origin remote (no credentials kept).
kit_github_repo() {
  if [ -n "$KIT_GITHUB_REPO" ]; then
    printf '%s' "$KIT_GITHUB_REPO"
    return 0
  fi
  git -C "$HOOK_ROOT" remote get-url origin 2>/dev/null </dev/null |
    sed -nE 's#^(.*[/@])?github\.com[:/]([^/]+/[^/]+)/*$#\2#p' | sed -E 's#\.git$##'
}

# The compare link printed instead of opening a PR; empty when the repository isn't known.
kit_compare_link() {
  local repo
  repo="$(kit_github_repo)"
  [ -n "$repo" ] && printf 'https://github.com/%s/compare/%s...<branch>?expand=1' "$repo" "$KIT_DEFAULT_BRANCH"
  return 0
}

# The sentence that goes with a refused PR.
kit_compare_hint() {
  local link
  link="$(kit_compare_link)"
  if [ -n "$link" ]; then
    printf 'Print the compare link instead: %s' "$link"
  else
    printf 'Push the branch and give the user its compare link (githubRepo is not set in .claude/frontend-kit.json).'
  fi
}

# Reads the whole hook input once; every helper below reads from HOOK_INPUT. A guard that gets something that is
# not a JSON object (empty, truncated, an array) refuses: Claude Code always sends an object, so anything else
# means the call can't be judged, and an unjudged call must not go through.
hook_read_input() {
  HOOK_INPUT="$(cat)"
  if [ "${HOOK_KIND:-}" = guard ] && ! printf '%s' "$HOOK_INPUT" | jq -e 'type == "object"' >/dev/null 2>&1; then
    echo "Blocked: the ${0##*/} hook got input it can't read, so this call is refused." >&2
    exit 2
  fi
}

# Guards that decide on the project's config (live hosts, protected branches) refuse when that file exists but
# isn't valid JSON: reading it as "empty" would silently switch the protections off. Fixing the file with the
# Edit tool is never blocked.
kit_config_guard() {
  [ -f "$KIT_CONFIG" ] || return 0
  jq -e 'type == "object"' "$KIT_CONFIG" >/dev/null 2>&1 && return 0
  hook_deny "Blocked: .claude/frontend-kit.json is not valid JSON, so the guards can't read the live hosts and protected branches. Fix the file first (Edit tool), or run /frontend-kit:setup again."
}

# kit_switch <name> <default on|off> → 0 when the guard is on. A project turns one off with
# {"guards": {"<name>": false}} in .claude/frontend-kit.json; every guard added after 1.14 has such a switch.
# (jq's // would treat false as unset, so the raw value is read.)
kit_switch() {
  local value=""
  [ -f "$KIT_CONFIG" ] && value="$(jq -r ".guards.$1" "$KIT_CONFIG" 2>/dev/null)"
  case "$value" in false | off | 0 | no) return 1 ;; esac
  return 0
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

# --- What changed under the source folders ----------------------------------------------------------
# Names come NUL-separated from git: otherwise Arabic and other non-ASCII names arrive quoted and escaped.
# They are relative to the project, which can be a folder inside its repository.

# Code is watched wherever it is, beside those folders, when srcDirs isn't set or none of its folders exists
# (a template's "src" in a project whose code is in client/). Folders that exist are the project's word.
KIT_ANYWHERE="$KIT_SRC_UNSET"
if [ -z "$KIT_ANYWHERE" ]; then
  KIT_ANYWHERE=1
  while IFS= read -r dir; do
    [ -n "$dir" ] && [ -d "$HOOK_ROOT/$dir" ] && KIT_ANYWHERE=""
  done <<<"$KIT_SRC_DIRS"
fi
KIT_CODE_TYPES="ts tsx js jsx mjs cjs mts cts vue svelte astro html css scss sass less"
# Never source: installed, built or tool-owned. The first list at any depth, the second at the project root only
# (a feature may well be called build or out).
KIT_NOT_SOURCE="node_modules dist"
KIT_NOT_SOURCE_ROOT="build out coverage playwright-report test-results storybook-static"

# True when the gate and post-edit watch this project-relative file (guard-paths keeps to kit_in_src).
kit_watched() {
  local name
  if [ -z "$KIT_ANYWHERE" ]; then kit_in_src "$1"; return; fi
  case "/$1" in */.*/* | *.min.js | *.min.css) return 1 ;; esac
  for name in $KIT_NOT_SOURCE; do case "/$1" in */"$name"/*) return 1 ;; esac; done
  for name in $KIT_NOT_SOURCE_ROOT; do case "$1" in "$name"/*) return 1 ;; esac; done
  kit_in_src "$1" && return 0
  for name in $KIT_CODE_TYPES; do case "$1" in *."$name") return 0 ;; esac; done
  return 1
}

KIT_SRC_PATHS=()
while IFS= read -r dir; do
  [ -n "$dir" ] && KIT_SRC_PATHS+=("$dir")
done <<<"$KIT_SRC_DIRS"
if [ -n "$KIT_ANYWHERE" ]; then
  # The same files as kit_watched, as git pathspecs.
  for name in $KIT_CODE_TYPES; do KIT_SRC_PATHS+=(":(glob)**/*.$name"); done
  for name in $KIT_NOT_SOURCE; do KIT_SRC_PATHS+=(":(exclude,glob)**/$name/**"); done
  for name in $KIT_NOT_SOURCE_ROOT; do KIT_SRC_PATHS+=(":(exclude,glob)$name/**"); done
  KIT_SRC_PATHS+=(':(exclude,glob)**/.*/**' ':(exclude,glob)**/*.min.js' ':(exclude,glob)**/*.min.css')
fi

# Uncommitted changes (tracked edits and deletions + untracked), one project-relative path per line.
hook_changed_src_files() {
  {
    if git -C "$HOOK_ROOT" rev-parse -q --verify HEAD >/dev/null 2>&1; then
      git -C "$HOOK_ROOT" diff -z --name-only --relative --no-renames HEAD -- "${KIT_SRC_PATHS[@]}" 2>/dev/null
    else
      git -C "$HOOK_ROOT" ls-files -z --cached -- "${KIT_SRC_PATHS[@]}" 2>/dev/null # no commit yet
    fi
    git -C "$HOOK_ROOT" ls-files -z --others --exclude-standard -- "${KIT_SRC_PATHS[@]}" 2>/dev/null
  } | tr '\0' '\n' | sed '/^$/d' | sort -u
}

# hook_committed_src_files <since commit> <since epoch seconds> → the files of the commits made after both,
# leaving out what is already on origin/<defaultBranch> (a pull or a sync is not this session's work).
hook_committed_src_files() {
  local since="$1" epoch="$2" range=(HEAD) main="refs/remotes/origin/$KIT_DEFAULT_BRANCH"
  case "$epoch" in '' | *[!0-9]*) return 0 ;; esac
  git -C "$HOOK_ROOT" rev-parse -q --verify HEAD >/dev/null 2>&1 || return 0
  if [ -n "$since" ] && git -C "$HOOK_ROOT" rev-parse -q --verify "$since^{commit}" >/dev/null 2>&1; then range+=("^$since"); fi
  if git -C "$HOOK_ROOT" rev-parse -q --verify "$main" >/dev/null 2>&1; then range+=("^$main"); fi
  git -C "$HOOK_ROOT" log -z --format= --name-only --relative --no-renames --since="@$epoch" \
    "${range[@]}" -- "${KIT_SRC_PATHS[@]}" 2>/dev/null | tr '\0' '\n' | sed '/^$/d' | sort -u
}

hook_hash() {
  if command -v shasum >/dev/null 2>&1; then shasum; else sha1sum; fi | cut -c1-16
}

# A fingerprint of the content of the listed files (stdin, one path per line). It doesn't change when the same
# content gets committed. A deleted file counts as "deleted".
hook_files_fingerprint() {
  local file
  while IFS= read -r file; do
    [ -n "$file" ] || continue
    printf '\n>> %s\n' "$file"
    if [ -f "$HOOK_ROOT/$file" ]; then cat "$HOOK_ROOT/$file" 2>/dev/null; else printf '(deleted)'; fi
  done | hook_hash
}

# The fingerprint of every uncommitted change under the source folders.
hook_src_fingerprint() {
  hook_changed_src_files | hook_files_fingerprint
}
