#!/bin/bash
# PreToolUse(Bash): blocks the shell commands this repo never runs.
#
#   - opening or merging a PR (the user opens PRs from the compare link)
#   - pushing to a protected branch (main/master by default) in any spelling, force pushes, deleting one
#   - committing or merging on a protected branch, skipping git hooks (--no-verify, -n, HUSKY=0, core.hooksPath)
#   - commands that throw away uncommitted work (reset --hard, clean -f, checkout/restore .)
#   - recursive rm outside the project and the temp folders, or of the project's top-level folders
#   - network calls to the live hosts listed in .claude/frontend-kit.json (liveHosts)
#
# Permission rules are prefix matches and miss spellings like `git -C . push` or `sh -c '…'`, so this
# script parses the command instead. It answers with a JSON deny (exit 0) and stays silent to allow;
# it fails closed (exit 2) when jq is missing or the script itself breaks (see lib.sh).
#
#   - reading .env secrets through the shell (cat .env, source .env.local, cp .env /tmp); .env.example is fine
set -uf
# shellcheck disable=SC2034 # read by lib.sh
HOOK_KIND=guard # fail closed: see lib.sh
. "$(dirname "$0")/lib.sh"

hook_read_input
COMMAND="$(hook_field '.tool_input.command')"
[ -z "$COMMAND" ] && exit 0
CWD="$(hook_field '.cwd')"
CWD="${CWD:-$HOOK_ROOT}"

PROTECTED_BRANCH_RE="^(refs/heads/)?($(kit_alternation '.protectedBranches' 'main|master'))\$"
# No live host configured → a pattern that never matches.
LIVE_HOST_RE="(^|[^A-Za-z0-9-])($(kit_alternation '.liveHosts' 'no-live-host\.invalid'))"
NETWORK_TOOLS=' curl wget http https xh open lynx w3m nc ab hey k6 lighthouse unlighthouse playwright newman node npx npm pnpm bunx yarn tsx '
PROTECTED_TOP_LEVEL=' .git .github .claude .husky src docs e2e public scripts deploy server '
ROOT_TOKEN='@ROOT@'

# --- Normalising -------------------------------------------------------------------------------

# Quotes around a single word carry no meaning for us ("main" == main); quoted text with spaces is
# message text, replaced by a placeholder so a commit message can never look like a command.
unquote_words() {
  sed -E "s/\"([^\" ]*)\"/\1/g; s/'([^' ]*)'/\1/g"
}
drop_quoted_text() {
  sed -E "s/\"[^\"]*\"/ Q /g; s/'[^']*'/ Q /g"
}
# Heredoc bodies are data (commit messages, file contents), unless the heredoc feeds a shell.
drop_heredoc_bodies() {
  awk -v q="'" '
    delim != "" { if ($0 ~ "^[ \t]*" delim "[ \t]*$") delim = ""; next }
    { print }
    $0 !~ /(^|[^A-Za-z])(sh|bash|zsh|dash)[ \t]*<</ && match($0, "<<-?[ \t]*[\"" q "]?[A-Za-z_][A-Za-z0-9_]*") {
      delim = substr($0, RSTART, RLENGTH)
      sub("^<<-?[ \t]*[\"" q "]?", "", delim)
    }'
}
# One shell command per line: split on && || ; | & $( ` ( ) and newlines. Redirections that contain
# & or | go first, so they don't split a command: fd duplications (2>&1, >&2, <&0) carry no file and
# are dropped; &> / &>> / >| become plain > / >>.
split_commands() {
  awk '{ gsub(/[0-9]*[<>]&[0-9]*-?/, " "); gsub(/&>/, ">"); gsub(/>\|/, ">"); gsub(/&&|\|\||\$\(|[;|&`()]/, "\n"); print }'
}
# Puts spaces around redirection operators (> >> < << <<< with an optional fd number), so
# `main>/dev/null` is the word main plus a redirection, never the word `main>/dev/null`.
space_redirections() {
  sed -E 's/[0-9]*(>>?|<<?<?)/ \1 /g'
}

# True for a word naming a .env secrets file (.env, .env.local, $CLAUDE_PROJECT_DIR/.env, .env*,
# --env-file=.env); .env.example and words that merely contain "env" (process.env, envError) are fine.
is_env_file_word() {
  local word="${1##*=}" base
  base="${word##*/}"
  case "$base" in
    .env.example) return 1 ;;
    .env | .env.* | '.env*' | '.env?'* | '.env['*) return 0 ;;
  esac
  return 1
}

# The project path has spaces and parentheses ("Projects (from Trash)"); a placeholder keeps quoted
# absolute paths into the project as single words that survive the splitting below.
COMMAND="${COMMAND//"$HOOK_ROOT"/$ROOT_TOKEN}"
COMMAND="${COMMAND//'${CLAUDE_PROJECT_DIR}'/$ROOT_TOKEN}"
COMMAND="${COMMAND//'$CLAUDE_PROJECT_DIR'/$ROOT_TOKEN}"
NORMALISED="$(printf '%s\n' "$COMMAND" | drop_heredoc_bodies | unquote_words)"
SEGMENTS="$(printf '%s\n' "$NORMALISED" | drop_quoted_text | split_commands)"
# Code handed to another shell (`bash -c '…'`, `eval "…"`, `ssh host '…'`) is checked as well.
if printf '%s' "$NORMALISED" | grep -Eq '(^|[^A-Za-z])(sh|bash|zsh|dash)[[:space:]]+-[A-Za-z]*c|(^|[[:space:];&|])(eval|ssh|xargs)[[:space:]]'; then
  INNER="$(printf '%s\n' "$NORMALISED" | grep -oE "\"[^\"]*\"|'[^']*'" | sed -E "s/^[\"']//; s/[\"']$//" | split_commands)"
  SEGMENTS="$SEGMENTS
$INNER"
fi

# --- Helpers -----------------------------------------------------------------------------------

# Lexically resolves a path against a base: no symlinks, handles . and .. and ~.
resolve_path() {
  local base="$1" path="$2" out="" part
  # shellcheck disable=SC2088 # "~" here is the literal text of the command, expanded by hand below
  case "$path" in
    "$ROOT_TOKEN"*) path="$HOOK_ROOT${path#"$ROOT_TOKEN"}" ;;
    "~") path="$HOME" ;;
    "~/"*) path="$HOME/${path#\~/}" ;;
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
  printf '%s' "${out:-/}"
}

current_branch() {
  git -C "$1" branch --show-current 2>/dev/null
}

is_protected_branch() {
  printf '%s' "$1" | grep -Eq "$PROTECTED_BRANCH_RE"
}

# --- git ---------------------------------------------------------------------------------------

SWITCHED_TO_PROTECTED=""

# A one-off `git -c key=value`: hooks must keep running, and aliases would hide the real command.
check_git_config() {
  case "$1" in
    [Cc][Oo][Rr][Ee].[Hh][Oo][Oo][Kk][Ss][Pp][Aa][Tt][Hh]=*)
      hook_deny "Blocked: overriding core.hooksPath skips husky (lint-staged, commitlint). Fix the hook failure instead." ;;
    [Aa][Ll][Ii][Aa][Ss].*)
      hook_deny "Blocked: a one-off \`git -c alias.…\` hides which git command really runs. Spell the command out (e.g. git push -u origin <branch>)." ;;
  esac
}

check_git() {
  local dir="$CWD" i=1 sub="" token
  # Global options before the subcommand.
  while [ $i -lt ${#WORDS[@]} ]; do
    token="${WORDS[$i]}"
    case "$token" in
      -C) i=$((i + 1)); dir="$(resolve_path "$dir" "${WORDS[$i]:-.}")" ;;
      -c) i=$((i + 1)); check_git_config "${WORDS[$i]:-}" ;;
      -c?*) check_git_config "${token#-c}" ;;
      --git-dir | --work-tree | --namespace | --exec-path) i=$((i + 1)) ;;
      -*) ;;
      *) sub="$token"; break ;;
    esac
    i=$((i + 1))
  done
  [ -z "$sub" ] && return

  local args=("${WORDS[@]:$((i + 1))}")
  local arg
  for arg in ${args[@]+"${args[@]}"}; do
    [ "$arg" = "--no-verify" ] &&
      hook_deny "Blocked: --no-verify skips husky (lint-staged + commitlint). Fix what the hook reports and run it again; only the user can ask to skip hooks."
  done

  case "$sub" in
    push) check_git_push "$dir" ${args[@]+"${args[@]}"} ;;
    commit)
      for arg in ${args[@]+"${args[@]}"}; do
        case "$arg" in
          --) break ;;
          --*) ;;
          -*n*) printf '%s' "$arg" | grep -Eq '^-[A-Za-z]+$' &&
            hook_deny "Blocked: \`git commit -n\` skips husky (lint-staged + commitlint). Fix what the hook reports instead." ;;
        esac
      done
      is_protected_branch "$(current_branch "$dir")" &&
        hook_deny "Blocked: you are on $(current_branch "$dir"). Never commit on a protected branch ($KIT_PROTECTED_BRANCHES). Create a task branch from origin/$KIT_DEFAULT_BRANCH first."
      ;;
    merge)
      if [ -n "$SWITCHED_TO_PROTECTED" ] || is_protected_branch "$(current_branch "$dir")"; then
        hook_deny "Blocked: merging into a protected branch ($KIT_PROTECTED_BRANCHES) is the user's job. Push the task branch and print the compare link instead."
      fi
      ;;
    checkout | switch)
      for arg in ${args[@]+"${args[@]}"}; do
        is_protected_branch "$arg" && SWITCHED_TO_PROTECTED=1
      done
      if [ "$sub" = checkout ]; then check_discard_all "checkout" ${args[@]+"${args[@]}"}; fi
      ;;
    restore)
      local staged_only=""
      for arg in ${args[@]+"${args[@]}"}; do
        case "$arg" in --staged | -S) staged_only=1 ;; --worktree | -W) staged_only="" ; break ;; esac
      done
      [ -z "$staged_only" ] && check_discard_all "restore" ${args[@]+"${args[@]}"}
      ;;
    reset)
      for arg in ${args[@]+"${args[@]}"}; do
        [ "$arg" = "--hard" ] &&
          hook_deny "Blocked: \`git reset --hard\` throws away uncommitted work. Ask the user; to undo one file use \`git restore <file>\`."
      done
      ;;
    clean)
      for arg in ${args[@]+"${args[@]}"}; do
        case "$arg" in
          --force | -[A-Za-z]*f* | -f*)
            hook_deny "Blocked: \`git clean -f\` deletes untracked files for good. List them with \`git clean -n\` and ask the user." ;;
        esac
      done
      ;;
    branch)
      local deleting=""
      for arg in ${args[@]+"${args[@]}"}; do
        case "$arg" in -D | -d | --delete) deleting=1 ;; esac
        [ -n "$deleting" ] && is_protected_branch "$arg" && hook_deny "Blocked: never delete a protected branch ($KIT_PROTECTED_BRANCHES)."
      done
      ;;
  esac
}

check_discard_all() {
  local verb="$1" arg
  shift
  for arg in "$@"; do
    case "$arg" in
      . | :/ | ./ | '*')
        hook_deny "Blocked: \`git $verb $arg\` throws away every uncommitted change. Restore the specific files you changed, or ask the user." ;;
    esac
  done
}

check_git_push() {
  local dir="$1" arg skip_next="" positionals=()
  shift
  for arg in "$@"; do
    if [ -n "$skip_next" ]; then skip_next=""; continue; fi
    case "$arg" in
      --force | --force-with-lease* | --force-if-includes | -f | -[A-Za-z]*f*)
        hook_deny "Blocked: force pushes rewrite shared history. Push normally; if the push is rejected, fetch and tell the user." ;;
      --mirror | --all)
        hook_deny "Blocked: \`git push $arg\` would push the protected branches ($KIT_PROTECTED_BRANCHES) too. Push only the task branch: git push -u origin <branch>." ;;
      -o | --push-option | --repo | --receive-pack | --exec) skip_next=1 ;;
      -*) ;;
      +*)
        hook_deny "Blocked: a '+' refspec is a force push. Push normally." ;;
      *) positionals+=("$arg") ;;
    esac
  done

  local count=${#positionals[@]} k destination
  if [ "$count" -le 1 ]; then
    # No refspec: git pushes the current branch.
    local branch
    branch="$(current_branch "$dir")"
    is_protected_branch "$branch" &&
      hook_deny "Blocked: the current branch is $branch. Never push a protected branch ($KIT_PROTECTED_BRANCHES). Switch to the task branch."
    [ "$count" -eq 1 ] && is_protected_branch "${positionals[0]}" &&
      hook_deny "Blocked: never push to a protected branch ($KIT_PROTECTED_BRANCHES). Push only the task branch: git push -u origin <branch>."
    return
  fi
  for ((k = 1; k < count; k++)); do
    destination="${positionals[$k]##*:}"
    if is_protected_branch "$destination" || { [ "$destination" = "HEAD" ] && is_protected_branch "$(current_branch "$dir")"; }; then
      hook_deny "Blocked: never push to a protected branch ($KIT_PROTECTED_BRANCHES). Push only the task branch: git push -u origin <branch>."
    fi
  done
}

# --- gh ----------------------------------------------------------------------------------------

check_gh() {
  local joined=" ${WORDS[*]} "
  if printf '%s' "$joined" | grep -Eq ' pr (create|new|merge) |gh pr (create|new|merge)$'; then
    hook_deny "Blocked: never open or merge a pull request; the user does that by hand. Print the compare link instead: $(kit_compare_link)"
  fi
  if printf '%s' "$joined" | grep -Eq ' api ' && printf '%s' "$joined" | grep -Eq '/pulls|/merges' &&
    printf '%s' "$joined" | grep -Eq '(-X|--method)[ =]?(POST|PUT|PATCH)|/merge|-f |-F |--field|--raw-field|--input'; then
    hook_deny "Blocked: creating or merging pull requests through the GitHub API is the user's job. Print the compare link instead."
  fi
}

# --- rm ----------------------------------------------------------------------------------------

is_temp_path() {
  case "$1" in
    /tmp/?* | /private/tmp/?* | /var/folders/?* | /private/var/folders/?*) return 0 ;;
  esac
  [ -n "${TMPDIR:-}" ] && case "$1" in "${TMPDIR%/}"/?*) return 0 ;; esac
  return 1
}

check_rm() {
  local recursive="" ends_options="" arg targets=()
  local i
  for ((i = 1; i < ${#WORDS[@]}; i++)); do
    arg="${WORDS[$i]}"
    if [ -z "$ends_options" ]; then
      case "$arg" in
        --) ends_options=1; continue ;;
        --recursive) recursive=1; continue ;;
        --*) continue ;;
        -*) case "$arg" in *[rR]*) recursive=1 ;; esac; continue ;;
      esac
    fi
    targets+=("$arg")
  done
  [ -z "$recursive" ] && return

  local target resolved rel first
  for target in ${targets[@]+"${targets[@]}"}; do
    case "$target" in
      *'$'* | Q)
        hook_deny "Blocked: \`rm -r\` with a variable or quoted path can't be checked. Use a literal path inside the project or the scratchpad." ;;
    esac
    resolved="$(resolve_path "$CWD" "$target")"
    case "$resolved" in
      "$HOOK_ROOT")
        hook_deny "Blocked: \`rm -r $target\` deletes the whole project." ;;
      "$HOOK_ROOT"/*)
        rel="${resolved#"$HOOK_ROOT"/}"
        first="${rel%%/*}"
        case "$first" in *'*'* | *'?'*)
          hook_deny "Blocked: \`rm -r $target\` would delete the project's top-level folders." ;;
        esac
        if [ "$rel" = "$first" ] && printf '%s' "$PROTECTED_TOP_LEVEL" | grep -q " $first "; then
          hook_deny "Blocked: \`rm -r $target\` deletes the project's $first/ folder. Delete only the files you created, or ask the user."
        fi
        [ "$first" = ".git" ] && hook_deny "Blocked: never delete anything inside .git/."
        ;;
      *)
        is_temp_path "$resolved" ||
          hook_deny "Blocked: \`rm -r $target\` is outside the project and the temp folders ($resolved). Ask the user to do it." ;;
    esac
  done
}

# --- live store --------------------------------------------------------------------------------

check_live_host() {
  local segment="$1" name="$2"
  printf '%s' "$segment" | grep -Eq "$LIVE_HOST_RE" || return
  # *SITE_URL variables only name the canonical address written into pages and the sitemap (SEO);
  # they never make a request, so pointing them at the live host is allowed.
  local request_vars
  request_vars="$(printf '%s' "$ASSIGNMENTS" | tr ' ' '\n' | grep -Ev '^([A-Z_]*_)?SITE_URL=')"
  if [ -n "$request_vars" ] && printf '%s' "$request_vars" | grep -Eq "$LIVE_HOST_RE"; then
    hook_deny "Blocked: never point a run at the live site ($KIT_LIVE_HOSTS). Use local mocks or $KIT_UAT_HOST."
  fi
  if printf '%s' "$NETWORK_TOOLS" | grep -q " $name "; then
    hook_deny "Blocked: never send requests to the live site ($KIT_LIVE_HOSTS). Use local mocks or $KIT_UAT_HOST."
  fi
}

# --- Main loop ---------------------------------------------------------------------------------

while IFS= read -r SEGMENT; do
  RAW_WORDS=()
  read -r -a RAW_WORDS <<<"$(printf '%s' "$SEGMENT" | space_redirections)" || true
  # Every word, redirection targets included, is checked for .env files; the command itself is
  # parsed without its redirections (`git push origin main >/dev/null` pushes origin main).
  WORDS=()
  REDIRECT_TARGET=""
  for WORD in ${RAW_WORDS[@]+"${RAW_WORDS[@]}"}; do
    is_env_file_word "$WORD" &&
      hook_deny "Blocked: ${WORD##*/} holds secrets and stays out of Claude's context, in the shell too. Use .env.example for names and defaults, and ask the user for any value you need."
    if [ -n "$REDIRECT_TARGET" ]; then REDIRECT_TARGET=""; continue; fi
    case "$WORD" in '>' | '>>' | '<' | '<<' | '<<<') REDIRECT_TARGET=1; continue ;; esac
    WORDS+=("$WORD")
  done
  [ ${#WORDS[@]} -eq 0 ] && continue

  # Leading VAR=value assignments and wrapper commands don't change what runs. A leading backslash
  # (\git, which skips aliases) changes nothing either.
  ASSIGNMENTS=""
  while [ ${#WORDS[@]} -gt 0 ]; do
    WORDS[0]="${WORDS[0]#\\}"
    case "${WORDS[0]}" in
      [A-Za-z_]*=*)
        ASSIGNMENTS="$ASSIGNMENTS ${WORDS[0]}"
        case "${WORDS[0]}" in HUSKY=0* | HUSKY_SKIP_HOOKS=*)
          hook_deny "Blocked: HUSKY=0 skips the git hooks (lint-staged + commitlint). Fix what the hook reports instead." ;;
        esac
        ;;
      sudo | command | builtin | exec | nohup | time | env | caffeinate | nice | timeout | gtimeout | xargs) ;;
      -* | [0-9]*) ;; # options and durations of the wrapper just removed (env -i, nice -n 5, timeout 30s)
      *) break ;;
    esac
    WORDS=("${WORDS[@]:1}")
  done
  [ ${#WORDS[@]} -eq 0 ] && continue

  NAME="${WORDS[0]##*/}"
  check_live_host "$SEGMENT" "$NAME"
  case "$NAME" in
    git) check_git ;;
    gh) check_gh ;;
    rm) check_rm ;;
    cd) [ ${#WORDS[@]} -gt 1 ] && CWD="$(resolve_path "$CWD" "${WORDS[1]}")" ;;
  esac
done <<<"$SEGMENTS"

exit 0
