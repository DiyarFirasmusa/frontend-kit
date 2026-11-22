#!/bin/bash
# PreToolUse(Bash|Edit|Write|MultiEdit|NotebookEdit|mcp__*): the part of a working mode that a hook can really enforce.
# It only ever DENIES (it never answers "allow"), so it can add to guard-bash, guard-paths and the permission rules and
# can never loosen them. With no mode that has rules (new and existing only guide) it exits at once.
#
#   every restricted mode  the user alone switches: no edit of .claude/state/task-mode.json, no run of mode-switch.sh,
#                          no change of "mode"/"modeState" in .claude/frontend-kit.json by Claude's tools
#   refactor, upgrade,     tests keep their weight: no deleted test file, no .skip/.only/.fixme added, no fewer test cases
#   maintenance, freeze,   in an edited test file, no snapshot refresh (-u, --update-snapshots, edits in __snapshots__)
#   hotfix
#   refactor, upgrade      no new suppression comment (@ts-ignore, eslint-disable, ...)
#   upgrade                no install with --force or --legacy-peer-deps
#   maintenance            no new dependency
#   freeze, hotfix         no dependency change, no edit of package.json or a tool config
#   hotfix                 at most N source files changed (default 5, tests not counted)
#   read-only              every edit outside docs/audits/, every shell command that is not on a short read-only list,
#                          every MCP tool that is not a read
#   prototype              every edit outside prototypes/, installs, git push
#
# It is a guard rail, not a sandbox, in the same sense as guard-bash.sh: the shell is read through shell-words.awk, but
# scripts, package scripts and programs in other languages are not looked into, a tool this matcher does not name is not
# seen, and a user (or an agent allowed to edit ~/.claude or the plugin cache) can always turn hooks off. Every deny
# names the mode, the rule and the way out. Fails closed (see lib.sh).
set -uf
# shellcheck disable=SC2034 # read by lib.sh
HOOK_KIND=guard
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
. "$HOOK_DIR/lib.sh"
. "$HOOK_DIR/mode-lib.sh"

mode_restricted || exit 0
hook_read_input
TOOL="$(hook_field '.tool_name')"
export LC_ALL=C

MODES="$MODE_PROJECT${MODE_TASK:+ $MODE_TASK}"
has_mode() { case " $MODES " in *" $1 "*) return 0 ;; esac; return 1; }
# tests have to keep their weight in every mode that changes existing code
integrity() { has_mode refactor || has_mode upgrade || has_mode maintenance || has_mode freeze || has_mode hotfix; }

deny() { # <mode> <what> <how to go on>
  hook_deny "Blocked ($1 mode): $2 ${3:-}The mode is the user's to change: /frontend-kit:mode status shows it, /frontend-kit:mode off turns it off. Do not look for another way around this block."
}
# The first active mode that names a reason, so a deny names the mode that really caused it.
lower() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]'; }
count_matches() { printf '%s' "$2" | grep -oE "$1" 2>/dev/null | wc -l | tr -d ' '; }

# --- Paths (the same reading as guard-paths.sh: lexical, then through links) ------------------------------------
physical_path() {
  local path="$1" target parent rest="" hops=0
  while [ -L "$path" ] && [ "$hops" -lt 20 ]; do
    target="$(readlink "$path")" || break
    case "$target" in /*) path="$target" ;; *) path="${path%/*}/$target" ;; esac
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
rel_under() { # <root> <path> → the lower-case path below root, empty when it is not below it
  local root path
  root="$(lower "${1%/}")"
  path="$(lower "$2")"
  case "$path" in "$root"/*) printf '%s' "${path:${#root}+1}" ;; esac
}

is_test_path() { # a project-relative path (any case)
  case "$(lower "$1")" in
    *.test.* | *.spec.* | */__tests__/* | __tests__/* | */__snapshots__/* | __snapshots__/* | *.snap | e2e/* | */e2e/* | */tests/* | tests/* | */test/* | test/*) return 0 ;;
  esac
  return 1
}
is_snapshot_path() {
  case "$(lower "$1")" in */__snapshots__/* | __snapshots__/* | *.snap | *-snapshots/* | *-snapshots) return 0 ;; esac
  return 1
}
is_tool_config() { # the file whose change moves dependencies, versions or what the checks accept
  local base
  base="$(lower "${1##*/}")"
  case "$base" in
    package.json | package-lock.json | pnpm-lock.yaml | pnpm-workspace.yaml | yarn.lock | bun.lock | bun.lockb | .npmrc | .yarnrc | .yarnrc.yml | .nvmrc | .node-version | .tool-versions) return 0 ;;
    tsconfig*.json | jsconfig.json | vite.config.* | vitest.config.* | jest.config.* | next.config.* | tailwind.config.* | postcss.config.* | babel.config.* | playwright.config.* | eslint.config.* | .eslintrc* | .oxlintrc* | oxlint.config.* | oxfmt.config.* | .oxfmtrc* | .prettierrc* | prettier.config.* | biome.json | biome.jsonc | commitlint.config.* | lint-staged.config.* | .lintstagedrc*) return 0 ;;
  esac
  return 1
}
in_dir() { case "$1" in "$2"/* | "$2") return 0 ;; esac; return 1; } # lower-case relative path, directory

# --- The state of the modes belongs to the user ----------------------------------------------------------------
state_target() { # a path or a word: does it name a file that holds the mode?
  case "$(lower "$1")" in *task-mode.json | *mode-switch* | *mode-lib.sh) return 0 ;; esac
  return 1
}
config_target() { case "$(lower "$1")" in *frontend-kit.json) return 0 ;; esac; return 1; }

# --- Edit, Write, MultiEdit, NotebookEdit -----------------------------------------------------------------------
edit_texts() { # sets OLD_TEXT, NEW_TEXT from the tool input
  OLD_TEXT=""
  NEW_TEXT=""
  case "$TOOL" in
    Write)
      [ -f "$FILE" ] && OLD_TEXT="$(cat "$FILE" 2>/dev/null)"
      NEW_TEXT="$(hook_field '.tool_input.content')" ;;
    Edit)
      OLD_TEXT="$(hook_field '.tool_input.old_string')"
      NEW_TEXT="$(hook_field '.tool_input.new_string')" ;;
    MultiEdit)
      OLD_TEXT="$(printf '%s' "$HOOK_INPUT" | jq -r '[.tool_input.edits[]?.old_string // ""] | join("\n")' 2>/dev/null)"
      NEW_TEXT="$(printf '%s' "$HOOK_INPUT" | jq -r '[.tool_input.edits[]?.new_string // ""] | join("\n")' 2>/dev/null)" ;;
    NotebookEdit)
      NEW_TEXT="$(hook_field '.tool_input.new_source')" ;;
  esac
}

SKIP_RE='(^|[^A-Za-z0-9_])((it|test|describe)\.(skip|only|fixme)|xit|xtest|xdescribe|fit|fdescribe)([^A-Za-z0-9_]|$)'
CASE_RE='(^|[^A-Za-z0-9_.])(it|test)(\.each\([^)]*\))?\('
SUPPRESS_RE='@ts-ignore|@ts-expect-error|@ts-nocheck|eslint-disable|oxlint-disable|biome-ignore'

check_edit() {
  local mode rel real_rel path rawrel
  FILE="$(hook_field '.tool_input.file_path')"
  [ -z "$FILE" ] && FILE="$(hook_field '.tool_input.notebook_path')"
  [ -z "$FILE" ] && exit 0
  FILE="$(hook_normalise_path "$FILE")"
  REAL="$(physical_path "$FILE")"
  rel="$(rel_under "$HOOK_ROOT" "$FILE")"
  real_rel="$(rel_under "$(physical_path "$HOOK_ROOT")" "$REAL")"
  [ -n "$rel" ] || rel="$real_rel"
  [ -n "$real_rel" ] || real_rel="$rel"
  # A file outside the project (the scratchpad, ~/.claude) is not what a mode is about.
  [ -z "$rel$real_rel" ] && exit 0
  rawrel="${FILE#"$HOOK_ROOT"/}"
  edit_texts

  for path in "$rel" "$real_rel"; do
    if state_target "$path"; then
      deny "$MODE_PROJECT${MODE_TASK:+/$MODE_TASK}" "$rawrel holds the mode itself." "Say what should change instead. "
    fi
    if config_target "$path"; then
      edit_config_check "$path"
    fi
  done

  for mode in $MODES; do
    for path in "$rel" "$real_rel"; do
      case "$mode" in
        read-only)
          in_dir "$path" "$MODE_REPORT_DIR" ||
            deny read-only "an edit of $rawrel. Nothing in the project changes; only $MODE_REPORT_DIR/ may be written (the report)." "Put the exact change you would make in your report instead. " ;;
        prototype)
          in_dir "$path" "$MODE_PROTOTYPE_DIR" ||
            deny prototype "an edit of $rawrel outside $MODE_PROTOTYPE_DIR/." "Put the experiment in $MODE_PROTOTYPE_DIR/<name>/ and say what production code would have to change. " ;;
        freeze | hotfix)
          if is_tool_config "$path"; then
            deny "$mode" "an edit of $rawrel: dependencies, versions and tool configuration do not change in this mode." "Tell the user what you would change. "
          fi ;;
        maintenance)
          [ "${path##*/}" = package.json ] && maintenance_deps_check ;;
      esac
    done
  done

  if integrity; then
    local label="$MODE_PROJECT"
    has_mode hotfix && label=hotfix
    for path in "$rel" "$real_rel"; do
      if is_snapshot_path "$path"; then
        deny "$label" "an edit of the snapshot file $rawrel: a snapshot is not refreshed to get a check green." "Show the user the visual or output difference and let them decide. "
      fi
      is_test_path "$path" || continue
      [ "$(count_matches "$SKIP_RE" "$NEW_TEXT")" -gt "$(count_matches "$SKIP_RE" "$OLD_TEXT")" ] &&
        deny "$label" "a test skipped or narrowed (.skip, .only, .fixme, xit) in $rawrel." "Fix the code or the test; tell the user if the test is wrong. "
      if [ "$TOOL" != NotebookEdit ] && [ "$(count_matches "$CASE_RE" "$NEW_TEXT")" -lt "$(count_matches "$CASE_RE" "$OLD_TEXT")" ]; then
        deny "$label" "fewer test cases in $rawrel than before this edit." "A test is removed by the user, or after they said why. "
      fi
    done
  fi
  if has_mode refactor || has_mode upgrade; then
    local label="$MODE_PROJECT"
    if [ "$(count_matches "$SUPPRESS_RE" "$NEW_TEXT")" -gt "$(count_matches "$SUPPRESS_RE" "$OLD_TEXT")" ]; then
      deny "$label" "a new suppression comment (@ts-ignore, eslint-disable, ...) in $rawrel: a check is fixed, not silenced." "Fix the cause, or list it in the plan as found, not fixed. "
    fi
  fi
  has_mode hotfix && hotfix_budget_check "$rel"
  return 0
}

# The mode of a project is changed by /frontend-kit:mode, not by an edit that happens to look like config.
edit_config_check() {
  local old_state new_state
  case "$TOOL" in
    Write)
      jq -e 'type == "object"' >/dev/null 2>&1 <<<"$NEW_TEXT" ||
        deny "$MODE_PROJECT" "a rewrite of .claude/frontend-kit.json that is not a valid JSON object." "Edit single keys instead. "
      old_state="$(jq -c '[.mode, .modeState]' "$FILE" 2>/dev/null)"
      new_state="$(printf '%s' "$NEW_TEXT" | jq -c '[.mode, .modeState]' 2>/dev/null)"
      [ "$old_state" = "$new_state" ] ||
        deny "$MODE_PROJECT" "a change of \"mode\" or \"modeState\" in .claude/frontend-kit.json." "The user switches modes with /frontend-kit:mode. " ;;
    Edit | MultiEdit)
      case "$OLD_TEXT$NEW_TEXT" in
        *'"mode"'* | *'"modeState"'*)
          deny "$MODE_PROJECT" "an edit of \"mode\" or \"modeState\" in .claude/frontend-kit.json." "The user switches modes with /frontend-kit:mode. " ;;
      esac ;;
  esac
}

# maintenance: package.json may change versions, not gain a package.
maintenance_deps_check() {
  local old_names new_names name
  case "$TOOL" in
    Write)
      old_names="$(jq -r '[.dependencies, .devDependencies, .optionalDependencies, .peerDependencies | objects | keys[]] | sort | .[]' "$FILE" 2>/dev/null)"
      new_names="$(printf '%s' "$NEW_TEXT" | jq -r '[.dependencies, .devDependencies, .optionalDependencies, .peerDependencies | objects | keys[]] | sort | .[]' 2>/dev/null)" ;;
    *)
      old_names="$(printf '%s\n' "$OLD_TEXT" | sed -nE 's/^[[:space:]]*"([^"]+)"[[:space:]]*:[[:space:]]*"[^"]*"[[:space:],]*$/\1/p' | sort -u)"
      new_names="$(printf '%s\n' "$NEW_TEXT" | sed -nE 's/^[[:space:]]*"([^"]+)"[[:space:]]*:[[:space:]]*"[^"]*"[[:space:],]*$/\1/p' | sort -u)" ;;
  esac
  while IFS= read -r name; do
    [ -n "$name" ] || continue
    printf '%s\n' "$old_names" | grep -qxF -- "$name" ||
      deny maintenance "a new dependency ($name) in package.json: nothing new comes in while the app is only maintained." "Say what a fix would need, and why. "
  done <<<"$new_names"
}

# hotfix: the smallest change. Tests are not counted; the files already changed are.
hotfix_budget_check() {
  local rel="$1" budget base changed count
  is_test_path "$rel" && return 0
  kit_in_src "$rel" || return 0
  budget="$(mode_file_budget)"
  base="$(mode_detail hotfix base)"
  changed="$(
    {
      hook_changed_src_files
      if [ -n "$base" ] && git -C "$HOOK_ROOT" rev-parse -q --verify "$base^{commit}" >/dev/null 2>&1; then
        git -C "$HOOK_ROOT" diff -z --name-only --relative --no-renames "$base...HEAD" -- "${KIT_SRC_PATHS[@]}" 2>/dev/null | tr '\0' '\n'
      fi
    } | sed '/^$/d' | sort -u
  )"
  # The file about to change counts, once. Lower-case compare: the project-relative path came in lower-case.
  count="$(
    {
      printf '%s\n' "$changed" | while IFS= read -r f; do is_test_path "$f" || printf '%s\n' "$(lower "$f")"; done
      printf '%s\n' "$rel"
    } | sed '/^$/d' | sort -u | wc -l | tr -d ' '
  )"
  if [ "$count" -gt "$budget" ]; then
    deny hotfix "this would be source file number $count; the budget is $budget (a hotfix is the smallest change that stops the harm)." "If the fix really needs more, the user raises it: /frontend-kit:mode hotfix --files <n>. "
  fi
}

# --- MCP tools (read-only mode only) -------------------------------------------------------------------------
check_mcp() {
  has_mode read-only || exit 0
  local leaf
  leaf="$(lower "${TOOL##*__}")"
  case "$leaf" in
    get_* | list_* | read_* | search_* | view_* | find_* | query_* | resolve_* | describe_* | take_snapshot | take_screenshot | snapshot | screenshot | browser_snapshot | browser_take_screenshot | browser_console_messages | browser_network_requests | navigate | navigate_page | browser_navigate | new_page | select_page | wait_for | browser_wait_for | query-docs | resolve-library-id | *whoami | *status | *_read | *_get | *_list | *_search | *_view) exit 0 ;;
  esac
  deny read-only "the tool $TOOL: only tools that read are allowed." "Say what you would have done with it. "
}

# --- Bash ---------------------------------------------------------------------------------------------------------
ASSIGNMENT_RE='^[A-Za-z_][A-Za-z0-9_]*\+?='
SEG_WORDS=()
SEG_TARGETS=()
NESTING=0

segment_names_state() {
  local w
  for w in ${SEG_WORDS[@]+"${SEG_WORDS[@]}"} ${SEG_TARGETS[@]+"${SEG_TARGETS[@]}"}; do
    state_target "$w" && return 0
  done
  return 1
}

# ro_ok <name> <args...>: is this one plain read?
ro_ok() {
  local name="$1" arg sub
  shift
  case "$name" in
    ls | cat | head | tail | wc | grep | egrep | fgrep | stat | file | du | df | pwd | echo | printf | true | false | test | '[' | basename | dirname | realpath | readlink | uniq | cut | tr | column | diff | cmp | which | type | cd | pushd | popd | nl | rev | tac | md5sum | shasum | sha256sum | cksum | od | xxd | strings | jq | sleep) return 0 ;;
    date) for arg in "$@"; do case "$arg" in -s | --set | -s*) return 1 ;; esac; done; return 0 ;;
    tree) for arg in "$@"; do case "$arg" in -o | -o*) return 1 ;; esac; done; return 0 ;;
    rg) for arg in "$@"; do case "$arg" in --pre | --pre=* | --hostname-bin | --hostname-bin=*) return 1 ;; esac; done; return 0 ;;
    sort) for arg in "$@"; do case "$arg" in -o | -o* | --output | --output=*) return 1 ;; esac; done; return 0 ;;
    find | gfind)
      for arg in "$@"; do case "$arg" in -exec | -execdir | -ok | -okdir | -delete | -fprint | -fprint0 | -fprintf | -fls) return 1 ;; esac; done
      return 0 ;;
    git) ro_git "$@"; return $? ;;
    npm | pnpm | yarn | bun)
      sub=""
      for arg in "$@"; do case "$arg" in -*) ;; *) sub="$arg"; break ;; esac; done
      case "$sub" in
        ls | list | why | view | info | outdated | explain | licenses) return 0 ;;
        audit) for arg in "$@"; do case "$arg" in fix | --fix) return 1 ;; esac; done; return 0 ;;
      esac
      return 1 ;;
  esac
  return 1
}
ro_git() {
  local sub="" arg skip=0 args=()
  for arg in "$@"; do
    if [ "$skip" = 1 ]; then skip=0; continue; fi
    if [ -z "$sub" ]; then
      case "$arg" in
        -C) skip=1 ;;
        --no-pager | --no-optional-locks | -P | --no-replace-objects) ;;
        -*) return 1 ;;
        *) sub="$arg" ;;
      esac
    else
      args+=("$arg")
    fi
  done
  for arg in ${args[@]+"${args[@]}"}; do
    case "$arg" in --output | --output=* | --ext-diff | --open-files-in-pager* | -O*) return 1 ;; esac
  done
  case "$sub" in
    status | diff | log | show | blame | ls-files | ls-tree | rev-parse | rev-list | describe | shortlog | grep | cat-file | merge-base | show-ref | for-each-ref | count-objects | whatchanged | version | help | var | check-ignore | diff-tree | name-rev | diff-index | diff-files | reflog) return 0 ;;
    branch) for arg in ${args[@]+"${args[@]}"}; do case "$arg" in -a | -r | -v | -vv | --list | -l | --show-current | --all | --remotes | --verbose | --contains | --merged | --no-merged) ;; *) return 1 ;; esac; done; return 0 ;;
    tag) for arg in ${args[@]+"${args[@]}"}; do case "$arg" in -l | --list | -n | -n[0-9]* | --sort=* | --contains | --merged) ;; *) return 1 ;; esac; done; return 0 ;;
    remote) for arg in ${args[@]+"${args[@]}"}; do case "$arg" in -v | --verbose | show | get-url) ;; -*) return 1 ;; *) ;; esac; done; [ "${args[0]:-}" = add ] || [ "${args[0]:-}" = remove ] || [ "${args[0]:-}" = set-url ] || [ "${args[0]:-}" = rename ] || [ "${args[0]:-}" = prune ] && return 1; return 0 ;;
    stash) [ "${args[0]:-}" = list ] || [ "${args[0]:-}" = show ]; return $? ;;
    config) for arg in ${args[@]+"${args[@]}"}; do case "$arg" in --get | --get-all | --get-regexp | --list | -l) return 0 ;; esac; done; return 1 ;;
    worktree) [ "${args[0]:-}" = list ]; return $? ;;
  esac
  return 1
}

pm_subcommand() { # <args...> → the first word that is not a flag
  local arg
  for arg in "$@"; do case "$arg" in -*) ;; *) printf '%s' "$arg"; return 0 ;; esac; done
}
has_arg_after_sub() { # does the install-like subcommand name a package? (arguments are the words after it)
  local seen="" arg
  for arg in "$@"; do
    if [ -z "$seen" ]; then case "$arg" in -*) ;; *) seen=1 ;; esac; continue; fi
    case "$arg" in -*) ;; *) return 0 ;; esac
  done
  return 1
}

check_segment() {
  local words=() i=0 n w name sub depth_guard=0 target
  n=${#SEG_WORDS[@]}
  # assignments in front of the command (VAR=value cmd)
  while [ "$i" -lt "$n" ] && [[ "${SEG_WORDS[$i]}" =~ $ASSIGNMENT_RE ]]; do i=$((i + 1)); done
  if [ "$i" -gt 0 ] && has_mode read-only; then
    deny read-only "a command that sets variables in front of it." "Run the plain read command. "
  fi
  while [ "$i" -lt "$n" ]; do words+=("${SEG_WORDS[$i]}"); i=$((i + 1)); done

  # redirections: a write
  for target in ${SEG_TARGETS[@]+"${SEG_TARGETS[@]}"}; do
    case "$target" in /dev/null | /dev/stderr | /dev/stdout | '&'*) continue ;; esac
    if has_mode read-only; then
      deny read-only "a shell redirection into $target: nothing is written." "Use the Write tool for the report in $MODE_REPORT_DIR/ if you need to save something. "
    fi
    if state_target "$target" || config_target "$target"; then
      deny "$MODE_PROJECT${MODE_TASK:+/$MODE_TASK}" "a shell write into $target, which holds the mode." "The user changes it with /frontend-kit:mode. "
    fi
    if integrity && is_test_path "$target" && [ -e "$(hook_normalise_path "$target")" ]; then
      deny "$MODE_PROJECT" "a shell write over the existing test file $target: tests are not rewritten from the shell." "Use the Edit tool, so that the change can be checked. "
    fi
    if has_mode prototype && ! in_dir "$(lower "$(rel_under "$HOOK_ROOT" "$(hook_normalise_path "$target")")")" "$MODE_PROTOTYPE_DIR" && [ -n "$(rel_under "$HOOK_ROOT" "$(hook_normalise_path "$target")")" ]; then
      deny prototype "a shell write into $target outside $MODE_PROTOTYPE_DIR/." "Keep the experiment in $MODE_PROTOTYPE_DIR/<name>/. "
    fi
  done
  [ ${#words[@]} -gt 0 ] || return 0

  if has_mode read-only; then
    name="${words[0]##*/}"
    case "$name" in
      '[' | test | echo | printf | true | false) ;;
    esac
    ro_ok "$name" "${words[@]:1}" ||
      deny read-only "the command \"$name\": read-only mode runs only plain reads (ls, cat, grep, rg, find without -exec, git status/diff/log/show, npm ls/view/outdated ...), runs no project code and installs nothing." "Say which check you want run; the user runs it or turns the mode off. "
  fi

  # unwrap env, command, time, nohup ... to the command that really runs
  while [ "$depth_guard" -lt 6 ] && [ ${#words[@]} -gt 0 ]; do
    name="${words[0]##*/}"
    case "$name" in
      env | command | builtin | exec | nohup | time | sudo | nice | ionice | stdbuf | timeout | xargs)
        words=("${words[@]:1}")
        while [ ${#words[@]} -gt 0 ]; do
          case "${words[0]}" in -* | *=* | [0-9]*) words=("${words[@]:1}") ;; *) break ;; esac
        done
        depth_guard=$((depth_guard + 1)) ;;
      *) break ;;
    esac
  done
  [ ${#words[@]} -gt 0 ] || return 0
  name="${words[0]##*/}"

  # code handed to another shell is read too
  case "$name" in
    sh | bash | zsh | dash | ksh | ash)
      for ((i = 1; i < ${#words[@]}; i++)); do
        case "${words[$i]}" in -c | -*c) [ -n "${words[$((i + 1))]:-}" ] && scan_text "${words[$((i + 1))]}"; break ;; esac
      done ;;
    eval) scan_text "${words[*]:1}" ;;
  esac

  # the mode itself
  for w in "${words[@]}"; do
    if state_target "$w"; then
      case "$name" in cat | head | tail | grep | rg | ls | jq | wc | file | stat | diff) ;; *)
        deny "$MODE_PROJECT${MODE_TASK:+/$MODE_TASK}" "a command that touches the mode state ($w)." "Only the user switches modes. " ;;
      esac
    fi
    if config_target "$w"; then
      case "$name" in cat | head | tail | grep | rg | ls | jq | wc | file | stat | diff | git | test | '[') ;; *)
        deny "$MODE_PROJECT${MODE_TASK:+/$MODE_TASK}" "a command that may rewrite .claude/frontend-kit.json, which holds the mode." "Edit single keys with the Edit tool; the mode is the user's. " ;;
      esac
    fi
  done

  # test integrity and installs
  case "$name" in
    npm | pnpm | yarn | bun)
      sub="$(pm_subcommand "${words[@]:1}")"
      pm_checks "$name" "$sub" "${words[@]:1}" ;;
    rm | unlink | trash | shred)
      integrity && for w in "${words[@]:1}"; do
        case "$w" in -*) continue ;; esac
        if is_test_path "$w" || case "$(lower "$w")" in */tests | tests | */test | test | */e2e | e2e | */__tests__ | __tests__ | */__snapshots__) true ;; *) false ;; esac; then
          deny "$MODE_PROJECT" "deleting $w: a test file or folder is never deleted to get a check green." "Tell the user which test is obsolete and why. "
        fi
      done ;;
    git)
      sub=""
      for w in "${words[@]:1}"; do case "$w" in -*) ;; *) sub="$w"; break ;; esac; done
      if [ "$sub" = rm ] && integrity; then
        for w in "${words[@]:1}"; do
          is_test_path "$w" && deny "$MODE_PROJECT" "git rm of the test file $w." "Tell the user which test is obsolete and why. "
        done
      fi
      if [ "$sub" = push ] && has_mode prototype; then
        deny prototype "git push: a prototype never leaves this machine." "Say what the experiment showed; rebuild what is worth keeping after the mode is off. "
      fi ;;
    vitest | jest | playwright | npx)
      snapshot_flag_check "${words[@]:1}" ;;
  esac
  return 0
}

snapshot_flag_check() {
  integrity || return 0
  local w
  for w in "$@"; do
    case "$w" in
      -u | --update | --updateSnapshot | --update-snapshots | --update-snapshots=* | --update-snapshot)
        deny "$MODE_PROJECT" "a test run that refreshes snapshots ($w): a snapshot is not refreshed to get a check green." "Show the user the difference and let them decide. " ;;
    esac
  done
}

pm_checks() { # <pm> <sub> <args...>
  local pm="$1" sub="$2" w
  shift 2
  # tests run through a package script: -u / --update after "run test" or "test"
  case "$sub" in test | run | t | exec) snapshot_flag_check "$@" ;; esac
  case "$sub" in
    install | i | add | ci | update | up | upgrade | remove | rm | uninstall | un | dedupe | audit | '') ;;
    *) return 0 ;;
  esac
  [ "$pm" = yarn ] && [ -z "$sub" ] && sub=install
  [ "$pm" = bun ] && [ "$sub" = add ] && :
  if has_mode upgrade; then
    for w in "$@"; do
      case "$w" in --force | -f | --legacy-peer-deps | --no-peer-deps | --strict-peer-dependencies=false)
        deny upgrade "an install with $w: it ignores the peer-dependency contract the upgrade exists to satisfy." "Resolve the peer conflict, or tell the user which package blocks. " ;;
      esac
    done
  fi
  if has_mode freeze || has_mode hotfix; then
    local label=freeze
    has_mode hotfix && label=hotfix
    case "$sub" in
      add | remove | rm | uninstall | un | update | up | upgrade | dedupe)
        deny "$label" "\"$pm $sub\": dependencies do not change in this mode." "Tell the user what you would change. " ;;
      install | i)
        has_arg_after_sub "$@" && deny "$label" "\"$pm $sub\" with a package name: dependencies do not change in this mode." "Tell the user what you would change. " ;;
      audit)
        for w in "$@"; do case "$w" in fix | --fix) deny "$label" "\"$pm audit fix\": it rewrites dependencies." "Name the advisory and the fixed version for the user. " ;; esac; done ;;
    esac
  fi
  if has_mode maintenance; then
    case "$sub" in
      add) deny maintenance "\"$pm add\": nothing new comes in while the app is only maintained." "Say what a fix would need, and why. " ;;
      install | i) has_arg_after_sub "$@" && deny maintenance "\"$pm $sub\" with a package name: nothing new comes in while the app is only maintained." "Say what a fix would need, and why. " ;;
    esac
  fi
  if has_mode prototype; then
    case "$sub" in
      add | remove | rm | uninstall | un | update | up | upgrade | dedupe)
        deny prototype "\"$pm $sub\": a prototype does not change the project's dependencies." "Write the prototype with what is installed, or say what it would need. " ;;
      install | i) has_arg_after_sub "$@" && deny prototype "\"$pm $sub\" with a package name: a prototype does not change the project's dependencies." "Write the prototype with what is installed, or say what it would need. " ;;
    esac
  fi
}

eval_records() { # <records> <depth>
  local records="$1" record value
  SEG_WORDS=()
  SEG_TARGETS=()
  while IFS= read -r record; do
    [ -n "$record" ] || continue
    case "$record" in
      '(' | ')' | '[' | ']') continue ;;
    esac
    value="${record:1}"
    case "$record" in
      W*) SEG_WORDS+=("$value") ;;
      R*) SEG_TARGETS+=("$value") ;;
      X*)
        case "$value" in *'$('* | *'`'*) scan_text "$value" body ;; esac ;;
      E*)
        if [ ${#SEG_WORDS[@]} -gt 0 ] || [ ${#SEG_TARGETS[@]} -gt 0 ]; then
          local saved_words=(${SEG_WORDS[@]+"${SEG_WORDS[@]}"}) saved_targets=(${SEG_TARGETS[@]+"${SEG_TARGETS[@]}"})
          check_segment
          SEG_WORDS=(${saved_words[@]+"${saved_words[@]}"})
          SEG_TARGETS=(${saved_targets[@]+"${saved_targets[@]}"})
        fi
        SEG_WORDS=()
        SEG_TARGETS=() ;;
    esac
  done <<<"$records"
}

scan_text() { # <text> [command | body]
  local text="$1" kind="${2:-command}" out saved_words saved_targets
  NESTING=$((NESTING + 1))
  [ "$NESTING" -le 8 ] || deny "$MODE_PROJECT${MODE_TASK:+/$MODE_TASK}" "this command nests shells too deeply to check." "Run the inner command directly. "
  saved_words=(${SEG_WORDS[@]+"${SEG_WORDS[@]}"})
  saved_targets=(${SEG_TARGETS[@]+"${SEG_TARGETS[@]}"})
  out="$(printf '%s\n' "$text" | awk -v mode="$kind" -f "$HOOK_DIR/shell-words.awk")" ||
    deny "$MODE_PROJECT${MODE_TASK:+/$MODE_TASK}" "this command cannot be read by the guard (too deeply nested, too many heredocs)." "Split it into simpler commands. "
  eval_records "$out"
  # bash 3.2 ends a $(...) elsewhere when a comment, a case or a heredoc is inside: judge that reading as well
  case "$text" in
    *'$('*'#'* | *'$('*'<<'* | *'$('*case*)
      if [ "$kind" = command ]; then
        out="$(printf '%s\n' "$text" | awk -v mode=old-bash -f "$HOOK_DIR/shell-words.awk")" || true
        eval_records "$out"
      fi ;;
  esac
  SEG_WORDS=(${saved_words[@]+"${saved_words[@]}"})
  SEG_TARGETS=(${saved_targets[@]+"${saved_targets[@]}"})
  NESTING=$((NESTING - 1))
}

case "$TOOL" in
  Edit | Write | MultiEdit | NotebookEdit) check_edit ;;
  Bash)
    COMMAND="$(hook_field '.tool_input.command')"
    [ -z "$COMMAND" ] && exit 0
    [ "${#COMMAND}" -le 100000 ] ||
      deny "$MODE_PROJECT${MODE_TASK:+/$MODE_TASK}" "this command is too long to check." "Write long text with the Write tool. "
    scan_text "$COMMAND" ;;
  mcp__*) check_mcp ;;
esac
exit 0
