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
    echo "Wajiha Kit's safety hooks need jq, so this call is refused. Install it yourself in a terminal, then try again: Mac: brew install jq. Windows: winget install jqlang.jq (then reopen Claude). Linux: sudo apt install jq (or your package manager)." >&2
    exit 2
  fi
  exit 0
fi

# Windows jq ends lines with \r; see jq-compat.sh.
# shellcheck source=jq-compat.sh
. "$(dirname "${BASH_SOURCE[0]}")/jq-compat.sh"

# A Windows path (C:\proj\src or C:/proj/src) as the bash on Windows writes it (/c/proj/src), so every path the hooks compare
# has one spelling. Anything else stays as it is.
hook_unix_path() {
  case "$1" in
    [A-Za-z]:[\\/]* | [A-Za-z]:)
      # cygpath knows the mounts too (/tmp is a Windows temp folder); without it, the drive letter becomes /c.
      if command -v cygpath >/dev/null 2>&1; then cygpath -u "$1" 2>/dev/null && return 0; fi
      local rest="${1#?:}" drive="${1%%:*}"
      rest="${rest//\\//}"
      printf "/%s%s" "$(printf %s "$drive" | tr A-Z a-z)" "$rest" ;;
    *) printf %s "$1" ;;
  esac
}

# The project root. Claude Code exports CLAUDE_PROJECT_DIR to hooks; tests set it too.
HOOK_ROOT="$(hook_unix_path "${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}")"
# A trailing or doubled slash would make every "inside the project" comparison below fail.
while case "$HOOK_ROOT" in *//*) true ;; *) false ;; esac; do HOOK_ROOT="${HOOK_ROOT%%//*}/${HOOK_ROOT#*//}"; done
[ "${#HOOK_ROOT}" -gt 1 ] && HOOK_ROOT="${HOOK_ROOT%/}"
HOOK_STATE_DIR="$HOOK_ROOT/.claude/state"

# The project's own settings for these hooks, written by /wajiha-kit:setup. Every value has a safe
# default, so a project without the file still gets the git guards (main/master) and the quality gate.
KIT_CONFIG="$HOOK_ROOT/.claude/wajiha-kit.json"

# kit_get '.commands.typecheck' 'npm run typecheck' → the configured value, else the default.
kit_get() {
  local value=""
  [ -f "$KIT_CONFIG" ] && value="$(jq -r "$1 // empty" "$KIT_CONFIG" 2>/dev/null)"
  printf '%s' "${value:-$2}"
}

KIT_SRC_UNSET="" # 1 when no source folder is configured (set below)
KIT_SEP=$'\037' # between the items of a list

# kit_list '.liveHosts' → one value per line (empty when unset). A single string counts as a list of one.
kit_list() {
  [ -f "$KIT_CONFIG" ] && jq -r "($1) | if type == \"array\" then .[] | strings elif type == \"string\" then . else empty end" "$KIT_CONFIG" 2>/dev/null
}

# a|b|c from a list, regex-escaped (dots and the like), or the given fallback.
kit_alternation() {
  local joined
  joined="$(kit_list "$1" | sed 's/[][\.^$*+?(){}|]/\\&/g' | paste -sd'|' -)"
  printf '%s' "${joined:-$2}"
}

# One jq call reads every value the hooks need on each run (a jq start costs ~8 ms on macOS, and ten of
# them were the main cost of a guard). Fields are separated by \036, list items by \037. A field with the wrong
# type loses only itself: a string where a list belongs counts as a list of one, a line break becomes a blank.
KIT_RAW_LISTS=""
KIT_CONFIG_STATE=none # none | ok | types (a list is something else) | broken (not a JSON object)
if [ -f "$KIT_CONFIG" ]; then
  KIT_CONFIG_STATE=broken
  KIT_RAW_LISTS="$(jq -r '
    def clean: gsub("[\r\n\u001e\u001f]"; " ");
    def l: if type == "array" then [.[] | strings | clean] | join("\u001f") elif type == "string" then clean else "" end;
    def s: if type == "string" or type == "number" or . == true then tostring | clean else "" end;
    if type != "object" then error("not an object") else
      [(.srcDirs | l), (.srcDir | s), (.projectName | s), (.mode | s), (.defaultBranch | s), (.githubRepo | s), (.uatHost | s),
       (.devPort | s), (.protectedBranches | l), (.liveHosts | l), (.protectedPaths | l), (.generatedPaths | l), (.allowJs | s),
       (.guards | if type == "object"
          then [to_entries[] | select(.value | tostring | . == "false" or . == "off" or . == "0" or . == "no") | .key | clean] | join("\u001f")
          else "" end),
       (if all(.srcDirs, .protectedBranches, .liveHosts, .protectedPaths, .generatedPaths; . == null or type == "array" or type == "string")
          then "ok" else "types" end)] | join("\u001e")
    end' "$KIT_CONFIG" 2>/dev/null)" || KIT_RAW_LISTS=""
fi
IFS=$'\036' read -r RAW_SRC_DIRS RAW_SRC_DIR RAW_NAME RAW_MODE RAW_BRANCH RAW_REPO RAW_UAT RAW_PORT RAW_PROTECTED RAW_LIVE \
  RAW_PROTECTED_PATHS RAW_GENERATED RAW_ALLOW_JS RAW_OFF RAW_STATE <<<"$KIT_RAW_LISTS"
[ -n "$RAW_STATE" ] && KIT_CONFIG_STATE="$RAW_STATE"

# The source folders the gates watch: .srcDirs (list) or .srcDir (string) in wajiha-kit.json, default src.
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
# wajiha-kit.json: "apps": [{"name": "site", "path": "src", "commands": {...}}, {"name": "admin", "path": "src/admin", ...}]
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

# kit_svelte_config <dir> → svelte-check's config option. It can't follow "references": a config that only lists
# them makes it fail on the packages' own types, so it gets the app's config, or checks the Svelte files alone.
kit_svelte_config() {
  if ! grep -q '"references"' "$1/tsconfig.json" 2>/dev/null; then printf '%s' '--tsconfig ./tsconfig.json'
  elif [ -f "$1/tsconfig.app.json" ]; then printf '%s' '--tsconfig ./tsconfig.app.json'
  else printf '%s' '--no-tsconfig'; fi
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
      svelte-check) printf '%s' "svelte-check $(kit_svelte_config "$HOOK_ROOT")"; return 0 ;;
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
# new | existing | maintenance | refactor | upgrade | freeze, as written in the config (mode-lib.sh judges it).
KIT_MODE="${RAW_MODE:-existing}"
KIT_DEFAULT_BRANCH="${RAW_BRANCH:-main}"
KIT_GITHUB_REPO="$RAW_REPO"
KIT_UAT_HOST="${RAW_UAT:-the test environment}"
KIT_DEV_PORT="${RAW_PORT:-5173}"
KIT_PROTECTED_BRANCHES="$(printf '%s' "$RAW_PROTECTED" | tr '\037' '/')"
KIT_PROTECTED_BRANCHES="${KIT_PROTECTED_BRANCHES:-main/master}"
KIT_LIVE_HOSTS="${RAW_LIVE//$KIT_SEP/, }"

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
    printf 'Push the branch and give the user its compare link (githubRepo is not set in .claude/wajiha-kit.json).'
  fi
}

# Reads the whole hook input once; every helper below reads from HOOK_INPUT. A guard that gets something that is
# not one JSON object (empty, truncated, an array, two of them) refuses: Claude Code always sends an object, so
# anything else means the call can't be judged, and an unjudged call must not go through.
hook_read_input() {
  HOOK_INPUT="$(cat)"
  if [ "${HOOK_KIND:-}" = guard ] && ! printf '%s' "$HOOK_INPUT" | jq -es 'length == 1 and (.[0] | type == "object")' >/dev/null 2>&1; then
    echo "Blocked: the ${0##*/} hook got input it can't read, so this call is refused." >&2
    exit 2
  fi
}

# Guards that decide on the project's config (live hosts, protected branches) refuse when that file exists but
# can't be read: reading it as "empty" would silently switch the protections off. Fixing the file with the
# Edit tool stays possible: the user is asked, because the change can't be compared with what was there.
kit_config_guard() {
  case "$KIT_CONFIG_STATE" in
    broken) hook_deny "Blocked: .claude/wajiha-kit.json is not valid JSON, so the guards can't read the live hosts and protected branches. Fix the file first (Edit tool), or run /wajiha-kit:setup again." ;;
    types) hook_deny "Blocked: in .claude/wajiha-kit.json srcDirs, protectedBranches, liveHosts, protectedPaths and generatedPaths are lists of text, and one of them is something else. Fix the file first (Edit tool)." ;;
  esac
  return 0
}

# kit_switch <name> → 0 when that check is on. The user turns one off with {"guards": {"<name>": false}} in
# .claude/wajiha-kit.json, and is asked when Claude changes one. The switches:
#   integrity        writes into the gate state and the git hooks
#   gitExtras        git work-loss and tag rules, programs git is told to run (never the branch, push and PR rules)
#   pipedCode        code piped or downloaded straight into a shell or interpreter
#   packageManager   installs with another package manager than the project's
#   remoteWrites     publish, deploy, database reset, gh writes to the remote
#   secretsInCode    credentials written into files
#   promptSecrets    the warning about a key pasted into a prompt
#   codeChecks       post-edit's notes about the code
#   subagentContext  the rules handed to a subagent
kit_switch() {
  case "$KIT_SEP$RAW_OFF$KIT_SEP" in *"$KIT_SEP$1$KIT_SEP"*) return 1 ;; esac
  return 0
}

# The folders no file tool and no shell write may touch when protectedPaths isn't set. server/ counts as deploy
# config, except where the framework keeps the app's own code there (Nuxt, Nitro and the like).
kit_default_protected() {
  printf '.github/**\ndeploy/**\n'
  local config
  for config in nuxt.config.ts nuxt.config.js nuxt.config.mjs nitro.config.ts; do
    [ -f "$HOOK_ROOT/$config" ] && return 0
  done
  if [ -f "$HOOK_ROOT/package.json" ] &&
    grep -Eq '"(nuxt|nitropack|nitro|vinxi|@solidjs/start|@analogjs/platform)"[[:space:]]*:' "$HOOK_ROOT/package.json"; then
    return 0
  fi
  printf 'server/**\n'
}

# --- Names that hold secrets (one answer for the file and the shell guard) -----------------------------
# A caller that wants case ignored turns nocasematch on, or passes the name in lower case.

# A template of an env file: names and defaults, never a secret. A glob never counts as one.
kit_env_template() {
  case "$1" in
    *'*'* | *'?'* | *'['* | *'{'* | *'$'* | *'`'*) return 1 ;;
    .env.example | .env.sample | .env.template | .env.dist | .env.defaults | .env.schema | .env.d.ts | .env.*.example | .env.*.sample | .env.*.template) return 0 ;;
  esac
  return 1
}

kit_secret_name() {
  kit_env_template "$1" && return 1
  case "$1" in .env | .env.* | .envrc | .dev.vars | .dev.vars.* | .netrc | .git-credentials) return 0 ;; esac
  return 1
}

# Names that are only refused where a file is being read: as words they are common (jq '.key', process.env).
kit_key_file() {
  case "$1" in
    *example* | *sample* | *template* | process.env | *.meta.env | *.pub) return 1 ;;
    *?.env | .env-* | .env_* | *.key | id_rsa | id_ecdsa | id_ed25519 | privkey.pem | *-key.pem | *private*key*.pem | *.p12 | *.pfx) return 0 ;;
  esac
  return 1
}

# The shapes of real credentials, from the issuers' documentation. Publishable keys (Firebase AIza, pk_live_) are not here.
KIT_TOKEN_RE='ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{50,}|gh[ousr]_[A-Za-z0-9]{36}|AKIA[0-9A-Z]{16}|(sk|rk)_live_[A-Za-z0-9]{24,}|xox[baprs]-[A-Za-z0-9-]{20,}|xapp-[A-Za-z0-9-]{20,}|sk-ant-(api|admin)[0-9]{2}-[A-Za-z0-9_-]{40,}|glpat-[A-Za-z0-9_-]{20}|npm_[A-Za-z0-9]{36}|sb_secret_[A-Za-z0-9_-]{20,}|cf(at|k|ut)_[A-Za-z0-9]{40}|hf_[A-Za-z0-9]{30,}'
# A private key is its header with key material behind it: a parser that only names the header is not one.
KIT_PEM_RE='-----BEGIN [A-Z ]*PRIVATE KEY-----(\\[rn]|[[:space:]]|["'"'"'`+,])*[A-Za-z0-9+/]{20,}'

# The first credential in stdin, or nothing.
kit_token_hit() {
  local text
  text="$(cat)"
  printf '%s' "$text" | LC_ALL=C grep -Eo -- "$KIT_TOKEN_RE" | grep -vi 'example' | head -n 1
  case "$text" in
    *'PRIVATE KEY-----'*)
      printf '%s' "$text" | LC_ALL=C tr '\r\n' '  ' | LC_ALL=C grep -Eq -- "$KIT_PEM_RE" && printf '%s\n' 'private key' ;;
  esac
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

# A change of the kit's own protections is the user's decision: the call is put to them. It is noted here and
# answered by hook_finish at the end of the guard, so that a later deny in the same call still wins. Where nobody
# can be asked, it is refused.
HOOK_ASK=""
hook_ask_later() {
  [ -n "$HOOK_ASK" ] || HOOK_ASK="$1"
}

hook_finish() {
  [ -n "$HOOK_ASK" ] || exit 0
  case "$(hook_field '.permission_mode')" in
    bypassPermissions | dontAsk) hook_deny "Blocked: $HOOK_ASK The user can't be asked in this permission mode, so tell them the change and let them make it." ;;
  esac
  local json
  json="$(jq -n --arg reason "wajiha-kit: $HOOK_ASK Approve it only if you asked for this change." \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "ask", permissionDecisionReason: $reason}}' 2>/dev/null)"
  if [ -n "$json" ]; then
    printf '%s\n' "$json"
    exit 0
  fi
  printf '%s\n' "$HOOK_ASK" >&2
  exit 2
}

# The file behind links: follows a linked file, and the linked folders of the part of the path that exists.
hook_physical_path() {
  local path="$1" target parent rest="" hops=0
  while [ -L "$path" ] && [ "$hops" -lt 40 ]; do
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
  local path out="" part
  path="$(hook_unix_path "$1")"
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
