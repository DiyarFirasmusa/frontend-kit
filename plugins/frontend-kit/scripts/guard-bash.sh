#!/bin/bash
# PreToolUse(Bash): blocks the shell commands this repo never runs.
#
#   - opening or merging a PR (the user opens PRs from the compare link)
#   - pushing to a protected branch (main/master by default) in any spelling, force pushes, deleting one
#   - putting work on a protected branch (commit, merge, cherry-pick, revert, am, moving the branch)
#   - skipping the project's git hooks (--no-verify, commit -n, HUSKY=0, LEFTHOOK=0, core.hooksPath)
#   - commands that throw away uncommitted work (reset --hard, clean -f, checkout -f, checkout/restore .)
#   - recursive rm (or find -delete) outside the project and the temp folders, or of its top-level folders
#   - network calls to the live hosts listed in .claude/frontend-kit.json (liveHosts)
#   - reading .env secrets through the shell (cat .env, git show HEAD:.env); .env.example is fine
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
# A command that isn't a string (an array, false, a renamed field) can't be judged, so it is refused.
printf '%s' "$HOOK_INPUT" | jq -e '.tool_input.command | type == "string"' >/dev/null 2>&1 ||
  hook_deny "Blocked: this call has no command text the guard can read, so it is refused."
COMMAND="$(hook_field '.tool_input.command')"
[ -z "$COMMAND" ] && exit 0
CWD="$(hook_field '.cwd')"
CWD="${CWD:-$HOOK_ROOT}"

# Byte-wise from here: much faster on long commands, and every word we look for is ASCII.
export LC_ALL=C

TIME_LIMIT=5 # seconds; hooks.json gives this hook 10
MAX_COMMAND=100000 # bytes. Linux refuses a longer argument anyway, and long text belongs in the Write tool
MAX_WORD=16000     # bytes in one word. bash 3.2 matches patterns in quadratic time: 100 KB takes 13 s
MAX_NESTING=8
MAX_WORDS=2000 # words in one simple command: the loops below grow slowly on bash 3.2, and 9000 targets took 12 s
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

# State of the walk through the command line.
CHAINED_BRANCH="" # "git checkout -b x && …": holds only while every next command is joined by &&
CHAINED_DIR=""
STICKY_BRANCH="" # a switch TO a protected branch: holds for the rest of the command
STICKY_DIR=""
JOINED_BY=""  # what came before the current command
FOLLOWED_BY="" # and what comes after it
VIA_XARGS=""

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

# Sets BRANCH: where this directory is at this point of the command.
find_branch() {
  if [ -n "$CHAINED_BRANCH" ] && [ "$CHAINED_DIR" = "$1" ]; then
    BRANCH="$CHAINED_BRANCH"
  elif [ -n "$STICKY_BRANCH" ] && [ "$STICKY_DIR" = "$1" ]; then
    BRANCH="$STICKY_BRANCH"
  else
    local where="$1"
    [ "$where" = "$UNKNOWN_DIR" ] && where="$HOOK_ROOT"
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

# Words that point at the guards themselves.
check_integrity_word() {
  local word="$1"
  case "$word" in
    *disableAllHooks*) hook_deny "Blocked: \"disableAllHooks\" would switch off every guard. Ask the user to change that themselves." ;;
  esac
}

# A word naming a .env secrets file (.env, .Env.local, HEAD:.env, @.env, --env-file=.env, .en?, a link to one).
check_env_word() {
  local word="$1" base found=""
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
  case "$base" in
    .env.example) ;;
    .env | .env.* | '.env*' | '.env?'* | '.env['*) found=1 ;;
    .e*[*?[]* | '.['*)
      # shellcheck disable=SC2254 # the word is a glob: does it match .env?
      case .env in $base) found=1 ;; esac
      ;;
  esac
  shopt -u nocasematch
  if [ -z "$found" ] && [ "${#word}" -lt 1024 ]; then
    local file="$word" target
    case "$file" in /*) ;; *) file="$CWD/$file" ;; esac
    if [ -L "$file" ]; then
      target="$(readlink "$file" 2>/dev/null)"
      case "${target##*/}" in
        .env.example) ;;
        .env | .env.*) found=1; base="${target##*/}" ;;
      esac
    fi
  fi
  [ -n "$found" ] &&
    hook_deny "Blocked: $base holds secrets and stays out of Claude's context, in the shell too. Use .env.example for names and defaults, and ask the user for any value you need."
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
  case "$name" in
    HUSKY | LEFTHOOK) case "$value" in 0* | false) deny_hook_skip "$name=$value" ;; esac ;;
    HUSKY_SKIP_HOOKS | SKIP_SIMPLE_GIT_HOOKS) deny_hook_skip "$name" ;;
    GIT_SSH_COMMAND | GIT_SSH | GIT_EXTERNAL_DIFF | GIT_PROXY_COMMAND | GIT_ASKPASS | GIT_EDITOR | GIT_SEQUENCE_EDITOR | BASH_ENV | ENV)
      hook_deny "Blocked: $name makes git or the shell run another program, which can't be checked. Run the command without it." ;;
    GIT_CONFIG_PARAMETERS | GIT_CONFIG_KEY_*)
      shopt -s nocasematch
      case "$value" in
        *hookspath* | *alias.*) shopt -u nocasematch; deny_hook_skip "setting core.hooksPath or an alias through $name" ;;
      esac
      shopt -u nocasematch
      ;;
  esac
}

# --- git ---------------------------------------------------------------------------------------

# Config keys that make git run another program or change where a plain push goes.
is_exec_config() { # <key or key=value>
  local result=1
  shopt -s nocasematch
  case "$1" in
    core.fsmonitor* | core.sshcommand* | core.pager* | core.editor* | core.askpass* | credential.helper* | credential.*.helper* | \
      diff.external* | gpg.program* | sequence.editor* | include.path* | includeif.* | hook.* | filter.* | merge.*.driver* | diff.*.textconv* | \
      remote.*.uploadpack* | remote.*.receivepack* | remote.*.push=* | remote.*.pushurl=* | remote.*.push | push.default=matching | help.autocorrect*) result=0 ;;
  esac
  shopt -u nocasematch
  return $result
}

check_git_config_value() {
  shopt -s nocasematch
  local kind=""
  case "$1" in
    core.hookspath=*) kind=hooks ;;
    alias.*) kind=alias ;;
  esac
  shopt -u nocasematch
  is_exec_config "$1" && kind=exec
  case "$kind" in
    exec) hook_deny "Blocked: \`git -c ${1%%=*}\` makes git run another program or redirects pushes, which can't be checked. Run the git command without it." ;;
    hooks) deny_hook_skip "overriding core.hooksPath" ;;
    alias) hook_deny "Blocked: a one-off \`git -c alias.…\` hides which git command really runs. Spell the command out (e.g. git push -u origin <branch>)." ;;
  esac
}

check_git() {
  local dir="$CWD" sub=""
  while [ $# -gt 0 ]; do
    case "$1" in
      -C)
        shift
        if [ $# -gt 0 ] && ! is_dynamic "$1"; then resolve_path "$dir" "$1"; dir="$RESOLVED"; fi
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
  local dir="$1" sub="$2" arg
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
  case "$sub" in
    send-pack) hook_deny "Blocked: \`git send-pack\` pushes around the push checks. Use git push -u origin <branch>." ;;
    subtree) [ "${1:-}" = push ] && hook_deny "Blocked: \`git subtree push\` pushes history to a remote. Ask the user." ;;
    stash)
      case "${1:-}" in
        drop | clear) hook_deny "Blocked: \`git stash ${1}\` deletes saved work for good. Ask the user." ;;
      esac
      ;;
    filter-branch | filter-repo) hook_deny "Blocked: \`git $sub\` rewrites the whole history. Ask the user." ;;
    reflog)
      case "${1:-}" in expire | delete) hook_deny "Blocked: \`git reflog ${1}\` removes the way back to lost commits. Ask the user." ;; esac ;;
    gc | prune)
      for arg in "$@"; do
        case "$arg" in --prune=now | --prune=all | --prune | -f | --force) hook_deny "Blocked: \`git $sub $arg\` deletes unreachable commits for good. Ask the user." ;; esac
      done
      [ "$sub" = prune ] && hook_deny "Blocked: \`git prune\` deletes unreachable objects for good. Ask the user."
      ;;
    worktree)
      for arg in "$@"; do
        case "$arg" in
          --force | -f) [ "${1:-}" = remove ] && hook_deny "Blocked: \`git worktree remove --force\` throws away that worktree's uncommitted work. Ask the user." ;;
          -B | -b) ;;
        esac
      done
      for arg in "$@"; do is_protected_branch "$arg" && [ "${1:-}" = add ] && hook_deny "Blocked: never create a worktree that resets a protected branch ($KIT_PROTECTED_BRANCHES)."; done
      ;;
    checkout-index)
      for arg in "$@"; do
        case "$arg" in -f | --force | -a*f* ) hook_deny "Blocked: \`git checkout-index --force\` overwrites files in the working tree. Ask the user." ;; esac
      done
      ;;
    read-tree)
      for arg in "$@"; do case "$arg" in --reset) hook_deny "Blocked: \`git read-tree --reset\` throws away uncommitted work. Ask the user." ;; esac; done ;;
  esac
  case "$sub" in
    fetch)
      for arg in "$@"; do
        case "$arg" in -*) continue ;; esac
        case "$arg" in *:*) is_protected_branch "${arg##*:}" && hook_deny "Blocked: \`git fetch $arg\` moves a protected branch ($KIT_PROTECTED_BRANCHES). Fetch without a destination branch." ;; esac
      done
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
  local dir="$1" positionals=() arg
  shift
  while [ $# -gt 0 ]; do
    arg="$1"
    shift
    case "$arg" in
      --for*)
        hook_deny "Blocked: force pushes rewrite shared history. Push normally; if the push is rejected, fetch and tell the user." ;;
      -o | --push-option | --repo | --receive-pack | --exec) [ $# -gt 0 ] && shift ;;
      --*)
        if long_option "$arg" --mirror --m || long_option "$arg" --all --al || long_option "$arg" --branches --b; then
          hook_deny "Blocked: \`git push $arg\` would push the protected branches ($KIT_PROTECTED_BRANCHES) too. Push only the task branch: git push -u origin <branch>."
        fi
        ;;
      -*)
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

check_discard_all() { # <dir> <verb> <pathspec>
  local all=""
  case "$3" in
    . | ./ | :/ | ':/*' | '*' | ':(top)' | :) all=1 ;;
    .* | /* | *..*)
      if ! is_dynamic "$3"; then
        resolve_path "$1" "$3"
        [ "$RESOLVED" = "$HOOK_ROOT" ] && all=1
      fi
      ;;
  esac
  [ -n "$all" ] &&
    hook_deny "Blocked: \`git $2 $3\` throws away every uncommitted change. Restore the specific files you changed, or ask the user."
}

git_checkout() {
  local dir="$1" created="" paths="" positionals=() arg
  shift
  while [ $# -gt 0 ]; do
    arg="$1"
    shift
    if [ -n "$paths" ]; then check_discard_all "$dir" checkout "$arg"; continue; fi
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
  for arg in ${specs[@]+"${specs[@]}"}; do check_discard_all "$dir" restore "$arg"; done
}

git_branch() {
  local arg deleting="" forcing="" moving="" positionals=()
  for arg in "$@"; do
    case "$arg" in
      --*)
        long_option "$arg" --delete --de && deleting=1
        long_option "$arg" --force --forc && forcing=1
        ;;
      -?*)
        short_flag "$arg" d u && deleting=1
        short_flag "$arg" D u && deleting=1
        short_flag "$arg" f u && forcing=1
        short_flag "$arg" M u && moving=1
        short_flag "$arg" m u && moving=1
        short_flag "$arg" C u && moving=1
        ;;
      *) positionals+=("$arg") ;;
    esac
  done
  [ ${#positionals[@]} -gt 0 ] || return 0
  if [ -n "$deleting$moving" ]; then
    for arg in "${positionals[@]}"; do
      is_protected_branch "$arg" && hook_deny "Blocked: never delete or overwrite a protected branch ($KIT_PROTECTED_BRANCHES)."
    done
  elif [ -n "$forcing" ] && is_protected_branch "${positionals[0]}"; then
    hook_deny "Blocked: never move a protected branch ($KIT_PROTECTED_BRANCHES) with branch -f."
  fi
}

git_config() {
  local reads="" writes="" key="" value="" has_value="" arg
  while [ $# -gt 0 ]; do
    arg="$1"
    shift
    case "$arg" in
      -f | --file | --blob | --type | --default | --comment | --value) [ $# -gt 0 ] && shift ;;
      --get* | -l | --list) reads=1 ;;
      --unset* | --add | --replace-all) writes=1 ;;
      -*) ;;
      *)
        if [ -z "$key" ]; then
          case "$arg" in
            get | list) reads=1 ;;
            set | unset) writes=1 ;;
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
    core.hookspath) kind=hooks ;;
    alias.*) kind=alias ;;
  esac
  shopt -u nocasematch
  if [ "$kind" = hooks ]; then deny_hook_skip "changing core.hooksPath"; fi
  if is_exec_config "$key"; then hook_deny "Blocked: setting $key makes git run another program or redirects pushes. Ask the user to change it."; fi
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
  if kit_switch remoteWrites on; then
    case "${positionals[0]} ${positionals[1]:-}" in
      'repo delete' | 'repo archive' | 'repo rename' | 'repo edit' | 'repo sync' | 'release create' | 'release delete' | 'release upload' | 'release edit' | \
        'secret set' | 'secret delete' | 'secret remove' | 'variable set' | 'variable delete' | 'workflow run' | 'workflow disable' | 'workflow enable' | 'ruleset delete')
        hook_deny "Blocked: \`gh ${positionals[0]} ${positionals[1]}\` changes the remote repository, its releases or its secrets. Ask the user." ;;
    esac
  fi
  case "${positionals[0]} ${positionals[1]:-}" in
    'pr create' | 'pr new' | 'pr merge') deny_pull_request ;;
    'alias set') [ ${#positionals[@]} -ge 4 ] && scan_text "gh ${positionals[3]}" ;;
  esac
  [ "${positionals[0]}" = api ] || return 0

  local method="" fields="" endpoint="" graphql="" unreadable="" previous="" texts=""
  for arg in "${all[@]}"; do
    case "$previous" in
      -X | --method) method="$arg" ;;
      -F | --field) case "$arg" in query=@*) unreadable=1 ;; esac ;;
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
      hook_deny "Blocked: a GraphQL request whose query comes from a file can't be checked. Pass the query inline."
    for arg in ${SEG_STDIN[@]+"${SEG_STDIN[@]}"}; do texts="$texts $arg"; done
    case "$texts" in
      *createPullRequest* | *mergePullRequest* | *enablePullRequestAutoMerge* | *enqueuePullRequest* | *mergeBranch*) deny_pull_request ;;
    esac
    return 0
  fi
  if kit_switch remoteWrites on; then
    case "$texts" in
      *' repos/'*/git/refs* | *'/git/refs'* | *'/releases'* | *'/actions/secrets'* | *'/actions/variables'* | *'/branches/'*'/protection'* | *'/rulesets'* | *updateRef* | *createRef* | *deleteRef*)
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
  local arg endpoint="" writes=""
  for arg in "$@"; do
    case "$arg" in
      *api.github.com*/pulls* | *api.github.com*/merge*) endpoint=1 ;;
      -d* | --data* | --json* | -XPOST | -XPUT | -XPATCH | POST | PUT | PATCH | --request=P* | --method=P* | --post-data*) writes=1 ;;
    esac
  done
  if [ -n "$endpoint" ] && [ -n "$writes" ]; then deny_pull_request; fi
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
  local verb="$1" target="$2" rel="" first where=outside
  case "$target" in
    *'$'* | *'`'* | '~'[!/]*)
      hook_deny "Blocked: \`$verb\` with a variable or computed path can't be checked. Use a literal path inside the project or the scratchpad." ;;
  esac
  resolve_path "$CWD" "$target"
  shopt -s nocasematch # macOS file names
  case "$RESOLVED" in
    "$HOOK_ROOT") where=root ;;
    "$HOOK_ROOT"/*) where=inside ;;
    *) case "$HOOK_ROOT" in "${RESOLVED%/}"/*) where=root ;; esac ;;
  esac
  shopt -u nocasematch
  case "$where" in
    root) hook_deny "Blocked: \`$verb $target\` deletes the whole project." ;;
    outside)
      is_temp_path "$RESOLVED" ||
        hook_deny "Blocked: \`$verb $target\` is outside the project and the temp folders ($RESOLVED). Ask the user to do it."
      return 0
      ;;
  esac
  rel="${RESOLVED:${#HOOK_ROOT}+1}"
  first="${rel%%/*}"
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
  [ -n "$recursive" ] || return 0
  [ -n "$VIA_XARGS" ] &&
    hook_deny "Blocked: \`xargs rm -r\` takes its paths from input, so they can't be checked. Use literal paths."
  for arg in ${targets[@]+"${targets[@]}"}; do check_delete "rm -r" "$arg"; done
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
      case "$arg" in *'$'* | *'`'*) continue ;; esac
      resolve_path "$CWD" "$arg"
      case "$RESOLVED" in "$HOOK_ROOT" | "$HOOK_ROOT"/*) continue ;; esac
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
  local target="${1:-${HOME:-/}}"
  # Where the next command runs is unknown after a cd to a computed path (or back with -): a relative delete
  # is then judged as outside the project, and git as if it ran in the project.
  case "$target" in -) CWD="$UNKNOWN_DIR"; return 0 ;; esac
  if is_dynamic "$target"; then CWD="$UNKNOWN_DIR"; return 0; fi
  resolve_path "$CWD" "$target"
  # A cd that fails leaves the next command where it was, unless && keeps that command from running.
  if [ "$FOLLOWED_BY" = "&&" ] || [ -d "$RESOLVED" ]; then CWD="$RESOLVED"; fi
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
    [ $# -gt 0 ] && scan_text "$1"
    return 0
  fi
  case "${1:-}" in '' | - | /dev/stdin) scan_stdin ;; esac
  return 0
}

# A shell that reads its code from stdin: heredocs, here-strings and what is piped into it.
scan_stdin() {
  local text
  for text in ${SEG_STDIN[@]+"${SEG_STDIN[@]}"}; do scan_text "$text"; done
  for text in ${PIPED[@]+"${PIPED[@]}"}; do scan_text "$text"; done
  # Code piped in from a download or any other program can't be read here.
  if [ "$JOINED_BY" = '|' ] && [ ${#PIPED[@]} -eq 0 ] && [ ${#SEG_STDIN[@]} -eq 0 ]; then
    hook_deny "Blocked: a shell that runs whatever is piped into it (curl … | sh, base64 -d | sh) can't be checked. Download the script, read it, then run the file."
  fi
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

# One simple command: strips what doesn't change what runs, then judges the command itself.
run_words() {
  local name="" request_vars="" VIA_XARGS="$VIA_XARGS" word
  while [ $# -gt 0 ]; do
    if [[ "$1" =~ $ASSIGNMENT_RE ]]; then
      check_assignment "$1"
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
        while [ $# -gt 0 ]; do case "$1" in -n | -d | --interval) shift; [ $# -gt 0 ] && shift ;; -*) shift ;; *) break ;; esac; done
        [ $# -gt 0 ] && scan_text "$*"
        return 0
        ;;
      script)
        shift
        while [ $# -gt 0 ]; do case "$1" in -t | -F | -c | -E) shift; [ $# -gt 0 ] && shift ;; -*) shift ;; *) break ;; esac; done
        [ $# -gt 0 ] && shift # the typescript file
        ;;
      busybox | mise | direnv | devbox | cross-env | dotenv | pnpm | yarn | bunx | npx | npm)
        # Runners that execute the rest of their line: look through them (npm exec -c 'text', pnpm exec git …).
        case "$name" in
          npm | pnpm | yarn)
            case "${2:-}" in
              exec | x | dlx | run-script) ;;
              *) break ;;
            esac
            ;;
        esac
        shift
        while [ $# -gt 0 ]; do
          case "$1" in
            -c | --call) shift; [ $# -gt 0 ] && scan_text "$1"; return 0 ;;
            exec | x | dlx | run | -- ) shift ;;
            -p | --package | -e | --env-file | -C | --dir | --prefix | --filter | -w | --workspace) shift; [ $# -gt 0 ] && shift ;;
            -*) shift ;;
            *) break ;;
          esac
        done
        ;;
      trap)
        shift
        [ $# -gt 0 ] && scan_text "$1"
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
          case "$1" in -[ughpCDRTrt] | --user | --group) shift; [ $# -gt 0 ] && shift ;; -*) shift ;; *) break ;; esac
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
            -C | --chdir)
              shift
              if [ $# -gt 0 ]; then
                # The directory holds for this command only.
                resolve_path "$CWD" "$1"
                local CWD="$RESOLVED"
                shift
              fi
              ;;
            -u | -P | --unset) shift; [ $# -gt 0 ] && shift ;;
            -*) shift ;;
            *) break ;;
          esac
        done
        ;;
      time | caffeinate | stdbuf | ionice)
        shift
        while [ $# -gt 0 ]; do
          case "$1" in
            -t | -w | -o | -e | -c | -n | -f | --format | --class | --classdata | --input | --output | --error | -i)
              # `time -p` has no value; the others do, and a value is never a command.
              if [ "$name" = time ] && [ "$1" != -o ]; then shift; else shift; [ $# -gt 0 ] && shift; fi
              ;;
            -*) shift ;;
            *) break ;;
          esac
        done
        ;;
      nice)
        shift
        while [ $# -gt 0 ]; do
          case "$1" in -n) shift; [ $# -gt 0 ] && shift ;; -*) shift ;; *) break ;; esac
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
          case "$1" in -[IJLnPdEsaR] | --max-args | --max-procs | --delimiter | --arg-file) shift; [ $# -gt 0 ] && shift ;; -*) shift ;; *) break ;; esac
        done
        ;;
      *) break ;;
    esac
    name=""
  done
  if [ -z "$name" ] || [ $# -eq 0 ]; then return 0; fi
  shift

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

  case "$name" in
    git) check_git "$@" ;;
    git-*) run_git "$CWD" "${name#git-}" "$@" ;;
    gh) check_gh "$@" ;;
    curl | wget | xh | http | https) check_github_request "$@" ;;
    rm) check_rm "$@" ;;
    rimraf | del | trash)
      for word in "$@"; do case "$word" in -*) ;; *) check_delete "$name" "$word" ;; esac; done ;;
    claude) check_claude "$@" ;;
    npm | pnpm | yarn | bun) check_package_manager "$name" "$@"; check_publish "$name" "$@" ;;
    vercel | netlify | wrangler | firebase | surge | gh-pages) check_publish "$name" "$@" ;;
    node | python | python3 | perl | ruby | php | deno | tsx)
      if [ "$JOINED_BY" = '|' ] && { [ $# -eq 0 ] || [ "${1:-}" = - ]; }; then
        hook_deny "Blocked: \`$name\` would run code piped into it, which can't be checked. Write the code to a file and read it first."
      fi
      ;;
    find | gfind) check_find "$@" ;;
    cd | pushd | chdir) change_directory "$@" ;;
    eval) [ $# -gt 0 ] && scan_text "$*" ;;
    sh | bash | zsh | dash | ksh | fish | ash) check_shell "$@" ;;
    source | .) case "${1:-}" in /dev/stdin | -) scan_stdin ;; esac ;;
    ssh) check_ssh "$@" ;;
    export | declare | typeset | readonly | local)
      for word in "$@"; do
        [[ "$word" =~ $ASSIGNMENT_RE ]] && check_assignment "$word"
      done
      ;;
  esac
  return 0
}

# --- Integrity, package manager, publishing -----------------------------------------------------

check_claude() {
  kit_switch integrity on || return 0
  local positionals=() arg
  for arg in "$@"; do case "$arg" in -*) ;; *) positionals+=("$arg") ;; esac; done
  case "${positionals[0]:-} ${positionals[1]:-}" in
    'plugin disable' | 'plugin uninstall' | 'plugin remove' | 'plugin marketplace')
      hook_deny "Blocked: changing which plugins are installed (this kit's guards are plugin hooks) is the user's job." ;;
  esac
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

# \`npm install\` in a pnpm project writes a second lockfile and a different node_modules. Only the project root is judged.
check_package_manager() {
  local tool="$1" verb="" arg
  shift
  [ "$CWD" = "$HOOK_ROOT" ] || return 0
  kit_switch packageManager on || return 0
  for arg in "$@"; do
    case "$arg" in -g | --global | --location=global) return 0 ;; -*) ;; *) [ -n "$verb" ] || verb="$arg" ;; esac
  done
  case "$tool:$verb" in
    npm:install | npm:i | npm:add | npm:ci | npm:uninstall | npm:remove | npm:rm | npm:update | npm:up | npm:dedupe |\
      pnpm:install | pnpm:i | pnpm:add | pnpm:remove | pnpm:rm | pnpm:update | pnpm:up | pnpm:import |\
      yarn: | yarn:install | yarn:add | yarn:remove | yarn:upgrade | \
      bun:install | bun:i | bun:add | bun:remove | bun:update) ;;
    *) return 0 ;;
  esac
  detect_package_manager
  [ -n "$PM" ] && [ "$PM" != "$tool" ] &&
    hook_deny "Blocked: this project uses $PM (its lockfile or packageManager field says so); \`$tool $verb\` would write a second lockfile. Use \`$PM\` for the same command."
  return 0
}

# Publishing and deploying are the release process's job, not a coding session's. {"guards": {"remoteWrites": false}} lifts it.
check_publish() {
  local tool="$1" verb="" arg
  shift
  kit_switch remoteWrites on || return 0
  for arg in "$@"; do case "$arg" in -*) ;; *) [ -n "$verb" ] || verb="$arg" ;; esac; done
  case "$tool:$verb" in
    npm:publish | pnpm:publish | yarn:publish | yarn:npm | bun:publish | npm:deprecate | npm:unpublish | npm:dist-tag | npm:access | npm:owner)
      hook_deny "Blocked: \`$tool $verb\` publishes or changes a registry package. Releases are the user's job." ;;
    netlify:deploy | wrangler:deploy | wrangler:publish | wrangler:delete | firebase:deploy | surge:* | gh-pages:* | vercel:deploy | vercel:promote | vercel:rollback | vercel:)
      hook_deny "Blocked: \`$tool ${verb:-}\` deploys the site. Deploys are the user's job; preview locally." ;;
  esac
  case "$tool" in vercel) for arg in "$@"; do [ "$arg" = --prod ] && hook_deny "Blocked: \`vercel --prod\` deploys the live site."; done ;; esac
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
  local SEG_WORDS=() SEG_TARGETS=() SEG_STDIN=() SEG_EXPAND=() PIPED=()
  local saved_cwd=() saved_branch=() saved_joined=() level=0 records=() record value arg

  # Read first: the commands run below must not share this loop's stdin.
  while IFS= read -r record; do
    records+=("$record")
    if [ "${#record}" -gt "$MAX_WORD" ]; then
      case "${record:0:1}" in W | R | S) deny_too_long ;; esac
    fi
    [ "$SECONDS" -lt "$TIME_LIMIT" ] || deny_too_long
  done <<<"$output"

  for record in "${records[@]}"; do
    [ "$SECONDS" -lt "$TIME_LIMIT" ] || deny_too_long
    case "$record" in
      '(' | '[')
        saved_cwd[level]="$CWD"
        saved_branch[level]="$CHAINED_BRANCH"
        saved_joined[level]="$JOINED_BY"
        level=$((level + 1))
        JOINED_BY=""
        continue
        ;;
      ')' | ']')
        if [ "$level" -gt 0 ]; then
          level=$((level - 1))
          CWD="${saved_cwd[level]}"
          JOINED_BY="${saved_joined[level]}"
          # A substitution doesn't break the && chain around it; a subshell's end does.
          if [ "$record" = ']' ]; then CHAINED_BRANCH="${saved_branch[level]}"; fi
        fi
        continue
        ;;
    esac
    value="${record:1}"
    case "$value" in *"$ENCODED_NEWLINE"*) value="$(printf '%s' "$value" | tr '\036' '\n')" ;; esac
    case "$value" in
      *CLAUDE_PROJECT_DIR*)
        value="${value//'${CLAUDE_PROJECT_DIR}'/$HOOK_ROOT}"
        value="${value//'$CLAUDE_PROJECT_DIR'/$HOOK_ROOT}"
        ;;
    esac
    case "$record" in
      W*) SEG_WORDS+=("$value") ;;
      R*) SEG_TARGETS+=("$value") ;;
      S* | H*) SEG_STDIN+=("$value") ;;
      X*) SEG_STDIN+=("$value"); SEG_EXPAND+=("$value") ;;
      E*)
        FOLLOWED_BY="$value"
        [ $((${#SEG_WORDS[@]} + ${#SEG_TARGETS[@]})) -le "$MAX_WORDS" ] || deny_too_long
        for arg in ${SEG_WORDS[@]+"${SEG_WORDS[@]}"} ${SEG_TARGETS[@]+"${SEG_TARGETS[@]}"}; do
          [ "$SECONDS" -lt "$TIME_LIMIT" ] || deny_too_long
          check_env_word "$arg"
          kit_switch integrity on && check_integrity_word "$arg"
        done
        for arg in ${SEG_TARGETS[@]+"${SEG_TARGETS[@]}"}; do
          case "$arg" in
            *.claude/state/* | .claude/state | *.husky/* | .husky | *lefthook.y*ml)
              kit_switch integrity on && hook_deny "Blocked: $arg is guard state or a git hook; a shell redirect must not write there." ;;
          esac
        done
        for arg in ${SEG_EXPAND[@]+"${SEG_EXPAND[@]}"}; do
          case "$arg" in *'$('* | *'`'*) scan_text "$arg" body ;; esac
        done
        [ $((${#SEG_WORDS[@]} + ${#SEG_TARGETS[@]})) -le "$MAX_WORDS" ] || deny_too_long
        [ ${#SEG_WORDS[@]} -gt 0 ] && run_words "${SEG_WORDS[@]}"
        PIPED=()
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
              ;;
          esac
          PIPED+=(${SEG_STDIN[@]+"${SEG_STDIN[@]}"})
        fi
        [ "$value" = "&&" ] || CHAINED_BRANCH=""
        JOINED_BY="$value"
        SEG_WORDS=()
        SEG_TARGETS=()
        SEG_STDIN=()
        SEG_EXPAND=()
        ;;
    esac
  done
  NESTING=$((NESTING - 1))
}

deny_too_long() {
  hook_deny "Blocked: this command is too long to check before the hook times out. Split it up, or write long text with the Write tool."
}

[ "${#COMMAND}" -le "$MAX_COMMAND" ] || deny_too_long
scan_text "$COMMAND"
exit 0
