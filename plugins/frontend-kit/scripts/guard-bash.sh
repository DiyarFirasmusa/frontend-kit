#!/bin/bash -p
# PreToolUse(Bash, Monitor, PowerShell, the terminal tool): blocks the shell commands this repo never runs.
#
#   - opening or merging a PR (the user opens PRs from the compare link)
#   - pushing to a protected branch (main/master by default) in any spelling, force pushes, deleting one
#   - putting work on a protected branch (commit, merge, cherry-pick, revert, am, moving the branch)
#   - skipping the project's git hooks (--no-verify, commit -n, HUSKY=0, LEFTHOOK=0, core.hooksPath)
#   - commands that throw away uncommitted work (reset --hard, clean -f, checkout -f, checkout/restore .)
#   - recursive rm (or find -delete) outside the project and the temp folders, or of its top-level folders
#   - network calls to the live hosts listed in .claude/frontend-kit.json (liveHosts)
#   - reading .env secrets through the shell (cat .env, git show HEAD:.env, a recursive grep over a folder that
#     holds one); .env.example and a search that leaves .env out are fine
#   - shell writes into protected paths, lockfiles, .git/, the gate state and the git hooks
#   - publishing, deploying, another package manager's install, code piped into a shell (each with a switch, see lib.sh)
#
# A change of the kit's own protections (frontend-kit.json, Claude Code's settings, the installed plugin) is put
# to the user (permissionDecision ask); any deny in the same command still wins.
#
# shell-words.awk reads the command the way the shell does (quotes, line continuations, heredocs,
# substitutions, keywords); this script judges each simple command, and follows code handed to another
# command (bash -c, eval, xargs, find -exec, git rebase -x, git aliases). Permission rules are prefix
# matches and miss such spellings. It answers with a JSON deny (exit 0) and stays silent to allow; it fails
# closed (exit 2) when jq is missing or the script itself breaks (see lib.sh), and refuses what it can't
# check inside the hook's timeout, because a hook that times out lets the command through.
#
# It is a guard rail, not a sandbox. It does not see inside script files, package scripts or programs in
# other languages, and it does not expand variables (a push or rm to a variable is refused instead).
# Known gap: bash 3.2 itself misreads a heredoc with an unbalanced quote or paren nested in two $(…).
set -uf
# shellcheck disable=SC2034 # read by lib.sh
HOOK_KIND=guard # fail closed: see lib.sh
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
. "$HOOK_DIR/lib.sh"

hook_read_input
kit_config_guard
COMMAND="$(hook_field '.tool_input.command | strings')"
CWD="$(hook_field '.cwd | strings')"
CWD="${CWD:-$HOOK_ROOT}"

# Byte-wise from here: much faster on long commands, and every word we look for is ASCII.
export LC_ALL=C

TIME_LIMIT=5 # seconds; hooks.json gives this hook 10
MAX_COMMAND=100000 # bytes. Linux refuses a longer argument anyway, and long text belongs in the Write tool
MAX_WORD=16000     # bytes in one word. bash 3.2 matches patterns in quadratic time: 100 KB takes 13 s
MAX_NESTING=8
MAX_WORDS=5000 # words in one simple command: bash 3.2 walks them slowly, and 9000 delete targets took 12 s
UNKNOWN_DIR=/__unknown_dir__ # where a command runs after a cd to a computed path
NEWLINE=$'\n'
ENCODED_NEWLINE=$'\036'
ASSIGNMENT_RE='^[A-Za-z_][A-Za-z0-9_]*\+?='
NETWORK_TOOLS=' curl wget http https xh open lynx w3m nc ab hey k6 lighthouse unlighthouse playwright newman node npx npm pnpm bunx bun yarn tsx '
PROTECTED_TOP_LEVEL=' .git .github .claude .husky src docs e2e public scripts deploy server '
GIT_COMMANDS=' add am apply archive bisect blame branch bundle cat-file check-ignore checkout cherry cherry-pick clean clone commit config describe diff diff-tree difftool fetch for-each-ref format-patch fsck gc grep hash-object help init log ls-files ls-remote ls-tree merge merge-base mergetool mv notes pull push range-diff rebase reflog remote reset restore rev-list rev-parse revert rm shortlog show show-ref sparse-checkout stash status submodule switch symbolic-ref tag update-index update-ref var version worktree '

PROTECTED=()
while IFS= read -r ITEM; do
  [ -n "$ITEM" ] && PROTECTED+=("$ITEM")
done <<<"$(kit_list '.protectedBranches')"
[ ${#PROTECTED[@]} -gt 0 ] || PROTECTED=(main master)
LIVE_HOSTS_RE="$(kit_alternation '.liveHosts' '')"
[ -n "$LIVE_HOSTS_RE" ] && LIVE_HOSTS_RE="(^|[^A-Za-z0-9-])($LIVE_HOSTS_RE)"

PROTECTED_GLOBS=()
while IFS= read -r ITEM; do
  ITEM="${ITEM%%/\*\*}"
  case "$ITEM" in '' | .env | .env.*) ;; *) PROTECTED_GLOBS+=("$ITEM") ;; esac
done <<<"$(if [ -n "$RAW_PROTECTED_PATHS" ]; then printf '%s\n' "$RAW_PROTECTED_PATHS" | tr '\037' '\n'; else kit_default_protected; fi)"
GENERATED_GLOBS=()
while IFS= read -r ITEM; do
  [ -n "$ITEM" ] && GENERATED_GLOBS+=("${ITEM%%/\*\*}")
done <<<"$(printf '%s\n' "$RAW_GENERATED" | tr '\037' '\n')"
SOURCE_FOLDERS=()
while IFS= read -r ITEM; do
  ITEM="${ITEM#./}"
  ITEM="${ITEM%/}"
  case "$ITEM" in '' | .) continue ;; esac
  SOURCE_FOLDERS+=("$ITEM")
  # A configured source folder is as protected from a recursive delete as src/ is.
  [ -n "$KIT_SRC_UNSET" ] || PROTECTED_TOP_LEVEL="$PROTECTED_TOP_LEVEL${ITEM%%/*} "
done <<<"$KIT_SRC_DIRS"

GIT_EXTRAS=""
kit_switch gitExtras && GIT_EXTRAS=1
PIPED_CODE=""
kit_switch pipedCode && PIPED_CODE=1
INTEGRITY=""
kit_switch integrity && INTEGRITY=1
REMOTE_WRITES=""
kit_switch remoteWrites && REMOTE_WRITES=1
ROOT_REAL="$(cd -P -- "$HOOK_ROOT" 2>/dev/null && pwd)" || ROOT_REAL=""
[ -n "$ROOT_REAL" ] || ROOT_REAL="$HOOK_ROOT"
START_CWD="$CWD"
# How $CLAUDE_PROJECT_DIR is written. The Bash tool doesn't define it: it is only read as the project where that
# can't delete anything.
PROJECT_VAR='$CLAUDE_PROJECT_DIR'
PROJECT_VAR_BRACED='${CLAUDE_PROJECT_DIR}'

# State of the walk through the command line.
CHAINED_BRANCH="" # "git checkout -b x && …": holds only while every next command is joined by &&
CHAINED_DIR=""
STICKY_BRANCH="" # a switch TO a protected branch: holds for the rest of the command
STICKY_DIR=""
JOINED_BY=""  # what came before the current command
FOLLOWED_BY="" # and what comes after it
VIA_XARGS=""
VIA_RUNNER=""
KNOWN_BASE="$CWD"  # the last folder that was known, for what is judged by more than its deletes
HOOKS_SKIPPED=""   # SKIP was exported (pre-commit reads it)
TEMP_VARS=" "      # variables that were set from mktemp in this command
LITERAL_VARS="$NEWLINE" # name=value of the assignments this command makes with plain values
IN_TRAP=""
IN_ARRAY=""
PIPE_IN=""

# --- Small helpers -----------------------------------------------------------------------------
# No subshells in these: a deny must exit the script, and a long command has thousands of words.

# git takes any unique prefix of a long option. long_option <arg> <full option> <shortest prefix>
long_option() {
  local arg="${1%%=*}"
  case "$arg" in "$3"*) ;; *) return 1 ;; esac
  case "$2" in "$arg"*) return 0 ;; esac
  return 1
}

# short_flag <arg> <letter> <letters that take a value>: is the flag in this cluster (-qf)?
short_flag() {
  local cluster="${1#-}" letter
  case "$1" in --* | [!-]*) return 1 ;; esac
  while [ -n "$cluster" ]; do
    letter="${cluster:0:1}"
    [ "$letter" = "$2" ] && return 0
    case "$3" in *"$letter"*) return 1 ;; esac
    cluster="${cluster:1}"
  done
  return 1
}

is_dynamic() {
  case "$1" in *'$'* | *'`'*) return 0 ;; esac
  return 1
}

is_protected_branch() {
  local name="${1#refs/heads/}" item result=1
  name="${name#heads/}"
  [ -n "$name" ] || return 1
  shopt -s nocasematch # on macOS "Main" is the same branch as main
  for item in "${PROTECTED[@]}"; do
    case "$name" in "$item") result=0; break ;; esac
  done
  shopt -u nocasematch
  return $result
}

# Sets RESOLVED: the path against a base, lexically (no symlinks; . .. and ~ handled).
resolve_path() {
  local base="$1" path="$2" out="" part
  # shellcheck disable=SC2088 # "~" here is the literal text of the command, expanded by hand below
  case "$path" in
    "~") path="${HOME:-/}" ;;
    "~/"*) path="${HOME:-}/${path#\~/}" ;;
    /*) ;;
    *) path="$base/$path" ;;
  esac
  local IFS='/'
  for part in $path; do
    case "$part" in
      "" | .) ;;
      ..) out="${out%/*}" ;;
      *) out="$out/$part" ;;
    esac
  done
  RESOLVED="${out:-/}"
}

# Sets EXPANDED: the word with a leading $CLAUDE_PROJECT_DIR read as the project.
expand_project() {
  EXPANDED="$1"
  case "$1" in
    "$PROJECT_VAR" | "$PROJECT_VAR"/*) EXPANDED="$HOOK_ROOT${1#"$PROJECT_VAR"}" ;;
    "$PROJECT_VAR_BRACED" | "$PROJECT_VAR_BRACED"/*) EXPANDED="$HOOK_ROOT${1#"$PROJECT_VAR_BRACED"}" ;;
  esac
}

# Sets KNOWN: the folder itself, or after a cd to a computed path the last one that was known. Everything but a
# delete is judged there, as if the cd had gone nowhere.
known_dir() {
  case "$1" in
    "$UNKNOWN_DIR" | "$UNKNOWN_DIR"/*) KNOWN="$KNOWN_BASE${1#"$UNKNOWN_DIR"}" ;;
    *) KNOWN="$1" ;;
  esac
}

# Sets PLACE (root | inside | outside) and INSIDE_REL for a resolved path, by either spelling of the project's
# folder. A folder above the project counts as root.
locate() {
  local root
  PLACE=outside
  INSIDE_REL=""
  shopt -s nocasematch # macOS file names
  for root in "$HOOK_ROOT" "$ROOT_REAL"; do
    case "$1" in
      "$root") PLACE=root; break ;;
      "$root"/*) PLACE=inside; INSIDE_REL="${1:${#root}+1}"; break ;;
    esac
    case "$root" in "${1%/}"/*) PLACE=root ;; esac
  done
  shopt -u nocasematch
}

# Sets BRANCH: where this directory is at this point of the command.
find_branch() {
  if [ -n "$CHAINED_BRANCH" ] && [ "$CHAINED_DIR" = "$1" ]; then
    BRANCH="$CHAINED_BRANCH"
  elif [ -n "$STICKY_BRANCH" ] && [ "$STICKY_DIR" = "$1" ]; then
    BRANCH="$STICKY_BRANCH"
  else
    known_dir "$1"
    local where="$KNOWN"
    # The folder the call started in is gone: the project's branch is the one that counts.
    [ "$where" = "$START_CWD" ] && [ ! -d "$where" ] && where="$HOOK_ROOT"
    BRANCH="$(git -C "$where" branch --show-current 2>/dev/null </dev/null)"
  fi
}

refuse_on_protected() { # <dir> <what>
  find_branch "$1"
  is_protected_branch "$BRANCH" &&
    hook_deny "Blocked: you are on $BRANCH. Never $2 on a protected branch ($KIT_PROTECTED_BRANCHES). Create a task branch from origin/$KIT_DEFAULT_BRANCH first."
}

deny_hook_skip() {
  hook_deny "Blocked: $1 skips the project's git hooks. Fix what the hook reports and run it again; only the user can ask to skip hooks."
}

deny_pull_request() {
  hook_deny "Blocked: never open or merge a pull request; the user does that by hand. $(kit_compare_hint)"
}

# --- Words every command is checked for ---------------------------------------------------------

# A word naming a .env secrets file (.env, .Env.local, HEAD:.env, @.env, --env-file=.env, .en?, a link to one).
check_env_word() {
  local word="$1" base found=""
  # A search that leaves the file out doesn't read it.
  case "$word" in '--exclude=.env' | '--exclude=.env.*' | '--exclude=.env*' | '--exclude=*.env*' | '--glob=!.env*' | '!.env' | '!.env.*' | '!.env*') return ;; esac
  case "$word" in
    *' '* | *"$NEWLINE"*)
      # Text with spaces is a message, unless it is a path.
      case "$word" in /* | ./* | ../* | '~/'* | '$'*) ;; *) return ;; esac
      case "$word" in *"$NEWLINE"*) return ;; esac
      ;;
  esac
  base="${word##*/}"
  base="${base##*=}"
  base="${base##*:}"
  base="${base#@}"
  case "$base" in *' '*) return ;; esac
  shopt -s nocasematch
  if ! kit_env_template "$base"; then
    case "$base" in
      .env | .env.* | '.env*' | '.env?'* | '.env['*) found=1 ;;
      .e*[*?[]* | '.['*)
        # shellcheck disable=SC2254 # the word is a glob: does it match .env?
        case .env in $base) found=1 ;; esac
        ;;
    esac
  fi
  shopt -u nocasematch
  if [ -z "$found" ] && [ "${#word}" -lt 1024 ]; then
    local file target
    expand_project "$word"
    file="$EXPANDED"
    case "$file" in /*) ;; *) known_dir "$CWD"; file="$KNOWN/$file" ;; esac
    if [ -L "$file" ]; then
      target="$(readlink "$file" 2>/dev/null)"
      if ! kit_env_template "${target##*/}"; then
        case "${target##*/}" in .env | .env.*) found=1; base="${target##*/}" ;; esac
      fi
    fi
  fi
  [ -n "$found" ] && deny_secret_read "$base"
}

deny_secret_read() {
  hook_deny "Blocked: $1 holds secrets and stays out of Claude's context, in the shell too. Use .env.example for names and defaults, and ask the user for any value you need."
}

# The other credential files (.envrc, .netrc, *.key …), where a command reads them: as plain words they are common.
check_secret_read() { # <command> <args…>
  local name="$1" arg base keys="" pattern=""
  shift
  case "$name" in
    cat | head | tail | less | more | bat | batcat | source | . | base64 | xxd | od | strings | nl | tac | '<') keys=1 ;;
    cp | scp) ;;
    grep | egrep | fgrep | rg) pattern=1 ;;
    *) return 0 ;;
  esac
  for arg in "$@"; do
    case "$arg" in -*) continue ;; esac
    if [ -n "$pattern" ]; then pattern=""; continue; fi
    base="${arg##*/}"
    base="${base#@}"
    case "$base" in *' '*) continue ;; esac
    shopt -s nocasematch
    if kit_secret_name "$base" || { [ -n "$keys" ] && kit_key_file "$base"; }; then
      shopt -u nocasematch
      deny_secret_read "$base"
    fi
    shopt -u nocasematch
  done
  return 0
}

# check_search <grep|rg> <args>: a recursive search prints from every .env below the folders it is given.
# rg only does with --hidden, and skips what git ignores unless told otherwise.
check_search() {
  local tool="$1" arg recursive="" safe="" pattern="" hidden="" unignored="" found folder value paths=()
  shift
  while [ $# -gt 0 ]; do
    arg="$1"
    shift
    case "$arg" in
      --) paths+=("$@"); break ;;
      --recursive | --dereference-recursive) recursive=1 ;;
      --hidden | -.) hidden=1 ;;
      --no-ignore | --no-ignore-vcs | -u) unignored=1 ;;
      -uu | -uuu) hidden=1; unignored=1 ;;
      --exclude=.env\* | --exclude=\*.env\* | --glob=!.env\* | -g!.env\*) safe=1 ;;
      --exclude | -g | --glob)
        case "${1:-}" in '!.env*') safe=1 ;; '.env*' | '*.env*') [ "$arg" = --exclude ] && safe=1 ;; esac
        [ $# -gt 0 ] && shift ;;
      --include=*)
        value="${arg#*=}"
        # shellcheck disable=SC2254 # the value is a glob: does it take in an env file?
        case .env in
          $value) ;;
          *) case .env.local in $value) ;; *) safe=1 ;; esac ;;
        esac ;;
      -e | -f | --regexp | --file) pattern=1; [ $# -gt 0 ] && shift ;;
      --regexp=* | --file=*) pattern=1 ;;
      --max-count | --context | --after-context | --before-context) [ $# -gt 0 ] && shift ;;
      --*) ;;
      -?*)
        if [ "$tool" = grep ]; then
          if short_flag "$arg" r efmABCd || short_flag "$arg" R efmABCd; then recursive=1; fi
        fi
        case "$arg" in
          -*e | -*f) pattern=1; [ $# -gt 0 ] && shift ;;
          -*[mABC]) [ $# -gt 0 ] && shift ;;
        esac ;;
      *) if [ -n "$pattern" ]; then paths+=("$arg"); else pattern=1; fi ;;
    esac
  done
  [ "$tool" = rg ] && recursive="$hidden"
  if [ -z "$recursive" ] || [ -n "$safe" ]; then return 0; fi
  [ ${#paths[@]} -gt 0 ] || paths=(.)
  for arg in "${paths[@]}"; do
    [ "$SECONDS" -lt "$TIME_LIMIT" ] || deny_too_long
    expand_project "$arg"
    is_dynamic "$EXPANDED" && continue
    known_dir "$CWD"
    resolve_path "$KNOWN" "$EXPANDED"
    [ -d "$RESOLVED" ] || continue
    folder="$RESOLVED"
    locate "$folder"
    case "$PLACE" in
      root) folder="$HOOK_ROOT" ;; # the project, or a folder above it: the project's own files are what counts
      outside) continue ;;
    esac
    found="$(find "$folder/" -maxdepth 4 \( -name node_modules -o -name .git \) -prune -o -type f \( -iname '.env' -o -iname '.env.*' \) \
      ! -iname '*.example' ! -iname '*.sample' ! -iname '*.template' ! -iname '.env.dist' ! -iname '.env.defaults' ! -iname '.env.schema' ! -iname '.env.d.ts' \
      -print -quit 2>/dev/null </dev/null)"
    [ -n "$found" ] || continue
    if [ "$tool" = rg ] && [ -z "$unignored" ]; then
      (cd "${found%/*}" 2>/dev/null && git check-ignore -q -- "${found##*/}" </dev/null 2>/dev/null) && continue
    fi
    hook_deny "Blocked: this search would read ${found##*/}, which holds secrets. Search a source folder, add --exclude='.env*' (rg: -g '!.env*'), or use git grep --untracked -nI -e '<pattern>' -- . ':(exclude,icase)*.env*'."
  done
  return 0
}

has_live_host() {
  local result=1
  [ -n "$LIVE_HOSTS_RE" ] || return 1
  shopt -s nocasematch
  [[ "$1" =~ $LIVE_HOSTS_RE ]] && result=0
  shopt -u nocasematch
  return $result
}

# VAR=value before a command, or handed to export.
check_assignment() {
  local name="${1%%=*}" value="${1#*=}"
  note_assignment "${name%+}" "$value"
  case "$name" in
    HUSKY | LEFTHOOK) case "$value" in 0* | false | '$'*) deny_hook_skip "$name=$value" ;; esac ;;
    HUSKY_SKIP_HOOKS | SKIP_SIMPLE_GIT_HOOKS) deny_hook_skip "$name" ;;
    LEFTHOOK_EXCLUDE) [ -n "$value" ] && deny_hook_skip "$name" ;;
    BASH_ENV)
      [ -n "$value" ] &&
        hook_deny "Blocked: BASH_ENV makes every shell run another program first, which can't be checked. Run the command without it." ;;
    GIT_SSH_COMMAND | GIT_SSH | GIT_EXTERNAL_DIFF | GIT_PROXY_COMMAND | GIT_ASKPASS | GIT_EDITOR | GIT_SEQUENCE_EDITOR)
      [ -n "$GIT_EXTRAS" ] || return 0
      case "$name=$value" in
        *= | *=true | *=: | *=/usr/bin/true | *=/bin/true | GIT_EXTERNAL_DIFF=false | GIT_SSH_COMMAND=ssh | GIT_SSH=ssh) ;;
        *) hook_deny "Blocked: $name makes git run another program, which can't be checked. Run the command without it (GIT_EDITOR=true is fine)." ;;
      esac
      ;;
    GIT_CONFIG_PARAMETERS | GIT_CONFIG_KEY_*)
      shopt -s nocasematch
      case "$value" in
        *hookspath* | *alias.*) shopt -u nocasematch; deny_hook_skip "setting core.hooksPath or an alias through $name" ;;
      esac
      shopt -u nocasematch
      ;;
  esac
  return 0
}

# What a trap and a command name may later be judged by.
note_assignment() { # <name> <value>
  TEMP_VARS="${TEMP_VARS// $1 / }"
  case "$2" in '$(mktemp)' | '$(mktemp -d)') TEMP_VARS="$TEMP_VARS$1 " ;; esac
  [ "${#2}" -lt 200 ] || return 0
  local value="$2" tail
  case "$value" in
    *"$NEWLINE"*) value='$' ;;
    *'$'* | *'`'*)
      # A path with a computed folder still names its program: $(npm bin)/tsc is tsc.
      tail="${value##*/}"
      case "$value" in */*) ;; *) tail='$' ;; esac
      case "$tail" in '' | *[!A-Za-z0-9._-]*) value='$' ;; *) value="$tail" ;; esac
      ;;
  esac
  case "$LITERAL_VARS" in
    *"$NEWLINE$1=$value$NEWLINE"*) ;;
    *"$NEWLINE$1="*) LITERAL_VARS="$LITERAL_VARS$1=\$$NEWLINE" ;; # set twice: not known
    *) LITERAL_VARS="$LITERAL_VARS$1=$value$NEWLINE" ;;
  esac
}

# --- git ---------------------------------------------------------------------------------------

# Config keys that make git run another program. A value that only switches one off, or names a known pager or
# editor, is none.
is_exec_config() { # <key or key=value>
  local result=1
  shopt -s nocasematch
  case "$1" in
    core.pager= | core.pager=cat | core.pager=less | 'core.pager=less -'[A-Za-z]* ) case "$1" in *[';&|$`']*) result=0 ;; esac ;;
    core.editor= | core.editor=true | core.editor=: | sequence.editor= | sequence.editor=true | sequence.editor=: | \
      core.editor=vim | core.editor=vi | core.editor=nvim | core.editor=nano | core.editor=code | 'core.editor=code --wait' | 'core.editor=code -w') ;;
    core.fsmonitor= | core.fsmonitor=false | core.fsmonitor=true | credential.helper= | credential.*.helper= | core.askpass= | diff.external=) ;;
    help.autocorrect=0 | help.autocorrect=false | help.autocorrect=never | help.autocorrect=prompt) ;;
    filter.*= | filter.*.required=true | filter.*.required=false) ;;
    core.fsmonitor* | core.sshcommand* | core.pager* | core.editor* | core.askpass* | credential.helper* | credential.*.helper* | \
      diff.external* | gpg.program* | sequence.editor* | include.path* | includeif.* | filter.* | merge.*.driver* | diff.*.textconv* | \
      remote.*.uploadpack* | remote.*.receivepack* | help.autocorrect*) result=0 ;;
  esac
  shopt -u nocasematch
  return $result
}

# Config that changes where a plain push goes.
is_push_config() { # <key or key=value>
  local result=1
  shopt -s nocasematch
  case "$1" in
    remote.*.push | remote.*.push=* | remote.*.pushurl | remote.*.pushurl=* | remote.*.mirror | remote.*.mirror=true | remote.*.mirror=1 | \
      remote.*.mirror=yes | remote.*.mirror=on | push.default=matching | push.default=upstream | push.default=tracking) result=0 ;;
  esac
  shopt -u nocasematch
  return $result
}

check_git_config_value() {
  shopt -s nocasematch
  local kind=""
  case "$1" in
    core.hookspath=*) kind=hooks ;;
    hook.*) kind=hooks ;;
    alias.*) kind=alias ;;
  esac
  shopt -u nocasematch
  case "$kind" in
    hooks) deny_hook_skip "overriding ${1%%=*}" ;;
    alias) hook_deny "Blocked: a one-off \`git -c alias.…\` hides which git command really runs. Spell the command out (e.g. git push -u origin <branch>)." ;;
  esac
  is_push_config "$1" &&
    hook_deny "Blocked: \`git -c ${1%%=*}\` redirects where a push goes. Push only the task branch: git push -u origin <branch>."
  [ -n "$GIT_EXTRAS" ] && is_exec_config "$1" &&
    hook_deny "Blocked: \`git -c ${1%%=*}\` makes git run another program, which can't be checked. Run the git command without it."
  return 0
}

check_git() {
  local dir sub=""
  known_dir "$CWD"
  dir="$KNOWN"
  while [ $# -gt 0 ]; do
    case "$1" in
      -C)
        shift
        if [ $# -gt 0 ]; then
          expand_project "$1"
          if ! is_dynamic "$EXPANDED"; then resolve_path "$dir" "$EXPANDED"; dir="$RESOLVED"; fi
        fi
        ;;
      -c | --config-env) shift; [ $# -gt 0 ] && check_git_config_value "$1" ;;
      -c?*) check_git_config_value "${1#-c}" ;;
      --config-env=*) check_git_config_value "${1#--config-env=}" ;;
      --git-dir | --work-tree | --namespace | --super-prefix | --attr-source) shift ;;
      -*) ;;
      *) sub="$1"; shift; break ;;
    esac
    [ $# -gt 0 ] && shift
  done
  [ -n "$sub" ] || return 0
  run_git "$dir" "$sub" "$@"
}

run_git() { # <dir> <subcommand> <args…>
  local dir="$1" sub="$2" arg previous
  shift 2
  for arg in "$@"; do
    [ "$arg" = "--" ] && break
    long_option "$arg" --no-verify --no-veri && deny_hook_skip "--no-verify"
  done
  if [ -n "$VIA_XARGS" ]; then
    case "$sub" in push | reset | checkout | switch | restore | clean | branch | update-ref)
      hook_deny "Blocked: \`xargs git $sub\` takes its arguments from input, so it can't be checked. Write the command out with literal arguments." ;;
    esac
  fi

  case "$sub" in
    fetch | pull | clone | ls-remote | push | send-pack)
      for arg in "$@"; do
        case "$arg" in
          --upload-pack | --upload-pack=* | --receive-pack | --receive-pack=* | --exec | --exec=*)
            hook_deny "Blocked: \`git $sub $arg\` runs another program on the remote side, which can't be checked." ;;
        esac
      done
      ;;
  esac
  if [ -n "$HOOKS_SKIPPED" ]; then
    case "$sub" in commit | push | merge | rebase | am) deny_hook_skip "SKIP" ;; esac
  fi
  case "$sub" in
    send-pack | http-push) hook_deny "Blocked: \`git $sub\` pushes around the push checks. Use git push -u origin <branch>." ;;
    subtree) [ "${1:-}" = push ] && hook_deny "Blocked: \`git subtree push\` pushes history to a remote. Ask the user." ;;
    symbolic-ref) git_symbolic_ref "$@" ;;
    worktree) [ "${1:-}" = add ] && git_worktree_add "$@" ;;
    fetch) git_fetch "$@" ;;
  esac
  [ -n "$GIT_EXTRAS" ] && git_extras "$dir" "$sub" "$@"
  case "$sub" in
    diff | log | show | format-patch | archive | diff-tree)
      local saved_cwd="$CWD"
      CWD="$dir"
      previous=""
      for arg in "$@"; do
        [ "$arg" = "--" ] && break
        case "$arg" in --output=* | --output-directory=*) check_write_target "${arg#*=}" write ;; esac
        case "$previous" in --output | --output-directory) check_write_target "$arg" write ;; esac
        previous="$arg"
      done
      CWD="$saved_cwd"
      ;;
  esac
  case "$sub" in
    push) git_push "$dir" "$@" ;;
    commit) git_commit "$dir" "$@" ;;
    merge | cherry-pick | revert | am)
      for arg in "$@"; do
        case "$arg" in --abort | --quit) return 0 ;; esac
      done
      find_branch "$dir"
      if [ "$sub" = merge ] && is_protected_branch "$BRANCH"; then
        hook_deny "Blocked: merging into a protected branch ($KIT_PROTECTED_BRANCHES) is the user's job. Push the task branch instead and give the user its compare link."
      fi
      refuse_on_protected "$dir" "$sub"
      ;;
    pull) git_pull "$dir" "$@" ;;
    rebase) git_rebase "$dir" "$@" ;;
    checkout) git_checkout "$dir" "$@" ;;
    switch) git_switch "$dir" "$@" ;;
    restore) git_restore "$dir" "$@" ;;
    reset)
      for arg in "$@"; do
        [ "$arg" = "--" ] && break
        long_option "$arg" --hard --ha &&
          hook_deny "Blocked: \`git reset --hard\` throws away uncommitted work. Ask the user; to undo one file use \`git restore <file>\`."
      done
      ;;
    clean)
      for arg in "$@"; do
        [ "$arg" = "--" ] && break
        if long_option "$arg" --force --f || short_flag "$arg" f e; then
          hook_deny "Blocked: \`git clean -f\` deletes untracked files for good. List them with \`git clean -n\` and ask the user."
        fi
      done
      ;;
    branch) git_branch "$@" ;;
    update-ref)
      for arg in "$@"; do
        case "$arg" in
          --stdin) hook_deny "Blocked: \`git update-ref --stdin\` can't be checked. Use git branch or git switch." ;;
          HEAD) [ "$arg" = "${1:-}" ] && refuse_on_protected "$dir" "move HEAD" ;;
          refs/heads/*) is_protected_branch "$arg" && hook_deny "Blocked: never move or delete a protected branch ($KIT_PROTECTED_BRANCHES)." ;;
        esac
      done
      ;;
    config) git_config "$@" ;;
    bisect)
      if [ "${1:-}" = run ]; then shift; run_words "$@"; fi
      ;;
    submodule)
      while [ $# -gt 0 ]; do
        if [ "$1" = foreach ]; then
          shift
          while [ $# -gt 0 ]; do case "$1" in -*) shift ;; *) break ;; esac; done
          [ $# -gt 0 ] && scan_text "$*"
          return 0
        fi
        shift
      done
      ;;
    *) git_alias "$dir" "$sub" "$@" ;;
  esac
  return 0
}

git_symbolic_ref() {
  local arg values=()
  for arg in "$@"; do case "$arg" in -*) ;; *) values+=("$arg") ;; esac; done
  [ ${#values[@]} -ge 2 ] && is_protected_branch "${values[1]}" &&
    hook_deny "Blocked: never move HEAD onto a protected branch ($KIT_PROTECTED_BRANCHES) with symbolic-ref. Use git switch -c <task branch>."
  return 0
}

# Starting a worktree from main is the normal flow; only -B resets the branch it names.
git_worktree_add() {
  local arg previous=""
  for arg in "$@"; do
    if [ "$previous" = -B ] && is_protected_branch "$arg"; then
      hook_deny "Blocked: never create a worktree that resets a protected branch ($KIT_PROTECTED_BRANCHES)."
    fi
    case "$arg" in -B?*) is_protected_branch "${arg#-B}" && hook_deny "Blocked: never create a worktree that resets a protected branch ($KIT_PROTECTED_BRANCHES)." ;; esac
    previous="$arg"
  done
  return 0
}

# main:main from the remote is a fast-forward sync; anything else into a protected branch moves it.
git_fetch() {
  local arg force="" source target
  for arg in "$@"; do
    case "$arg" in --*) long_option "$arg" --force --f && force=1 ;; -*) short_flag "$arg" f jo && force=1 ;; esac
  done
  for arg in "$@"; do
    case "$arg" in -*) continue ;; *:*) ;; *) continue ;; esac
    target="${arg##*:}"
    is_protected_branch "$target" || continue
    source="${arg%%:*}"
    if [ -z "$force" ] && [ "${source:0:1}" != + ] && [ "${source#refs/heads/}" = "${target#refs/heads/}" ]; then continue; fi
    hook_deny "Blocked: \`git fetch $arg\` moves a protected branch ($KIT_PROTECTED_BRANCHES). Fetch without a destination branch."
  done
  return 0
}

# Work loss and lost history beside the core rules. {"guards": {"gitExtras": false}} lifts these.
git_extras() {
  local dir="$1" sub="$2" arg dry="" deleting="" forced="" everything="" cached=""
  shift 2
  case "$sub" in
    stash)
      case "${1:-}" in drop | clear) hook_deny "Blocked: \`git stash ${1}\` deletes saved work for good. Ask the user." ;; esac ;;
    filter-branch | filter-repo) hook_deny "Blocked: \`git $sub\` rewrites the whole history. Ask the user." ;;
    reflog)
      case "${1:-}" in expire | delete) hook_deny "Blocked: \`git reflog ${1}\` removes the way back to lost commits. Ask the user." ;; esac ;;
    gc)
      for arg in "$@"; do
        case "$arg" in --prune=now | --prune=all | --prune=0 | --prune | -f | --force) hook_deny "Blocked: \`git gc $arg\` deletes unreachable commits for good. Ask the user." ;; esac
      done ;;
    prune)
      for arg in "$@"; do case "$arg" in -n | --dry-run) dry=1 ;; esac; done
      [ -n "$dry" ] || hook_deny "Blocked: \`git prune\` deletes unreachable objects for good. Ask the user." ;;
    replace)
      [ $# -gt 0 ] && case "$1" in -l | --list) ;; *) hook_deny "Blocked: \`git replace\` rewrites what history shows. Ask the user." ;; esac ;;
    worktree)
      [ "${1:-}" = remove ] || return 0
      for arg in "$@"; do
        case "$arg" in --force | -f) hook_deny "Blocked: \`git worktree remove --force\` throws away that worktree's uncommitted work. Ask the user." ;; esac
      done ;;
    checkout-index)
      for arg in "$@"; do
        case "$arg" in -f | --force | -a*f*) hook_deny "Blocked: \`git checkout-index --force\` overwrites files in the working tree. Ask the user." ;; esac
      done ;;
    read-tree)
      for arg in "$@"; do case "$arg" in --reset) hook_deny "Blocked: \`git read-tree --reset\` throws away uncommitted work. Ask the user." ;; esac; done ;;
    reset)
      for arg in "$@"; do
        [ "$arg" = "--" ] && break
        long_option "$arg" --merge --mer && hook_deny "Blocked: \`git reset --merge\` throws away staged and merged work. Ask the user, or use git merge --abort."
      done ;;
    update-ref)
      for arg in "$@"; do
        [ "$arg" = -d ] && hook_deny "Blocked: \`git update-ref -d\` deletes a ref and the way back to its commits. Use git branch -d, or ask the user."
      done ;;
    tag)
      for arg in "$@"; do
        case "$arg" in
          --) break ;;
          --message* | --file* | --format* | --sort*) ;;
          --*) long_option "$arg" --force --forc && forced=1; long_option "$arg" --delete --del && deleting=1 ;;
          -*) short_flag "$arg" f mFun && forced=1; short_flag "$arg" d mFun && deleting=1 ;;
        esac
      done
      [ -n "$forced$deleting" ] && hook_deny "Blocked: moving or deleting a tag changes what a release points at. Ask the user." ;;
    rm)
      for arg in "$@"; do
        case "$arg" in --cached) cached=1 ;; . | ./ | :/ | '*' | ':/*' | '**') everything=1 ;; esac
      done
      [ -n "$everything" ] && [ -z "$cached" ] && hook_deny "Blocked: \`git rm\` of the whole tree deletes the project's files. Remove the files you mean, or ask the user." ;;
    submodule)
      [ "${1:-}" = deinit ] || return 0
      for arg in "$@"; do case "$arg" in -f | --force) hook_deny "Blocked: \`git submodule deinit --force\` throws away that submodule's changes. Ask the user." ;; esac; done ;;
    lfs)
      [ "${1:-}" = prune ] || return 0
      for arg in "$@"; do case "$arg" in -d | --dry-run) dry=1 ;; esac; done
      [ -n "$dry" ] || hook_deny "Blocked: \`git lfs prune\` deletes local copies for good. Ask the user." ;;
  esac
  return 0
}

# A configured alias is judged by what it runs.
git_alias() {
  local dir="$1" sub="$2" value arg quoted="" quote="'" escaped="'\\''"
  shift 2
  case "$GIT_COMMANDS" in *" $sub "*) return 0 ;; esac
  case "$sub" in *[!A-Za-z0-9-]* | '') return 0 ;; esac
  value="$(git -C "$dir" config --get "alias.$sub" 2>/dev/null </dev/null)"
  [ -n "$value" ] || return 0
  for arg in "$@"; do quoted="$quoted '${arg//$quote/$escaped}'"; done
  local saved="$CWD"
  CWD="$dir"
  case "$value" in
    '!'*) scan_text "${value#!}$quoted" ;;
    *) scan_text "git $value$quoted" ;;
  esac
  CWD="$saved"
}

git_commit() {
  local dir="$1" cluster letter
  shift
  while [ $# -gt 0 ]; do
    case "$1" in
      --) break ;;
      --message | --file | --author | --date | --template | --trailer | --reuse-message | --reedit-message) [ $# -gt 1 ] && shift ;;
      --*) ;;
      -?*)
        cluster="${1#-}"
        while [ -n "$cluster" ]; do
          letter="${cluster:0:1}"
          cluster="${cluster:1}"
          case "$letter" in
            n) deny_hook_skip "\`git commit -n\`" ;;
            m | F | C | c | t) # takes a value: the rest of the word, else the next one
              [ -z "$cluster" ] && [ $# -gt 1 ] && shift
              break
              ;;
            u | S) break ;;
          esac
        done
        ;;
    esac
    shift
  done
  refuse_on_protected "$dir" "commit"
}

git_push() {
  local dir="$1" positionals=() arg deleting=""
  shift
  while [ $# -gt 0 ]; do
    arg="$1"
    shift
    [ "$SECONDS" -lt "$TIME_LIMIT" ] || deny_too_long
    case "$arg" in
      --for*)
        hook_deny "Blocked: force pushes rewrite shared history. Push normally; if the push is rejected, fetch and tell the user." ;;
      -o | --push-option | --repo | --receive-pack | --exec) [ $# -gt 0 ] && shift ;;
      --*)
        long_option "$arg" --delete --de && deleting=1
        [ -n "$GIT_EXTRAS" ] && long_option "$arg" --prune --pru &&
          hook_deny "Blocked: \`git push --prune\` deletes remote branches and tags you don't have here. Delete one branch by name, or ask the user."
        if long_option "$arg" --mirror --m || long_option "$arg" --all --al || long_option "$arg" --branches --b; then
          hook_deny "Blocked: \`git push $arg\` would push the protected branches ($KIT_PROTECTED_BRANCHES) too. Push only the task branch: git push -u origin <branch>."
        fi
        ;;
      -*)
        short_flag "$arg" d o && deleting=1
        short_flag "$arg" f o &&
          hook_deny "Blocked: force pushes rewrite shared history. Push normally; if the push is rejected, fetch and tell the user." ;;
      +*)
        hook_deny "Blocked: a '+' refspec is a force push. Push normally." ;;
      *) positionals+=("$arg") ;;
    esac
  done

  local count=${#positionals[@]} k destination
  if [ "$count" -le 1 ]; then
    # No refspec: git pushes the current branch.
    find_branch "$dir"
    is_protected_branch "$BRANCH" &&
      hook_deny "Blocked: the current branch is $BRANCH. Never push a protected branch ($KIT_PROTECTED_BRANCHES). Switch to the task branch."
    [ "$count" -eq 1 ] && is_protected_branch "${positionals[0]}" &&
      hook_deny "Blocked: never push to a protected branch ($KIT_PROTECTED_BRANCHES). Push only the task branch: git push -u origin <branch>."
    return 0
  fi
  for ((k = 1; k < count; k++)); do
    destination="${positionals[$k]}"
    [ "$destination" = ":" ] &&
      hook_deny "Blocked: the ':' refspec pushes every matching branch, protected ones included. Push only the task branch: git push -u origin <branch>."
    if [ -n "$GIT_EXTRAS" ]; then
      case "$deleting|$destination" in
        '|:refs/tags/'* | '1|refs/tags/'* | '1|tag' | '1|v'[0-9]*)
          hook_deny "Blocked: deleting a tag on the remote changes what a release points at. Ask the user." ;;
      esac
    fi
    destination="${destination##*:}"
    case "$destination" in
      HEAD | @ | '$(git branch --show-current)' | '$(git rev-parse --abbrev-ref HEAD)' | '$(git symbolic-ref --short HEAD)')
        find_branch "$dir"
        destination="$BRANCH"
        ;;
      refs/tags/*) continue ;;
      *'$'* | *'`'* | *'*'* | *'?'* | *'{'*)
        hook_deny "Blocked: the push target $destination can't be checked against the protected branches ($KIT_PROTECTED_BRANCHES). Write the branch name out: git push -u origin <branch>." ;;
    esac
    is_protected_branch "$destination" &&
      hook_deny "Blocked: never push to a protected branch ($KIT_PROTECTED_BRANCHES). Push only the task branch: git push -u origin <branch>."
  done
  return 0
}

# Syncing a protected branch with its own remote is fine; bringing another branch into it is not.
git_pull() {
  local dir="$1" positionals=() k count
  shift
  while [ $# -gt 0 ]; do
    case "$1" in
      -s | -X | --strategy | --strategy-option | --depth | --upload-pack) [ $# -gt 1 ] && shift ;;
      -*) ;;
      *) positionals+=("$1") ;;
    esac
    shift
  done
  count=${#positionals[@]}
  [ "$count" -ge 2 ] || return 0
  find_branch "$dir"
  is_protected_branch "$BRANCH" || return 0
  for ((k = 1; k < count; k++)); do
    case "${positionals[$k]}" in
      "$BRANCH" | "refs/heads/$BRANCH" | "$BRANCH:$BRANCH") ;;
      *) hook_deny "Blocked: pulling ${positionals[$k]} into $BRANCH is a merge into a protected branch ($KIT_PROTECTED_BRANCHES), the user's job. Work on the task branch." ;;
    esac
  done
}

git_rebase() {
  local dir="$1" positionals=() resuming="" value
  shift
  while [ $# -gt 0 ]; do
    value=""
    case "$1" in
      --abort | --quit | --continue | --skip) resuming=1 ;;
      --onto | --strategy | --strategy-option | -s | -X) [ $# -gt 1 ] && shift ;;
      --ex*=*) value="${1#*=}" ;;
      --ex*) if [ $# -gt 1 ]; then shift; value="$1"; fi ;;
      --*) ;;
      -*)
        if short_flag "$1" x "sXC"; then
          value="${1#*x}"
          if [ -z "$value" ] && [ $# -gt 1 ]; then shift; value="$1"; fi
        fi
        ;;
      *) positionals+=("$1") ;;
    esac
    if [ -n "$value" ]; then
      local saved="$CWD"
      CWD="$dir"
      scan_text "$value"
      CWD="$saved"
    fi
    shift
  done
  [ -n "$resuming" ] && return 0
  if [ ${#positionals[@]} -ge 2 ] && is_protected_branch "${positionals[1]}"; then
    hook_deny "Blocked: never rebase a protected branch ($KIT_PROTECTED_BRANCHES)."
  fi
  [ ${#positionals[@]} -ge 1 ] || return 0
  find_branch "$dir"
  is_protected_branch "$BRANCH" || return 0
  case "${positionals[0]}" in
    "$BRANCH" | */"$BRANCH" | '@{u}' | '@{upstream}') ;;
    *) hook_deny "Blocked: rebasing $BRANCH onto ${positionals[0]} changes a protected branch ($KIT_PROTECTED_BRANCHES). Work on the task branch." ;;
  esac
}

# checkout/switch to <target>: what the following commands of this line run on.
note_switch() { # <dir> <target> <created: 1 or empty>
  local dir="$1" target="$2" created="$3"
  if [ "$target" = "-" ]; then
    target="$(git -C "$dir" rev-parse --abbrev-ref '@{-1}' 2>/dev/null </dev/null)"
  fi
  [ -n "$target" ] || return 0
  if is_protected_branch "$target"; then
    STICKY_DIR="$dir"
    STICKY_BRANCH="${target#refs/heads/}"
    CHAINED_BRANCH=""
    return 0
  fi
  # Leaving a protected branch counts only if the rest of the line can't run when the switch fails.
  case "$JOINED_BY" in '||' | '|') return 0 ;; esac
  [ "$FOLLOWED_BY" = "&&" ] || return 0
  find_branch "$dir"
  is_protected_branch "$BRANCH" || return 0
  if [ -z "$created" ]; then
    is_dynamic "$target" && return 0
    git -C "$dir" rev-parse -q --verify "$target^{commit}" >/dev/null 2>&1 </dev/null ||
      git -C "$dir" rev-parse -q --verify "refs/remotes/origin/$target" >/dev/null 2>&1 </dev/null || return 0
  fi
  CHAINED_DIR="$dir"
  CHAINED_BRANCH="$target"
}

check_discard_all() { # <dir> <verb> <pathspec> [path: the word can only be a path]
  local all="" spec folder
  expand_project "$3"
  spec="$EXPANDED"
  case "$spec" in
    . | ./ | :/ | ':/*' | '*' | ':(top)' | :) all=1 ;;
    .* | /* | *..*)
      if ! is_dynamic "$spec"; then
        resolve_path "$1" "$spec"
        [ "$RESOLVED" = "$HOOK_ROOT" ] || [ "$RESOLVED" = "$ROOT_REAL" ] && all=1
      fi
      ;;
  esac
  if [ -z "$all" ] && [ -n "${4:-}" ] && [ -n "$GIT_EXTRAS" ] && ! is_dynamic "$spec"; then
    case "$spec" in '**' | '**/*') all=1 ;; esac
    resolve_path "$1" "$spec"
    locate "$RESOLVED"
    if [ "$PLACE" = inside ]; then
      for folder in ${SOURCE_FOLDERS[@]+"${SOURCE_FOLDERS[@]}"}; do [ "$INSIDE_REL" = "$folder" ] && all=1; done
    fi
  fi
  [ -n "$all" ] &&
    hook_deny "Blocked: \`git $2 $3\` throws away every uncommitted change there. Restore the specific files you changed, or ask the user."
  return 0
}

# git checkout/restore can put an older, looser copy of the kit's own files back.
check_restored() { # <dir> <path>
  local saved="$CWD"
  CWD="$1"
  check_write_target "$2" restore
  CWD="$saved"
}

git_checkout() {
  local dir="$1" created="" paths="" positionals=() arg
  shift
  while [ $# -gt 0 ]; do
    arg="$1"
    shift
    if [ -n "$paths" ]; then
      # With a commit named before --, one path at a time is a normal restore; a whole source folder is not.
      check_discard_all "$dir" checkout "$arg" path
      check_restored "$dir" "$arg"
      continue
    fi
    case "$arg" in
      --) paths=1 ;;
      --orphan) if [ $# -gt 0 ]; then created="$1"; shift; fi ;;
      --orphan=*) created="${arg#*=}" ;;
      --*)
        long_option "$arg" --force --f &&
          hook_deny "Blocked: \`git checkout --force\` throws away uncommitted work. Commit it or ask the user." ;;
      -?*)
        short_flag "$arg" f bB &&
          hook_deny "Blocked: \`git checkout -f\` throws away uncommitted work. Commit it or ask the user."
        if short_flag "$arg" b B; then
          created="${arg#*b}"
          if [ -z "$created" ] && [ $# -gt 0 ]; then created="$1"; shift; fi
        elif short_flag "$arg" B b; then
          created="${arg#*B}"
          if [ -z "$created" ] && [ $# -gt 0 ]; then created="$1"; shift; fi
          is_protected_branch "$created" && hook_deny "Blocked: never reset a protected branch ($KIT_PROTECTED_BRANCHES) with checkout -B."
        fi
        ;;
      *)
        check_discard_all "$dir" checkout "$arg"
        positionals+=("$arg")
        ;;
    esac
  done
  if [ ${#positionals[@]} -gt 1 ]; then
    for arg in "${positionals[@]:1}"; do check_restored "$dir" "$arg"; done
  fi
  if [ -n "$created" ]; then
    note_switch "$dir" "$created" 1
  elif [ -z "$paths" ] && [ ${#positionals[@]} -eq 1 ]; then
    note_switch "$dir" "${positionals[0]}" ""
  fi
}

git_switch() {
  local dir="$1" created="" reset="" target="" arg
  shift
  while [ $# -gt 0 ]; do
    arg="$1"
    shift
    case "$arg" in
      --create | --orphan) if [ $# -gt 0 ]; then created="$1"; shift; fi ;;
      --force-create) if [ $# -gt 0 ]; then created="$1"; reset=1; shift; fi ;;
      --create=* | --orphan=*) created="${arg#*=}" ;;
      --force-create=*) created="${arg#*=}"; reset=1 ;;
      --*)
        if long_option "$arg" --discard-changes --di || long_option "$arg" --force --f; then
          hook_deny "Blocked: \`git switch $arg\` throws away uncommitted work. Commit it or ask the user."
        fi
        ;;
      -?*)
        short_flag "$arg" f cC &&
          hook_deny "Blocked: \`git switch -f\` throws away uncommitted work. Commit it or ask the user."
        if short_flag "$arg" c C; then
          created="${arg#*c}"
          if [ -z "$created" ] && [ $# -gt 0 ]; then created="$1"; shift; fi
        elif short_flag "$arg" C c; then
          created="${arg#*C}"
          reset=1
          if [ -z "$created" ] && [ $# -gt 0 ]; then created="$1"; shift; fi
        fi
        ;;
      *) [ -n "$target" ] || target="$arg" ;;
    esac
  done
  [ -n "$reset" ] && is_protected_branch "$created" &&
    hook_deny "Blocked: never reset a protected branch ($KIT_PROTECTED_BRANCHES) with switch -C."
  if [ -n "$created" ]; then note_switch "$dir" "$created" 1; else note_switch "$dir" "$target" ""; fi
}

git_restore() {
  local dir="$1" staged="" worktree="" specs=() arg ended=""
  shift
  while [ $# -gt 0 ]; do
    arg="$1"
    shift
    if [ -n "$ended" ]; then specs+=("$arg"); continue; fi
    case "$arg" in
      --) ended=1 ;;
      -s | --source) [ $# -gt 0 ] && shift ;;
      --*)
        long_option "$arg" --staged --st && staged=1
        long_option "$arg" --worktree --w && worktree=1
        ;;
      -?*)
        short_flag "$arg" S s && staged=1
        short_flag "$arg" W s && worktree=1
        ;;
      *) specs+=("$arg") ;;
    esac
  done
  [ -n "$staged" ] && [ -z "$worktree" ] && return 0
  for arg in ${specs[@]+"${specs[@]}"}; do
    check_discard_all "$dir" restore "$arg" path
    check_restored "$dir" "$arg"
  done
}

git_branch() {
  local arg deleting="" forcing="" moving="" copying="" positionals=()
  for arg in "$@"; do
    case "$arg" in
      --*)
        long_option "$arg" --delete --de && deleting=1
        long_option "$arg" --force --forc && forcing=1
        long_option "$arg" --move --mo && moving=1
        long_option "$arg" --copy --cop && copying=1
        ;;
      -?*)
        short_flag "$arg" d u && deleting=1
        short_flag "$arg" D u && deleting=1
        short_flag "$arg" f u && forcing=1
        short_flag "$arg" M u && moving=1
        short_flag "$arg" m u && moving=1
        short_flag "$arg" C u && moving=1
        short_flag "$arg" c u && copying=1
        ;;
      *) positionals+=("$arg") ;;
    esac
  done
  [ ${#positionals[@]} -gt 0 ] || return 0
  if [ -n "$deleting$moving" ]; then
    for arg in "${positionals[@]}"; do
      is_protected_branch "$arg" && hook_deny "Blocked: never delete or overwrite a protected branch ($KIT_PROTECTED_BRANCHES)."
    done
  elif [ -n "$copying" ]; then
    # A copy of main is a backup; a copy onto main overwrites it.
    is_protected_branch "${positionals[$((${#positionals[@]} - 1))]}" &&
      hook_deny "Blocked: never delete or overwrite a protected branch ($KIT_PROTECTED_BRANCHES)."
  elif [ -n "$forcing" ] && is_protected_branch "${positionals[0]}"; then
    hook_deny "Blocked: never move a protected branch ($KIT_PROTECTED_BRANCHES) with branch -f."
  fi
}

git_config() {
  local reads="" writes="" key="" value="" has_value="" arg unsetting=""
  while [ $# -gt 0 ]; do
    arg="$1"
    shift
    case "$arg" in
      -f | --file | --blob | --type | --default | --comment | --value) [ $# -gt 0 ] && shift ;;
      --get* | -l | --list) reads=1 ;;
      --unset*) writes=1; unsetting=1 ;;
      --add | --replace-all) writes=1 ;;
      -*) ;;
      *)
        if [ -z "$key" ]; then
          case "$arg" in
            get | list) reads=1 ;;
            set) writes=1 ;;
            unset) writes=1; unsetting=1 ;;
            *) key="$arg" ;;
          esac
        elif [ -z "$has_value" ]; then
          value="$arg"
          has_value=1
        fi
        ;;
    esac
  done
  [ -n "$key" ] && [ -z "$reads" ] && [ -n "$writes$has_value" ] || return 0
  shopt -s nocasematch
  local kind=""
  case "$key" in
    core.hookspath | hook.*) kind=hooks ;;
    alias.*) kind=alias ;;
  esac
  shopt -u nocasematch
  if [ "$kind" = hooks ]; then deny_hook_skip "changing $key"; fi
  if [ -z "$unsetting" ]; then
    local setting="$key"
    [ -n "$has_value" ] && setting="$key=$value"
    is_push_config "$setting" && hook_deny "Blocked: setting $key redirects where a push goes. Ask the user to change it."
    [ -n "$GIT_EXTRAS" ] && is_exec_config "$setting" && hook_deny "Blocked: setting $key makes git run another program. Ask the user to change it."
  fi
  if [ "$kind" = alias ] && [ -n "$value" ]; then
    case "$value" in
      '!'*) scan_text "${value#!}" ;;
      *) scan_text "git $value" ;;
    esac
  fi
  return 0
}

# --- GitHub ------------------------------------------------------------------------------------

check_gh() {
  local positionals=() arg
  local all=("$@")
  while [ $# -gt 0 ]; do
    case "$1" in
      -R | --repo) [ $# -gt 1 ] && shift ;;
      -*) ;;
      *) positionals+=("$1") ;;
    esac
    shift
  done
  [ ${#positionals[@]} -gt 0 ] || return 0
  if [ -n "$REMOTE_WRITES" ]; then
    case "${positionals[0]} ${positionals[1]:-}" in
      'repo delete' | 'repo archive' | 'repo rename' | 'repo edit' | 'repo sync' | 'release create' | 'release delete' | 'release upload' | 'release edit' | \
        'secret set' | 'secret delete' | 'secret remove' | 'variable set' | 'variable delete' | 'workflow run' | 'workflow disable' | 'workflow enable' | 'ruleset delete')
        hook_deny "Blocked: \`gh ${positionals[0]} ${positionals[1]}\` changes the remote repository, its releases or its secrets. Ask the user." ;;
    esac
  fi
  case "${positionals[0]} ${positionals[1]:-}" in
    'pr create' | 'pr new' | 'pr merge') deny_pull_request ;;
    'alias set')
      if [ ${#positionals[@]} -ge 4 ]; then
        case "${positionals[3]}" in '!'*) scan_text "${positionals[3]#!}" ;; *) scan_text "gh ${positionals[3]}" ;; esac
      fi
      ;;
  esac
  [ "${positionals[0]}" = api ] || return 0

  local method="" fields="" endpoint="" graphql="" unreadable="" previous="" texts=""
  for arg in "${all[@]}"; do
    case "$previous" in
      -X | --method) method="$arg" ;;
      -F | --field) case "$arg" in query=@*) unreadable=1 ;; esac ;;
    esac
    case "$arg" in
      -F*query=@* | --field=query=@*) unreadable=1 ;;
      'query=$'* | '-fquery=$'* | '-Fquery=$'* | '--field=query=$'* | '--raw-field=query=$'*) unreadable=1 ;;
    esac
    case "$arg" in
      -X?*) method="${arg#-X}"; method="${method#=}" ;;
      --method=*) method="${arg#*=}" ;;
      -f* | -F* | --field* | --raw-field*) fields=1 ;;
      --input*) fields=1; unreadable=1 ;;
      graphql | /graphql) graphql=1 ;;
      */pulls | */pulls/* | */pulls\?* | */merges | */merge) endpoint=1 ;;
    esac
    texts="$texts $arg"
    previous="$arg"
  done
  if [ -n "$graphql" ]; then
    [ -n "$unreadable" ] &&
      hook_deny "Blocked: a GraphQL request whose query comes from a file or a variable can't be checked. Pass the query inline."
    for arg in ${SEG_STDIN[@]+"${SEG_STDIN[@]}"}; do texts="$texts $arg"; done
    case "$texts" in
      *createPullRequest* | *mergePullRequest* | *enablePullRequestAutoMerge* | *enqueuePullRequest* | *mergeBranch*) deny_pull_request ;;
    esac
    if [ -n "$REMOTE_WRITES" ]; then
      case "$texts" in
        *updateRef* | *createRef* | *deleteRef* | *createCommitOnBranch* | *BranchProtectionRule\(* | *deleteRepository*)
          hook_deny "Blocked: this GraphQL mutation writes refs, commits or branch rules on the remote. Ask the user." ;;
      esac
    fi
    return 0
  fi
  if [ -n "$REMOTE_WRITES" ]; then
    case "$method" in
      [Dd][Ee][Ll][Ee][Tt][Ee]) hook_deny "Blocked: this \`gh api\` call deletes something on the remote. Ask the user." ;;
    esac
    case "$texts" in
      *' repos/'*/git/refs* | *'/git/refs'* | *'/contents/'* | *'/merge-upstream'* | *'/releases'* | *'/actions/secrets'* | *'/actions/variables'* | *'/branches/'*'/protection'* | *'/rulesets'* | *updateRef* | *createRef* | *deleteRef*)
        case "$method" in
          [Pp][Oo][Ss][Tt] | [Pp][Uu][Tt] | [Pp][Aa][Tt][Cc][Hh] | [Dd][Ee][Ll][Ee][Tt][Ee]) hook_deny "Blocked: this \`gh api\` call writes refs, releases, secrets or branch rules on the remote. Ask the user." ;;
          '') [ -n "$fields" ] && hook_deny "Blocked: this \`gh api\` call writes refs, releases, secrets or branch rules on the remote. Ask the user." ;;
        esac
        ;;
    esac
  fi
  [ -n "$endpoint" ] || return 0
  case "$method" in
    [Pp][Oo][Ss][Tt] | [Pp][Uu][Tt] | [Pp][Aa][Tt][Cc][Hh]) deny_pull_request ;;
    '') [ -n "$fields" ] && deny_pull_request ;;
  esac
  return 0
}

check_github_request() {
  local arg endpoint="" writes="" graphql="" body="" mutation="" previous=""
  for arg in "$@"; do
    case "$arg" in
      *api.github.com*/pulls* | *api.github.com*/merge*) endpoint=1 ;;
      *api.github.com/graphql*) graphql=1 ;;
    esac
    case "$arg" in
      -d* | --data* | --json* | -F* | --form* | -T* | --upload-file* | -XPOST | -XPUT | -XPATCH | POST | PUT | PATCH | --request=P* | --method=P* | --post-*) writes=1 ;;
      --*) ;;
      -[!-]*XP*) writes=1 ;;
    esac
    case "$arg" in @* | -d@* | -T?* | --data*=@* | --json=@*) body=1 ;; esac
    case "$previous" in -T | --upload-file | --post-file) body=1 ;; esac
    case "$arg" in *mutation*) mutation=1 ;; esac
    previous="$arg"
  done
  if [ -n "$endpoint" ] && [ -n "$writes" ]; then deny_pull_request; fi
  if [ -n "$graphql" ] && [ -n "$writes" ]; then
    if [ -n "$body$mutation" ]; then deny_pull_request; fi
  fi
  return 0
}

# --- rm and find -delete -----------------------------------------------------------------------

is_temp_path() {
  case "$1" in
    /tmp/?* | /private/tmp/?* | /var/folders/?* | /private/var/folders/?*) return 0 ;;
  esac
  [ -n "${TMPDIR:-}" ] && case "$1" in "${TMPDIR%/}"/?*) return 0 ;; esac
  return 1
}

check_delete() { # <verb> <target>
  local verb="$1" target="$2" rel first name
  [ "$SECONDS" -lt "$TIME_LIMIT" ] || deny_too_long
  if [ -n "$IN_TRAP" ]; then
    # A trap that removes what mktemp made in this command.
    for name in $TEMP_VARS; do
      case "$target" in "\$$name" | "\${$name}") return 0 ;; esac
    done
  fi
  case "$target" in
    "$PROJECT_VAR"* | "$PROJECT_VAR_BRACED"*)
      hook_deny "Blocked: \`$verb $target\`: the Bash tool does not define CLAUDE_PROJECT_DIR, so this could delete from / instead of the project. Use a literal path inside the project." ;;
    *'$'* | *'`'* | '~'[!/]*)
      hook_deny "Blocked: \`$verb\` with a variable or computed path can't be checked. Use a literal path inside the project or the scratchpad." ;;
  esac
  case "$CWD" in
    "$UNKNOWN_DIR" | "$UNKNOWN_DIR"/*)
      case "$target" in
        /* | '~'*) ;;
        *) hook_deny "Blocked: \`$verb $target\` after a cd to a computed path could be outside the project and the temp folders. Use a literal path, or cd to a literal folder." ;;
      esac
      ;;
  esac
  resolve_path "$CWD" "$target"
  locate "$RESOLVED"
  case "$PLACE" in
    root) hook_deny "Blocked: \`$verb $target\` deletes the whole project." ;;
    outside)
      is_temp_path "$RESOLVED" ||
        hook_deny "Blocked: \`$verb $target\` is outside the project and the temp folders ($RESOLVED). Ask the user to do it."
      return 0
      ;;
  esac
  rel="$INSIDE_REL"
  case "$rel" in
    .claude/worktrees | .claude/worktrees/*)
      case "$rel" in
        .claude/worktrees/*/*) rel="${rel#.claude/worktrees/}"; rel="${rel#*/}" ;;
        *) hook_deny "Blocked: \`$verb $target\` deletes another checkout with its uncommitted work. Use \`git worktree remove <path>\`, or ask the user." ;;
      esac
      ;;
  esac
  first="${rel%%/*}"
  case "$verb:$rel" in
    rimraf:'*.'* | del:'*.'*)
      # A clean-up of generated files by extension, the same as rm -f *.log.
      case "${rel#??}" in '' | *[!A-Za-z0-9.]*) ;; *) return 0 ;; esac
      ;;
  esac
  case "$first" in *'*'* | *'?'* | *'{'* | *'['*)
    hook_deny "Blocked: \`$verb $target\` would delete the project's top-level folders." ;;
  esac
  shopt -s nocasematch
  local blocked=""
  case "$first" in .git) blocked=git ;; esac
  case "$rel" in
    "$first" | "$first"/'*' | "$first"/'**' | "$first"/'.*' | "$first"/'**/*')
      case "$PROTECTED_TOP_LEVEL" in *" $first "*) blocked=${blocked:-top} ;; esac ;;
  esac
  shopt -u nocasematch
  case "$blocked" in
    top) hook_deny "Blocked: \`$verb $target\` deletes the project's $first/ folder. Delete only the files you created, or ask the user." ;;
    git) hook_deny "Blocked: never delete anything inside .git/." ;;
  esac
  return 0
}

# --- Shell writes: the file rules of guard-paths.sh for the commands that name their target ---------------

deny_write() { # <what>
  hook_deny "Blocked: a shell write into $1. Tell the user what should change instead of making it."
}

# check_write_target <word> <write|edit|delete|restore>
#   write    a redirect, cp, mv, ln, tee …: the file rules
#   edit     the same, and generated files too (sed -i, echo > file): their generators write by redirect
#   delete   rm, unlink, mv's sources: not lockfiles and git's own *.lock files
#   restore  git checkout/restore: only the kit's own protections
check_write_target() {
  local word kind="$2" path part
  [ "$SECONDS" -lt "$TIME_LIMIT" ] || deny_too_long
  expand_project "$1"
  word="$EXPANDED"
  case "$word" in '' | - | /dev/* | *'$'* | *'`'*) return 0 ;; esac
  case "$word" in *[!0-9-]*) ;; *) return 0 ;; esac # >&2
  known_dir "$CWD"
  resolve_path "$KNOWN" "$word"
  path="$RESOLVED"
  judge_write "$path" "$kind"
  case "$kind" in write | edit) ;; *) return 0 ;; esac
  # Written through a link, the file it points at is what changes.
  part="$path"
  while [ -n "$part" ] && [ "$part" != "$HOOK_ROOT" ] && [ "$part" != "$ROOT_REAL" ]; do
    if [ -L "$part" ]; then
      judge_write "$(hook_physical_path "$path")" "$kind"
      break
    fi
    part="${part%/*}"
  done
  return 0
}

judge_write() { # <resolved path> <kind>
  local kind="$2" rel base glob verdict="" home="${HOME:-/nonexistent}"
  case "$1" in
    "$home"/.claude/settings.json | "$home"/.claude/settings.local.json)
      hook_ask_later "this command writes ~${1#"$home"}, where the hooks can be switched off."
      return 0 ;;
    "$home"/.claude/plugins/cache/* | "$home"/.claude/plugins/marketplaces/* | "$home"/.claude/plugins/installed_plugins.json)
      hook_ask_later "this command writes into the installed plugins (~${1#"$home"}), where the guards themselves live."
      return 0 ;;
  esac
  locate "$1"
  [ "$PLACE" = inside ] || return 0
  rel="$INSIDE_REL"
  case "$rel" in .claude/worktrees/*/*) rel="${rel#.claude/worktrees/}"; rel="${rel#*/}" ;; esac
  base="${rel##*/}"
  shopt -s nocasematch
  case "$rel" in
    .claude/frontend-kit.json | .claude/settings.json | .claude/settings.local.json) verdict=ask ;;
    .claude) [ "$kind" = delete ] && verdict=ask ;;
    .claude/state | .claude/state/*) case "$kind" in write | edit) [ -n "$INTEGRITY" ] && verdict=state ;; esac ;;
    .husky | .husky/* | lefthook.yml | lefthook.yaml | .lefthook | .lefthook/*) [ "$kind" != restore ] && [ -n "$INTEGRITY" ] && verdict=state ;;
  esac
  if [ -z "$verdict" ] && [ "$kind" != restore ]; then
    case "/$rel" in
      */.git | */.git/*)
        verdict=git
        if [ "$kind" = delete ]; then case "$base" in *.lock) verdict=none ;; esac; fi
        ;;
    esac
    case "$base" in
      package-lock.json | npm-shrinkwrap.json | pnpm-lock.yaml | yarn.lock | bun.lock | bun.lockb | deno.lock | .pnp.cjs | .pnp.loader.mjs)
        # Removing a lockfile to let the package manager write it again is a normal clean install.
        if [ "$kind" = delete ]; then verdict=none; else verdict=lock; fi ;;
    esac
    if [ -z "$verdict" ]; then
      for glob in ${PROTECTED_GLOBS[@]+"${PROTECTED_GLOBS[@]}"}; do
        # shellcheck disable=SC2254 # the glob from the config
        case "$rel" in $glob | $glob/*) verdict=protected; break ;; esac
      done
    fi
    if [ -z "$verdict" ] && [ "$kind" = edit ]; then
      for glob in ${GENERATED_GLOBS[@]+"${GENERATED_GLOBS[@]}"}; do
        # shellcheck disable=SC2254 # the glob from the config
        case "$rel" in $glob | $glob/*) verdict=generated; break ;; esac
      done
    fi
  fi
  shopt -u nocasematch
  case "$verdict" in
    ask) hook_ask_later "this command writes $rel, which holds the kit's protections." ;;
    state) deny_write "$rel, which is guard state or a git hook" ;;
    git) deny_write "$rel, inside .git/" ;;
    lock) hook_deny "Blocked: $base is written by the package manager. Change package.json and run the install, or ask the user." ;;
    protected) deny_write "$rel, which is deploy config owned outside this task (protectedPaths in .claude/frontend-kit.json)" ;;
    generated) hook_deny "Blocked: $rel is generated (generatedPaths in .claude/frontend-kit.json). Change its source and run the generator instead." ;;
  esac
  return 0
}

check_redirects() {
  local arg kind=write producer="${SEG_WORDS[0]:-}"
  case "${producer##*/}" in echo | printf | cat) kind=edit ;; esac
  for arg in ${SEG_WRITES[@]+"${SEG_WRITES[@]}"}; do check_write_target "$arg" "$kind"; done
}

# cp, mv and ln write their last word, or the folder named with -t.
check_copy() { # <name> <args…>
  local name="$1" into="" files=() arg dest source count k
  shift
  while [ $# -gt 0 ]; do
    case "$1" in
      -t | --target-directory) if [ $# -gt 1 ]; then shift; into="$1"; fi ;;
      --target-directory=*) into="${1#*=}" ;;
      -S | --suffix) [ $# -gt 1 ] && shift ;;
      -?*) ;;
      *) files+=("$1") ;;
    esac
    shift
  done
  count=${#files[@]}
  if [ -n "$into" ]; then
    dest="$into"
  else
    [ "$count" -ge 2 ] || return 0
    dest="${files[$((count - 1))]}"
    count=$((count - 1))
  fi
  check_write_target "$dest" write
  expand_project "$dest"
  arg="$EXPANDED"
  known_dir "$CWD"
  resolve_path "$KNOWN" "$arg"
  local folder=""
  case "$arg" in */ | . | ..) folder=1 ;; esac
  [ -d "$RESOLVED" ] && folder=1
  for ((k = 0; k < count; k++)); do
    source="${files[$k]%/}"
    [ -n "$folder" ] && check_write_target "${dest%/}/${source##*/}" write
    [ "$name" = mv ] && check_write_target "$source" delete
  done
  return 0
}

# sed -i and perl -i edit every file they name.
check_inplace() { # <name> <args…>
  local name="$1" arg inplace=""
  shift
  for arg in "$@"; do
    case "$arg" in
      --in-place*) inplace=1 ;;
      --* | -e* | -f* | -M* | -m*) ;;
      -I*) [ "$name" = perl ] || inplace=1 ;; # sed -I on BSD; perl -I is a folder
      -*i*) inplace=1 ;;
    esac
  done
  [ -n "$inplace" ] || return 0
  for arg in "$@"; do
    case "$arg" in -* | '' | *' '* | *"$NEWLINE"*) ;; *) check_write_target "$arg" edit ;; esac
  done
  return 0
}

check_truncate() {
  local arg previous=""
  for arg in "$@"; do
    case "$arg" in -*) ;; *) case "$previous" in -s | -r | --size | --reference) ;; *) check_write_target "$arg" write ;; esac ;; esac
    previous="$arg"
  done
}

check_chmod() {
  local mode="" arg
  for arg in "$@"; do
    if [ -z "$mode" ]; then
      case "$arg" in -R | -v | -f | -h | --recursive) ;; *) mode="$arg" ;; esac
      continue
    fi
    # Only taking the executable bit away switches a hook off.
    case "$mode" in -*x* | *[ugoa]-*x* | *=r | *=rw | [0246][0-7][0-7] | 0[0246][0-7][0-7]) check_write_target "$arg" edit ;; esac
  done
}

check_rm() {
  local recursive="" ends_options="" arg targets=()
  for arg in "$@"; do
    if [ -z "$ends_options" ]; then
      case "$arg" in
        --) ends_options=1; continue ;;
        --*) long_option "$arg" --recursive --r && recursive=1; continue ;;
        -*) case "$arg" in *[rR]*) recursive=1 ;; esac; continue ;;
      esac
    fi
    targets+=("$arg")
  done
  if [ -n "$recursive" ]; then
    [ -n "$VIA_XARGS" ] &&
      hook_deny "Blocked: \`xargs rm -r\` takes its paths from input, so they can't be checked. Use literal paths."
    for arg in ${targets[@]+"${targets[@]}"}; do check_delete "rm -r" "$arg"; done
  fi
  for arg in ${targets[@]+"${targets[@]}"}; do check_write_target "$arg" delete; done
}

check_find() {
  local roots=() filtered="" deletes="" arg previous=""
  while [ $# -gt 0 ]; do
    case "$1" in
      -H | -L | -P | -E) shift ;;
      -* | '(' | '!') break ;;
      *) roots+=("$1"); shift ;;
    esac
  done
  [ ${#roots[@]} -gt 0 ] || roots=(.)
  for arg in "$@"; do
    case "$arg" in
      -empty | -newer* | -mtime | -mmin | -size | -atime | -ctime | -regex | -iregex) filtered=1 ;;
      -delete) deletes=1 ;;
    esac
    case "$previous" in -name | -iname | -path | -ipath | -wholename) [ "$arg" != '*' ] && filtered=1 ;; esac
    previous="$arg"
  done
  while [ $# -gt 0 ]; do
    case "$1" in
      -exec | -execdir | -ok | -okdir)
        shift
        local inner=()
        while [ $# -gt 0 ]; do
          case "$1" in
            ';' | +) break ;;
            '{}') [ -n "$filtered" ] || inner+=("${roots[@]}") ;;
            *) inner+=("$1") ;;
          esac
          shift
        done
        [ ${#inner[@]} -gt 0 ] && run_words "${inner[@]}"
        ;;
    esac
    [ $# -gt 0 ] && shift
  done
  if [ -n "$deletes" ] && [ -z "$filtered" ]; then
    for arg in "${roots[@]}"; do check_delete "find -delete" "$arg"; done
  elif [ -n "$deletes" ]; then
    # A filter keeps a delete inside the project fine, but not one that starts elsewhere.
    for arg in "${roots[@]}"; do
      case "$arg" in "$PROJECT_VAR"* | "$PROJECT_VAR_BRACED"*)
        hook_deny "Blocked: \`find $arg … -delete\`: the Bash tool does not define CLAUDE_PROJECT_DIR, so this could delete from / instead of the project. Use a literal path." ;;
      esac
      case "$arg" in *'$'* | *'`'*) continue ;; esac
      resolve_path "$CWD" "$arg"
      case "$RESOLVED" in "$HOOK_ROOT" | "$HOOK_ROOT"/* | "$ROOT_REAL" | "$ROOT_REAL"/*) continue ;; esac
      is_temp_path "$RESOLVED" || hook_deny "Blocked: \`find $arg … -delete\` starts outside the project and the temp folders ($RESOLVED). Ask the user to do it."
    done
  fi
  return 0
}

# --- Commands that run other commands ----------------------------------------------------------

change_directory() {
  while [ $# -gt 0 ]; do
    case "$1" in --) shift; break ;; -?*) shift ;; *) break ;; esac
  done
  case "$JOINED_BY" in '||' | '|') return 0 ;; esac
  [ "$FOLLOWED_BY" = '|' ] && return 0
  local target="${1:-${HOME:-/}}" here top
  known_dir "$CWD"
  here="$KNOWN"
  case "$target" in
    '$(git rev-parse --show-toplevel)' | '$(git rev-parse --show-toplevel)'/*)
      top="$(git -C "$here" rev-parse --show-toplevel 2>/dev/null </dev/null)"
      if [ -n "$top" ] && [ "$CWD" = "$here" ]; then
        if [ "$top" = "$ROOT_REAL" ]; then top="$HOOK_ROOT"; fi
        target="$top${target#'$(git rev-parse --show-toplevel)'}"
      fi
      ;;
  esac
  # Where the next command runs is unknown after a cd to a computed path (or back with -): a relative delete
  # is then judged as outside the project, and everything else as if the cd had gone nowhere.
  case "$target" in
    "$PROJECT_VAR" | "$PROJECT_VAR"/* | "$PROJECT_VAR_BRACED" | "$PROJECT_VAR_BRACED"/*)
      expand_project "$target"
      KNOWN_BASE="$EXPANDED"
      CWD="$UNKNOWN_DIR"
      return 0 ;;
    -) KNOWN_BASE="$here"; CWD="$UNKNOWN_DIR"; return 0 ;;
  esac
  if is_dynamic "$target"; then KNOWN_BASE="$here"; CWD="$UNKNOWN_DIR"; return 0; fi
  resolve_path "$here" "$target"
  # A cd that fails leaves the next command where it was, unless && keeps that command from running.
  [ "$FOLLOWED_BY" = "&&" ] || [ -d "$RESOLVED" ] || return 0
  if [ "$CWD" != "$here" ]; then
    # A relative cd from an unknown folder ends in an unknown folder.
    case "$target" in /* | '~'*) CWD="$RESOLVED" ;; *) KNOWN_BASE="$RESOLVED"; CWD="$UNKNOWN_DIR" ;; esac
  else
    CWD="$RESOLVED"
  fi
}

# $(curl …) or <(curl …) where code is expected.
check_downloaded_code() {
  [ -n "$PIPED_CODE" ] || return 0
  local arg
  for arg in "$@"; do
    case "$arg" in
      '$(curl '* | '$(wget '* | '$(fetch '* | '$(http '* | '$(https '* | '$(xh '*)
        hook_deny "Blocked: running what was just downloaded (bash <(curl …), sh -c \"\$(curl …)\") can't be checked. Download the script, read it, then run the file." ;;
    esac
  done
  return 0
}

# Does this interpreter take its code from stdin? (no script file and no code option)
reads_code_from_stdin() { # <name> <args…>
  local name="$1" arg options
  shift
  for arg in "$@"; do
    case "$arg" in
      -) return 0 ;;
      --eval* | --print* | --check | --version | --help | --test* | --run*) return 1 ;;
      -- | --*) ;;
      -?*)
        case "$name" in
          python | python3) options='[cmVh]' ;;
          perl | ruby) options='[eEvh]' ;;
          php) options='[rvhlfm]' ;;
          *) options='[epvhc]' ;;
        esac
        # shellcheck disable=SC2254 # the set of letters that carry the code
        case "${arg#-}" in *$options*) return 1 ;; esac
        ;;
      *) return 1 ;;
    esac
  done
  return 0
}

check_interpreter() { # <name> <args…>
  [ -n "$PIPED_CODE" ] || return 0
  reads_code_from_stdin "$@" || return 0
  if [ ${#SEG_STDIN[@]} -gt 0 ]; then return 0; fi
  [ "$JOINED_BY" = '|' ] || [ -n "$PIPE_IN" ] || return 0
  if [ "$JOINED_BY" = '|' ] && [ -z "$PIPED_UNKNOWN" ]; then
    # Code written out in the command, or a file of the project: the same as node -e or node <file>.
    if [ -n "$PIPED_FILE" ] || [ ${#PIPED[@]} -gt 0 ]; then return 0; fi
  fi
  hook_deny "Blocked: \`$1\` would run code piped into it, which can't be checked. Write the code to a file and read it first."
}

check_shell() {
  local with_c=""
  while [ $# -gt 0 ]; do
    case "$1" in
      --) shift; break ;;
      -o | -O | +o | +O | --rcfile | --init-file) shift ;;
      --*) ;;
      -?*)
        case "$1" in *c*) with_c=1 ;; esac
        case "$1" in *o | *O) shift ;; esac
        ;;
      +?*) ;;
      *) break ;;
    esac
    [ $# -gt 0 ] && shift
  done
  if [ -n "$with_c" ]; then
    if [ $# -gt 0 ]; then check_downloaded_code "$1"; scan_text "$1"; fi
    return 0
  fi
  [ $# -gt 0 ] && check_downloaded_code "$1"
  case "${1:-}" in '' | - | /dev/stdin) scan_stdin ;; esac
  return 0
}

# A shell that reads its code from stdin: heredocs, here-strings and what is piped into it.
scan_stdin() {
  local text
  for text in ${SEG_STDIN[@]+"${SEG_STDIN[@]}"}; do scan_text "$text"; done
  for text in ${PIPED[@]+"${PIPED[@]}"}; do scan_text "$text"; done
  [ -n "$PIPED_CODE" ] && [ ${#SEG_STDIN[@]} -eq 0 ] || return 0
  # Code piped in from a download, a computed text or any other program can't be read here.
  if [ "$JOINED_BY" = '|' ] && [ ${#PIPED[@]} -gt 0 ] && [ -z "$PIPED_UNKNOWN" ]; then return 0; fi
  if [ "$JOINED_BY" = '|' ] || [ -n "$PIPE_IN" ]; then
    hook_deny "Blocked: a shell that runs whatever is piped into it (curl … | sh, base64 -d | sh) can't be checked. Download the script, read it, then run the file."
  fi
  return 0
}

check_ssh() {
  while [ $# -gt 0 ]; do
    case "$1" in
      -[pilFoJLRDbcEeISWwmOQB]) shift ;;
      -*) ;;
      *) break ;;
    esac
    [ $# -gt 0 ] && shift
  done
  if [ $# -gt 1 ]; then shift; scan_text "$*"; fi
  return 0
}

deny_computed_name() {
  hook_deny "Blocked: the command name \"$1\" is computed, so it can't be checked. Write the command out."
}

# A command name made of a variable, a substitution, a glob or braces. Returns 0 when it judged the command.
judge_command_name() { # <the words from the name on>
  local word="$1" base="${1##*/}" last variable value quoted="" quote="'" escaped="'\\''" arg
  case "$word" in
    '{'*,*'}') case "$word" in *[' *']*) ;; *) [ -n "$IN_ARRAY" ] || deny_computed_name "$word" ;; esac; return 1 ;;
    *'$'* | *'`'*) ;;
    */*)
      case "$word" in *[*?]*) ;; *) return 1 ;; esac
      if [ $# -gt 1 ] && [ -z "$IN_ARRAY" ]; then
        for last in "$@"; do :; done
        [ "$last" = ']]' ] || deny_computed_name "$word"
      fi
      return 1 ;;
    *) return 1 ;;
  esac
  [ -z "$IN_ARRAY" ] || return 1
  case "$word" in *'${IFS'* | *'$IFS'*) deny_computed_name "$word" ;; esac
  case "$word" in
    *')' | *'}' | *'`') ;;
    *) case "$base" in *'$'[A-Za-z_{\(]*) ;; *) return 1 ;; esac ;; # $(npm bin)/tsc is tsc
  esac
  shift
  variable="$word"
  case "$variable" in
    '${'*'}') variable="${variable#??}"; variable="${variable%?}" ;;
    '$'*) variable="${variable#?}" ;;
  esac
  case "$variable" in
    '' | *[!A-Za-z0-9_]*) ;;
    EDITOR | VISUAL | PAGER | BROWSER) return 1 ;;
    SHELL) run_words sh "$@"; return 0 ;;
    *)
      case "$LITERAL_VARS" in
        *"$NEWLINE$variable=\$$NEWLINE"*) ;; # set to something that isn't known
        *"$NEWLINE$variable="*)
          value="${LITERAL_VARS##*"$NEWLINE$variable="}"
          value="${value%%"$NEWLINE"*}"
          case "$value" in
            '') ;;
            *' '*)
              for arg in "$@"; do quoted="$quoted '${arg//$quote/$escaped}'"; done
              scan_text "$value$quoted"
              return 0 ;;
            *) run_words "$value" "$@"; return 0 ;;
          esac
          ;;
      esac
      ;;
  esac
  if [ $# -gt 0 ]; then
    for last in "$@"; do :; done
    [ "$last" = ']]' ] && return 1
    deny_computed_name "$word"
  fi
  # A name alone is a case pattern or a function's "$@"; one that prints a whole command is not.
  case "$word" in '$(echo '* | '$(printf '*) deny_computed_name "$word" ;; esac
  return 1
}

# The folder env -C or sudo -D runs one command in. Sets ENTERED and, for what is judged by more than its deletes,
# ENTERED_BASE, as a cd there would.
enter_dir() {
  known_dir "$CWD"
  ENTERED="$UNKNOWN_DIR"
  ENTERED_BASE="$KNOWN"
  expand_project "$1"
  is_dynamic "$EXPANDED" && return 0
  resolve_path "$KNOWN" "$EXPANDED"
  ENTERED_BASE="$RESOLVED"
  is_dynamic "$1" && return 0
  if [ "$CWD" != "$KNOWN" ]; then
    case "$1" in /* | '~'*) ;; *) return 0 ;; esac
  fi
  ENTERED="$RESOLVED"
}

# One simple command: strips what doesn't change what runs, then judges the command itself.
run_words() {
  local name="" request_vars="" VIA_XARGS="$VIA_XARGS" VIA_RUNNER="" HOOKS_SKIPPED="$HOOKS_SKIPPED" word
  while [ $# -gt 0 ]; do
    if [[ "$1" =~ $ASSIGNMENT_RE ]]; then
      check_assignment "$1"
      case "$1" in SKIP=?*) HOOKS_SKIPPED=1 ;; esac
      # *SITE_URL variables only name the canonical address written into pages and the sitemap (SEO);
      # they never make a request, so pointing them at the live host is allowed.
      case "${1%%=*}" in
        SITE_URL | *_SITE_URL) ;;
        *) request_vars="$request_vars $1" ;;
      esac
      shift
      continue
    fi
    name="${1##*/}"
    name="${name#\\}"
    name="${name#=}" # zsh: =git
    case "$name" in *[A-Z]*) name="$(printf '%s' "$name" | tr '[:upper:]' '[:lower:]')" ;; esac
    case "$name" in
      if | then | elif | else | fi | do | 'done' | while | until | '!' | '{' | '}' | esac | coproc) shift ;;
      for | select | case | in) return 0 ;;
      function)
        shift
        [ $# -gt 0 ] && shift
        ;;
      builtin | noglob | nocorrect | - | nohup | setsid)
        shift
        while [ $# -gt 0 ]; do case "$1" in --) shift; break ;; -*) shift ;; *) break ;; esac; done
        ;;
      flock)
        shift
        while [ $# -gt 0 ]; do
          case "$1" in
            -c | --command) shift; [ $# -gt 0 ] && scan_text "$1"; return 0 ;;
            -w | -E | --timeout | --conflict-exit-code) shift; [ $# -gt 0 ] && shift ;;
            -*) shift ;;
            *) break ;;
          esac
        done
        [ $# -gt 0 ] && shift # the lock file
        ;;
      watch)
        shift
        while [ $# -gt 0 ]; do case "$1" in -n | --interval) shift; [ $# -gt 0 ] && shift ;; -*) shift ;; *) break ;; esac; done
        [ $# -gt 0 ] && scan_text "$*"
        return 0
        ;;
      script)
        shift
        local scripted=""
        while [ $# -gt 0 ]; do
          case "$1" in
            -c | --command) shift; if [ $# -gt 0 ]; then scan_text "$1"; scripted=1; shift; fi ;;
            --command=*) scan_text "${1#*=}"; scripted=1; shift ;;
            -t | -F | -E | -T | --log-*) shift; [ $# -gt 0 ] && shift ;;
            -[!-]*c) shift; if [ $# -gt 0 ]; then scan_text "$1"; scripted=1; shift; fi ;;
            -*) shift ;;
            *) break ;;
          esac
        done
        [ -n "$scripted" ] && return 0
        [ $# -gt 0 ] && shift # the typescript file
        ;;
      parallel)
        VIA_XARGS=1
        shift
        while [ $# -gt 0 ]; do
          case "$1" in -j | --jobs | --joblog | -S | --sshlogin) shift; [ $# -gt 0 ] && shift ;; -*) shift ;; *) break ;; esac
        done
        ;;
      chrt | taskset)
        shift
        while [ $# -gt 0 ]; do case "$1" in -*) shift ;; *) break ;; esac; done
        [ $# -gt 0 ] && shift # the priority or the mask
        ;;
      arch | xcrun)
        shift
        while [ $# -gt 0 ]; do
          case "$1" in -arch | -sdk | --sdk | --toolchain) shift; [ $# -gt 0 ] && shift ;; -*) shift ;; *) break ;; esac
        done
        ;;
      busybox | mise | direnv | devbox | cross-env | dotenv | pnpm | yarn | bunx | npx | npm | bun)
        # Runners that execute the rest of their line: look through them (npm exec -c 'text', pnpm exec git …).
        case "$name" in
          npm | pnpm | yarn)
            case "${2:-}" in
              exec | x | dlx | run-script) ;;
              *) break ;;
            esac
            ;;
          bun) case "${2:-}" in x) ;; *) break ;; esac ;;
        esac
        # A runner that is a network tool is judged on its whole line, before it is looked through.
        if [ -n "$LIVE_HOSTS_RE" ]; then
          case "$NETWORK_TOOLS" in *" $name "*)
            for word in "$@" ${SEG_TARGETS[@]+"${SEG_TARGETS[@]}"}; do
              has_live_host "$word" &&
                hook_deny "Blocked: never send requests to the live site ($KIT_LIVE_HOSTS). Use local mocks or $KIT_UAT_HOST."
            done
            ;;
          esac
        fi
        if [ "$name" = direnv ] && [ "${2:-}" = exec ] && [ $# -ge 3 ]; then
          shift 3 # direnv exec <folder>
        else
          shift
        fi
        VIA_RUNNER=1
        while [ $# -gt 0 ]; do
          case "$1" in
            -c | --call) shift; [ $# -gt 0 ] && scan_text "$1"; return 0 ;;
            --call=*) scan_text "${1#*=}"; return 0 ;;
            exec | x | dlx | run | -- ) shift ;;
            -p | --package | -e | --env-file | -C | --dir | --prefix | --filter | -w | --workspace) shift; [ $# -gt 0 ] && shift ;;
            -*) shift ;;
            *) break ;;
          esac
        done
        ;;
      trap)
        shift
        if [ $# -gt 0 ]; then
          local IN_TRAP=1
          scan_text "$1"
        fi
        return 0
        ;;
      su)
        for word in "$@"; do :; done
        while [ $# -gt 0 ]; do
          [ "$1" = -c ] && { shift; [ $# -gt 0 ] && scan_text "$1"; return 0; }
          shift
        done
        return 0
        ;;
      command)
        shift
        while [ $# -gt 0 ]; do
          case "$1" in -v | -V) return 0 ;; -*) shift ;; *) break ;; esac
        done
        ;;
      exec)
        shift
        while [ $# -gt 0 ]; do
          case "$1" in -a) shift; [ $# -gt 0 ] && shift ;; -*) shift ;; *) break ;; esac
        done
        ;;
      sudo | doas)
        shift
        while [ $# -gt 0 ]; do
          case "$1" in
            -D | --chdir)
              shift
              if [ $# -gt 0 ]; then
                enter_dir "$1"
                local CWD="$ENTERED" KNOWN_BASE="$ENTERED_BASE"
                shift
              fi
              ;;
            --chdir=*)
              enter_dir "${1#*=}"
              local CWD="$ENTERED" KNOWN_BASE="$ENTERED_BASE"
              shift
              ;;
            -[ughpCRTrt] | --user | --group | --host | --prompt | --chroot) shift; [ $# -gt 0 ] && shift ;;
            -*) shift ;;
            *) break ;;
          esac
        done
        ;;
      env)
        shift
        while [ $# -gt 0 ]; do
          case "$1" in
            -S | --split-string)
              shift
              [ $# -gt 0 ] && scan_text "$*"
              return 0
              ;;
            -S* | --split-string=*)
              word="${1#-S}"
              word="${word#--split-string=}"
              shift
              scan_text "$word $*"
              return 0
              ;;
            -C | --chdir | -[iv0]C | -[iv0][iv0]C)
              shift
              if [ $# -gt 0 ]; then
                # The directory holds for this command only.
                enter_dir "$1"
                local CWD="$ENTERED" KNOWN_BASE="$ENTERED_BASE"
                shift
              fi
              ;;
            --chdir=*)
              enter_dir "${1#*=}"
              local CWD="$ENTERED" KNOWN_BASE="$ENTERED_BASE"
              shift
              ;;
            -u | -P | --unset | -a | --argv0) shift; [ $# -gt 0 ] && shift ;;
            -*) shift ;;
            *) break ;;
          esac
        done
        ;;
      caffeinate)
        shift
        while [ $# -gt 0 ]; do
          case "$1" in -t | -w) shift; [ $# -gt 0 ] && shift ;; -*) shift ;; *) break ;; esac
        done
        ;;
      stdbuf)
        shift
        while [ $# -gt 0 ]; do
          case "$1" in -i | -o | -e | --input | --output | --error) shift; [ $# -gt 0 ] && shift ;; -*) shift ;; *) break ;; esac
        done
        ;;
      ionice)
        shift
        while [ $# -gt 0 ]; do
          case "$1" in -c | -n | -p | --class | --classdata | --pid) shift; [ $# -gt 0 ] && shift ;; -*) shift ;; *) break ;; esac
        done
        ;;
      time)
        shift
        while [ $# -gt 0 ]; do
          # time -p has no value; the others do, and a value is never a command.
          case "$1" in -o | -f | --format | --output) shift; [ $# -gt 0 ] && shift ;; -*) shift ;; *) break ;; esac
        done
        ;;
      nice)
        shift
        while [ $# -gt 0 ]; do
          case "$1" in -n | --adjustment) shift; [ $# -gt 0 ] && shift ;; -*) shift ;; *) break ;; esac
        done
        ;;
      timeout | gtimeout)
        shift
        while [ $# -gt 0 ]; do
          case "$1" in -s | -k | --signal | --kill-after) shift; [ $# -gt 0 ] && shift ;; -*) shift ;; *) break ;; esac
        done
        [ $# -gt 0 ] && shift # the duration
        ;;
      xargs)
        VIA_XARGS=1
        shift
        while [ $# -gt 0 ]; do
          case "$1" in -[IJLnPdEsaRS] | --max-args | --max-procs | --max-chars | --delimiter | --arg-file | --process-slot-var) shift; [ $# -gt 0 ] && shift ;; -*) shift ;; *) break ;; esac
        done
        ;;
      *) break ;;
    esac
    name=""
  done
  if [ -z "$name" ] || [ $# -eq 0 ]; then return 0; fi
  if judge_command_name "$@"; then return 0; fi
  local written="$1"
  shift
  if [ -n "$VIA_RUNNER" ]; then
    case "$written" in
      @changesets/cli | @changesets/cli@*) name=changeset ;;
      @anthropic-ai/claude-code | @anthropic-ai/claude-code@*) name=claude ;;
      *)
        case "$name" in ?*@*) name="${name%%@*}" ;; esac
        case "$name" in netlify-cli) name=netlify ;; firebase-tools) name=firebase ;; del-cli) name=del ;; esac
        ;;
    esac
  fi

  if [ -n "$LIVE_HOSTS_RE" ]; then
    if [ -n "$request_vars" ] && has_live_host "$request_vars"; then
      hook_deny "Blocked: never point a run at the live site ($KIT_LIVE_HOSTS). Use local mocks or $KIT_UAT_HOST."
    fi
    case "$NETWORK_TOOLS" in *" $name "*)
      for word in "$@" ${SEG_TARGETS[@]+"${SEG_TARGETS[@]}"}; do
        has_live_host "$word" &&
          hook_deny "Blocked: never send requests to the live site ($KIT_LIVE_HOSTS). Use local mocks or $KIT_UAT_HOST."
      done
      ;;
    esac
  fi

  check_secret_read "$name" "$@"
  if [ ${#SEG_INPUTS[@]} -gt 0 ]; then check_secret_read '<' "${SEG_INPUTS[@]}"; fi

  case "$name" in
    git) check_git "$@" ;;
    git-*) known_dir "$CWD"; run_git "$KNOWN" "${name#git-}" "$@" ;;
    gh) check_gh "$@" ;;
    curl | wget | xh | http | https) check_github_request "$@" ;;
    rm) check_rm "$@" ;;
    rimraf | del | trash)
      for word in "$@"; do
        case "$word" in -*) ;; *) check_delete "$name" "$word"; check_write_target "$word" delete ;; esac
      done ;;
    unlink | shred)
      for word in "$@"; do case "$word" in -*) ;; *) check_write_target "$word" delete ;; esac; done ;;
    tee)
      for word in "$@"; do case "$word" in -*) ;; *) check_write_target "$word" edit ;; esac; done ;;
    sed | gsed) check_inplace "$name" "$@" ;;
    cp | mv | ln) check_copy "$name" "$@" ;;
    truncate) check_truncate "$@" ;;
    chmod) check_chmod "$@" ;;
    dd)
      for word in "$@"; do case "$word" in of=*) check_write_target "${word#of=}" write ;; esac; done ;;
    claude) check_claude "$@" ;;
    npm | pnpm | yarn | bun)
      case "$name:${1:-}" in
        npm:* | *:vitest) ;;
        *:git | *:gh | *:vercel | *:netlify | *:wrangler | *:firebase | *:prisma | *:supabase | *:rimraf | *:surge | *:gh-pages | *:changeset | *:lerna | *:semantic-release | *:release-it)
          # pnpm vercel, yarn prisma: a package's own command.
          run_words "$@"
          return 0 ;;
      esac
      check_package_manager "$name" "$@"
      check_publish "$name" "$@"
      ;;
    vercel | netlify | wrangler | firebase | surge | gh-pages | changeset | lerna | semantic-release | release-it) check_publish "$name" "$@" ;;
    prisma | supabase) check_database "$name" "$@" ;;
    lefthook | pre-commit) [ "${1:-}" = uninstall ] && deny_hook_skip "\`$name uninstall\`" ;;
    node | python | python3 | perl | ruby | php | deno | tsx)
      [ "$name" = perl ] && check_inplace "$name" "$@"
      check_interpreter "$name" "$@"
      ;;
    find | gfind) check_find "$@" ;;
    grep | egrep | fgrep | ggrep) check_search grep "$@" ;;
    rg) check_search rg "$@" ;;
    cd | pushd | chdir) change_directory "$@" ;;
    eval)
      if [ $# -gt 0 ]; then check_downloaded_code "$1"; scan_text "$*"; fi ;;
    sh | bash | zsh | dash | ksh | fish | ash) check_shell "$@" ;;
    source | .)
      [ $# -gt 0 ] && check_downloaded_code "$1"
      case "${1:-}" in /dev/stdin | -) scan_stdin ;; esac ;;
    ssh) check_ssh "$@" ;;
    export | declare | typeset | readonly | local)
      for word in "$@"; do
        if [[ "$word" =~ $ASSIGNMENT_RE ]]; then
          check_assignment "$word"
          case "$word" in SKIP=?*) SKIP_EXPORTED=1 ;; esac
        fi
      done
      ;;
  esac
  return 0
}

# --- Integrity, package manager, publishing -----------------------------------------------------

check_claude() {
  local positionals=() arg
  for arg in "$@"; do
    case "$arg" in
      *disableAllHooks*) hook_ask_later "this starts Claude Code with its hooks switched off." ;;
      -*) ;;
      *) positionals+=("$arg") ;;
    esac
  done
  case "${positionals[0]:-} ${positionals[1]:-}" in
    'plugin disable' | 'plugin uninstall' | 'plugin remove' | 'plugins disable' | 'plugins uninstall' | 'plugins remove')
      hook_ask_later "\`claude ${positionals[0]} ${positionals[1]}\` changes which plugins run, and this kit's guards are plugin hooks." ;;
    'plugin marketplace' | 'plugins marketplace')
      case "${positionals[2]:-}" in remove | rm)
        hook_ask_later "removing a marketplace also removes its plugins, and this kit's guards are plugin hooks." ;;
      esac ;;
  esac
  return 0
}

# The project's package manager from its lockfile (one kind only), else the packageManager field. Sets PM.
detect_package_manager() {
  PM=""
  local kinds="" count=0
  [ -f "$HOOK_ROOT/pnpm-lock.yaml" ] && { kinds="$kinds pnpm"; count=$((count + 1)); }
  [ -f "$HOOK_ROOT/yarn.lock" ] && { kinds="$kinds yarn"; count=$((count + 1)); }
  { [ -f "$HOOK_ROOT/bun.lock" ] || [ -f "$HOOK_ROOT/bun.lockb" ]; } && { kinds="$kinds bun"; count=$((count + 1)); }
  [ -f "$HOOK_ROOT/package-lock.json" ] && { kinds="$kinds npm"; count=$((count + 1)); }
  if [ "$count" -eq 1 ]; then PM="${kinds# }"; return 0; fi
  if [ "$count" -eq 0 ] && [ -f "$HOOK_ROOT/package.json" ]; then
    PM="$(jq -r '.packageManager // "" | split("@")[0]' "$HOOK_ROOT/package.json" 2>/dev/null)"
    case "$PM" in npm | pnpm | yarn | bun) ;; *) PM="" ;; esac
  fi
}

# A command's verb, the word after it and the folder it names. The value of an option is never the verb.
# Sets VERB, SECOND, VERB_DIR.
read_verb() { # <tool> <args…>
  local tool="$1" arg
  shift
  VERB=""
  SECOND=""
  VERB_DIR=""
  while [ $# -gt 0 ]; do
    arg="$1"
    shift
    case "$arg" in
      --prefix=* | --cwd=* | --dir=*) VERB_DIR="${arg#*=}"; continue ;;
      --prefix | --cwd | --dir) if [ $# -gt 0 ]; then VERB_DIR="$1"; shift; fi; continue ;;
    esac
    case "$tool:$arg" in
      npm:-C | pnpm:-C) if [ $# -gt 0 ]; then VERB_DIR="$1"; shift; fi; continue ;;
      npm:-w | npm:--workspace | pnpm:--filter | pnpm:-F | npm:--registry | npm:--tag | npm:--otp | npm:--userconfig | npm:--loglevel | \
        pnpm:--registry | pnpm:--tag | bun:--filter | netlify:--filter | netlify:--site | netlify:--auth | \
        vercel:--scope | vercel:--token | vercel:-t | vercel:--team | vercel:-S | vercel:--global-config | vercel:-Q | vercel:--local-config | \
        vercel:--name | vercel:--env | vercel:-e | vercel:--build-env | vercel:-b | vercel:--meta | vercel:-m | \
        wrangler:--config | wrangler:-c | wrangler:--env | wrangler:-e | firebase:--project | firebase:-P | firebase:--config)
        [ $# -gt 0 ] && shift
        continue ;;
    esac
    case "$arg" in -*) continue ;; esac
    if [ -z "$VERB" ]; then VERB="$arg"; elif [ -z "$SECOND" ]; then SECOND="$arg"; fi
  done
}

# `npm install` in a pnpm project writes a second lockfile and a different node_modules. A folder with a lockfile
# of its own is its own project.
check_package_manager() {
  local tool="$1" arg folder
  shift
  kit_switch packageManager || return 0
  for arg in "$@"; do
    case "$arg" in -g | --global | --location=global | --dry-run) return 0 ;; esac
  done
  read_verb "$tool" "$@"
  if [ "$tool" = yarn ] && [ -z "$VERB" ]; then
    for arg in "$@"; do case "$arg" in --version | -v | --help | -h) return 0 ;; esac; done
  fi
  case "$tool:$VERB" in
    npm:install | npm:i | npm:add | npm:ci | npm:uninstall | npm:remove | npm:rm | npm:update | npm:up | npm:dedupe |\
      pnpm:install | pnpm:i | pnpm:add | pnpm:remove | pnpm:rm | pnpm:update | pnpm:up | pnpm:import |\
      yarn: | yarn:install | yarn:add | yarn:remove | yarn:upgrade | \
      bun:install | bun:i | bun:add | bun:remove | bun:update) ;;
    *) return 0 ;;
  esac
  case "$CWD" in "$UNKNOWN_DIR" | "$UNKNOWN_DIR"/*) return 0 ;; esac
  resolve_path "$CWD" "${VERB_DIR:-.}"
  folder="$RESOLVED"
  is_dynamic "$folder" && return 0
  if [ "$folder" != "$HOOK_ROOT" ] && [ "$folder" != "$ROOT_REAL" ]; then
    locate "$folder"
    [ "$PLACE" = inside ] || return 0
    for arg in pnpm-lock.yaml yarn.lock bun.lock bun.lockb package-lock.json; do
      [ -f "$folder/$arg" ] && return 0
    done
  fi
  detect_package_manager
  [ -n "$PM" ] && [ "$PM" != "$tool" ] &&
    hook_deny "Blocked: this project uses $PM (its lockfile or packageManager field says so); \`$tool $VERB\` would write a second lockfile. Use \`$PM\` for the same command."
  return 0
}

# Publishing and deploying are the release process's job, not a coding session's. {"guards": {"remoteWrites": false}} lifts it.
check_publish() {
  local tool="$1" arg what="" production=""
  shift
  [ -n "$REMOTE_WRITES" ] || return 0
  for arg in "$@"; do
    case "$arg" in
      --help | --version | --dry-run | --dry-run=true) return 0 ;;
      --prod | --target=production) production=1 ;;
    esac
  done
  case "${1:-}" in -h | -v | -V) return 0 ;; esac
  read_verb "$tool" "$@"
  case "$tool:$VERB" in
    npm:publish | pnpm:publish | yarn:publish | bun:publish | npm:deprecate | npm:unpublish) what=registry ;;
    yarn:npm) case "$SECOND" in publish | login | logout | tag) what=registry ;; esac ;;
    npm:access | npm:owner | npm:dist-tag)
      case "$SECOND" in set | grant | revoke | add | rm | remove | public | restricted | edit | 2fa-*) what=registry ;; esac ;;
    changeset:publish | lerna:publish) what=registry ;;
    semantic-release:* | release-it:*)
      for arg in "$@"; do case "$arg" in -d | --ci=false) return 0 ;; esac; done
      what=registry ;;
    netlify:deploy | wrangler:deploy | wrangler:publish | wrangler:delete | firebase:deploy) what=deploy ;;
    wrangler:pages) case "$SECOND" in deploy | publish) what=deploy ;; esac ;;
    surge:list | surge:whoami | surge:login | surge:logout | surge:token) ;;
    surge:* | gh-pages:*) what=deploy ;;
    vercel: | vercel:deploy | vercel:promote | vercel:rollback | vercel:. | vercel:./*) what=deploy ;;
    vercel:build | vercel:pull | vercel:link | vercel:inspect | vercel:logs | vercel:ls | vercel:list | vercel:dev) ;;
    vercel:*) [ -n "$production" ] && what=deploy ;;
  esac
  case "$what" in
    registry) hook_deny "Blocked: \`$tool $VERB\` publishes or changes a registry package. Releases are the user's job." ;;
    deploy) hook_deny "Blocked: \`$tool $VERB\` deploys the site. Deploys are the user's job; preview locally." ;;
  esac
  return 0
}

check_database() {
  local tool="$1" words reset=""
  shift
  [ -n "$REMOTE_WRITES" ] || return 0
  words=" $* "
  case "$tool:$words" in
    prisma:*' migrate reset '* | prisma:*' db push '*--force-reset* | prisma:*' db push '*--accept-data-loss*) reset=1 ;;
    supabase:*' db reset '*--linked* | supabase:*' db reset '*--db-url*) reset=1 ;;
  esac
  [ -n "$reset" ] && hook_deny "Blocked: this resets the database and loses its data. Ask the user to run it."
  return 0
}

# --- Walking the command line ------------------------------------------------------------------

NESTING=0
scan_text() { # <text> [body: a heredoc the shell expands]
  read_commands "$1" "${2:-command}"
  # macOS /bin/bash 3.2 ends a $(…) elsewhere when a comment, a case or a heredoc is inside: judge that reading too.
  case "$1" in
    *'$('*'#'* | *'$('*'<<'* | *'$('*case*) [ "${2:-command}" = command ] && read_commands "$1" old-bash ;;
  esac
  return 0
}

read_commands() { # <text> <command | body | old-bash>
  local mode="$2" output
  NESTING=$((NESTING + 1))
  [ "$NESTING" -le "$MAX_NESTING" ] ||
    hook_deny "Blocked: this command nests shells too deeply to check. Run the inner command directly."
  output="$(printf '%s\n' "$1" | awk -v mode="$mode" -f "$HOOK_DIR/shell-words.awk")" ||
    hook_deny "Blocked: this command can't be read by the guard (too deeply nested, too many heredocs, or awk failed). Split it into simpler commands."
  if [ -z "$output" ]; then NESTING=$((NESTING - 1)); return 0; fi

  # A nested scan (bash -c, eval) starts where its caller is and changes nothing for it.
  local CWD="$CWD" CHAINED_BRANCH="$CHAINED_BRANCH" CHAINED_DIR="$CHAINED_DIR" JOINED_BY="" FOLLOWED_BY=""
  local SEG_WORDS=() SEG_TARGETS=() SEG_WRITES=() SEG_INPUTS=() SEG_STDIN=() SEG_EXPAND=() PIPED=() PIPED_FILE="" PIPED_UNKNOWN=""
  local KNOWN_BASE="$KNOWN_BASE" PIPE_IN="$PIPE_IN" IN_ARRAY="" ARRAY_OPEN="" HOOKS_SKIPPED="$HOOKS_SKIPPED" SKIP_EXPORTED=""
  local saved_cwd=() saved_base=() saved_branch=() saved_joined=() saved_pipe=() saved_array=() level=0 records=() record value arg

  # Read first: the commands run below must not share this loop's stdin.
  while IFS= read -r record; do
    records+=("$record")
    if [ "${#record}" -gt "$MAX_WORD" ]; then
      case "${record:0:1}" in W | R | I | S) deny_too_long ;; esac
    fi
    [ "$SECONDS" -lt "$TIME_LIMIT" ] || deny_too_long
  done <<<"$output"

  for record in "${records[@]}"; do
    [ "$SECONDS" -lt "$TIME_LIMIT" ] || deny_too_long
    case "$record" in
      '(' | '[')
        saved_cwd[level]="$CWD"
        saved_base[level]="$KNOWN_BASE"
        saved_branch[level]="$CHAINED_BRANCH"
        saved_joined[level]="$JOINED_BY"
        saved_pipe[level]="$PIPE_IN"
        saved_array[level]="$IN_ARRAY"
        if [ "$record" = '(' ]; then
          # A subshell's commands read what is piped into it.
          if [ "$JOINED_BY" = '|' ]; then
            if [ -n "$PIPED_UNKNOWN" ] || { [ -z "$PIPED_FILE" ] && [ ${#PIPED[@]} -eq 0 ]; }; then PIPE_IN=1; fi
          fi
          IN_ARRAY="$ARRAY_OPEN" # files=("$A" "$B"): words, not a command
        else
          PIPE_IN=""
          IN_ARRAY=""
        fi
        ARRAY_OPEN=""
        level=$((level + 1))
        JOINED_BY=""
        continue
        ;;
      ')' | ']')
        if [ "$level" -gt 0 ]; then
          level=$((level - 1))
          CWD="${saved_cwd[level]}"
          KNOWN_BASE="${saved_base[level]}"
          JOINED_BY="${saved_joined[level]}"
          PIPE_IN="${saved_pipe[level]}"
          IN_ARRAY="${saved_array[level]}"
          # A substitution doesn't break the && chain around it; a subshell's end does.
          if [ "$record" = ']' ]; then CHAINED_BRANCH="${saved_branch[level]}"; fi
        fi
        continue
        ;;
    esac
    value="${record:1}"
    case "$value" in *"$ENCODED_NEWLINE"*) value="$(printf '%s' "$value" | tr '\036' '\n')" ;; esac
    case "$record" in
      W*) SEG_WORDS+=("$value") ;;
      R*) SEG_TARGETS+=("$value"); SEG_WRITES+=("$value") ;;
      I*) SEG_TARGETS+=("$value"); SEG_INPUTS+=("$value") ;;
      S* | H*) SEG_STDIN+=("$value") ;;
      X*) SEG_STDIN+=("$value"); SEG_EXPAND+=("$value") ;;
      E*)
        FOLLOWED_BY="$value"
        [ $((${#SEG_WORDS[@]} + ${#SEG_TARGETS[@]})) -le "$MAX_WORDS" ] || deny_too_long
        for arg in ${SEG_WORDS[@]+"${SEG_WORDS[@]}"} ${SEG_TARGETS[@]+"${SEG_TARGETS[@]}"}; do
          [ "$SECONDS" -lt "$TIME_LIMIT" ] || deny_too_long
          check_env_word "$arg"
        done
        [ ${#SEG_WRITES[@]} -eq 0 ] || check_redirects
        for arg in ${SEG_EXPAND[@]+"${SEG_EXPAND[@]}"}; do
          case "$arg" in *'$('* | *'`'*) scan_text "$arg" body ;; esac
        done
        ARRAY_OPEN=""
        if [ ${#SEG_WORDS[@]} -gt 0 ]; then
          arg="${SEG_WORDS[$((${#SEG_WORDS[@]} - 1))]}"
          if [[ "$arg" =~ $ASSIGNMENT_RE ]]; then case "$arg" in *=) ARRAY_OPEN=1 ;; esac; fi
          run_words "${SEG_WORDS[@]}"
          [ -n "$SKIP_EXPORTED" ] && HOOKS_SKIPPED=1
        fi
        PIPED=()
        PIPED_FILE=""
        PIPED_UNKNOWN=""
        if [ "$value" = '|' ]; then
          case "${SEG_WORDS[0]:-}" in
            echo | printf | */echo | */printf)
              local printed=""
              for arg in "${SEG_WORDS[@]:1}"; do
                case "$arg" in -n | -e | -E) continue ;; esac
                printed="${printed:+$printed }$arg"
                [ "${SEG_WORDS[0]##*/}" = printf ] && PIPED+=("$arg")
              done
              [ -n "$printed" ] && PIPED+=("$printed")
              case "$printed" in *'$('* | *'`'* | '$'*) PIPED_UNKNOWN=1 ;; esac
              ;;
            cat | */cat) piped_files ;;
          esac
          PIPED+=(${SEG_STDIN[@]+"${SEG_STDIN[@]}"})
        fi
        [ "$value" = "&&" ] || CHAINED_BRANCH=""
        JOINED_BY="$value"
        SEG_WORDS=()
        SEG_TARGETS=()
        SEG_WRITES=()
        SEG_INPUTS=()
        SEG_STDIN=()
        SEG_EXPAND=()
        ;;
    esac
  done
  NESTING=$((NESTING - 1))
}

# cat of files in the project: what a pipe hands over is as readable as the files are.
piped_files() {
  local arg
  [ ${#SEG_WORDS[@]} -gt 1 ] || return 0
  for arg in "${SEG_WORDS[@]:1}"; do
    case "$arg" in -* | *'$'* | *'`'*) return 0 ;; esac
    known_dir "$CWD"
    resolve_path "$KNOWN" "$arg"
    [ -f "$RESOLVED" ] || return 0
    locate "$RESOLVED"
    [ "$PLACE" = inside ] || return 0
  done
  PIPED_FILE=1
}

deny_too_long() {
  hook_deny "Blocked: this command is too long to check before the hook times out. Split it up, or write long text with the Write tool."
}

if [ -z "$COMMAND" ]; then
  # Monitor can watch a WebSocket instead of running a command. Anything else without command text (an array,
  # false, a renamed field) can't be judged, so it is refused.
  WATCHED="$(hook_field '.tool_input.ws.url | strings')"
  if [ -n "$WATCHED" ]; then
    has_live_host "$WATCHED" && hook_deny "Blocked: never watch the live site ($KIT_LIVE_HOSTS). Use local mocks or $KIT_UAT_HOST."
    exit 0
  fi
  printf '%s' "$HOOK_INPUT" | jq -e '.tool_input.command | type == "string"' >/dev/null 2>&1 ||
    hook_deny "Blocked: this call has no command text the guard can read, so it is refused."
  exit 0
fi
# The terminal tool names its folder in its input.
if [ "$(hook_field '.tool_name')" = mcp__terminal__run_in_terminal ]; then
  TERMINAL_CWD="$(hook_field '.tool_input.cwd | strings')"
  case "$TERMINAL_CWD" in /*) CWD="$TERMINAL_CWD"; START_CWD="$CWD"; KNOWN_BASE="$CWD" ;; esac
fi
[ "${#COMMAND}" -le "$MAX_COMMAND" ] || deny_too_long
scan_text "$COMMAND"
hook_finish
