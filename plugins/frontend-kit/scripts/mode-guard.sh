#!/bin/bash
# PreToolUse(Bash|Monitor|PowerShell|Edit|Write|MultiEdit|NotebookEdit|mcp__*|Skill|EnterWorktree, as far as the matcher
# in hooks.json names them): the part of a working mode that a hook can hold. It only ever DENIES (it never answers "allow"), so it can add
# to guard-bash, guard-paths and the permission rules and can never loosen them.
#
# With no config, in new and in existing it ends before jq and lib.sh: no refusal, no output, about one bash start.
#
#   every restricted mode  the mode is the user's: no edit of task-mode.json, no change of "mode", "modeState", "modes"
#                          or "guards" in frontend-kit.json, no mode-switch.sh, no Skill call that switches
#   refactor, upgrade,     tests keep their weight: no deleted test, no .skip/.only added, no fewer test cases in an
#   maintenance, freeze,   edit, no snapshot update
#   hotfix
#   refactor, upgrade      no new suppression comment in code (@ts-ignore, eslint-disable, ...)
#   upgrade                no install with --force or --legacy-peer-deps
#   maintenance            no new dependency (a new version of one that is there is fine)
#   freeze, hotfix         no dependency change, no edit of package.json, a lockfile or a tool config
#   hotfix                 at most N source files changed (default 5, tests not counted)
#   read-only              no edit outside the report folder, only shell commands on a short list of plain reads,
#                          only MCP tools named like a read, no new worktree
#   prototype              no edit outside the prototype folder, no package change, no git commit or push
#
# It is a guard rail, not a sandbox. For the edit tools it knows the file and the text, so those rules hold. A shell
# command is read through shell-words.awk and judged by its common forms only: scripts, package scripts, variables,
# programs in other languages and MCP servers' own writes get round it, and no longer pattern list would change that.
# A plain word is never a target: a file or a commit message that merely contains a mode word is left alone.
# Every deny names the mode, the rule and the way out. Fails closed (see lib.sh), inside its own deadline.
set -uf
case "$0" in */*) HOOK_DIR="${0%/*}" ;; *) HOOK_DIR=. ;; esac
. "$HOOK_DIR/mode-active.sh"
if [ -n "${CLAUDE_PROJECT_DIR:-}" ] && ! mode_maybe_on "${CLAUDE_PROJECT_DIR%/}"; then
  exec cat >/dev/null # read the input to its end, or the writer gets a closed pipe
fi
# shellcheck disable=SC2034 # read by lib.sh
HOOK_KIND=guard
. "$HOOK_DIR/lib.sh"
. "$HOOK_DIR/mode-lib.sh"

if ! mode_restricted; then
  cat >/dev/null
  exit 0
fi
hook_read_input
TOOL="$(hook_field '.tool_name')"
export LC_ALL=C

TIME_LIMIT=6  # seconds; hooks.json gives this hook 10, and over that Claude Code refuses without a reason
SMALL=64      # steps that are always finished: a short command is never refused because the machine was busy
STEPS=0
MAX_PATH=4096 # a longer word is text, not a path
ENCODED_NEWLINE=$'\036'
NEWLINE=$'\n'

MODES="$MODE_PROJECT${MODE_TASK:+ $MODE_TASK}"
has_mode() { case " $MODES " in *" $1 "*) return 0 ;; esac; return 1; }
MODE_NAMES="$MODE_TASK" # for a rule of every restricted mode
case "$MODE_PROJECT" in new | existing) ;; *) MODE_NAMES="$MODE_PROJECT${MODE_TASK:+/$MODE_TASK}" ;; esac
# The modes that hold a rule, so that a deny names the one that really causes it.
INTEGRITY=""
case "$MODE_PROJECT" in refactor | upgrade | maintenance | freeze) INTEGRITY="$MODE_PROJECT" ;; esac
has_mode hotfix && INTEGRITY=hotfix
LOCKED=""
has_mode freeze && LOCKED=freeze
has_mode hotfix && LOCKED=hotfix

deny() { # <mode> <what> <how to go on>
  hook_deny "Blocked ($1 mode): $2 ${3:-}The mode is the user's to change: /frontend-kit:mode status shows it, /frontend-kit:mode off turns it off (the mode skill says what to do when that cannot run). Do not look for another way around this block."
}
check_deadline() {
  STEPS=$((STEPS + 1))
  if [ "$STEPS" -gt "$SMALL" ] && [ "$SECONDS" -ge "$TIME_LIMIT" ]; then too_long; fi
}
too_long() { deny "$MODE_NAMES" "this call takes too long to check inside the hook's timeout." "Split it into smaller commands. "; }
count_matches() { printf '%s' "$2" | grep -oE "$1" 2>/dev/null | wc -l | tr -d ' '; }

# --- Paths (no subshells: a long command has thousands of words) -----------------------------------------------------
ROOT="$HOOK_ROOT"
ROOT_REAL="$(cd "$HOOK_ROOT" 2>/dev/null && pwd -P)" || ROOT_REAL="$ROOT"
ABS=""
REL=""

set_rel() { # <absolute path>: REL is the path below the project (its own case), "." for the root, empty outside
  REL=""
  shopt -s nocasematch
  case "$1" in
    "$ROOT" | "$ROOT_REAL") REL=. ;;
    "$ROOT"/*) REL="${1:$((${#ROOT} + 1))}" ;;
    "$ROOT_REAL"/*) REL="${1:$((${#ROOT_REAL} + 1))}" ;;
  esac
  shopt -u nocasematch
}

resolve() { # <path of the command> [base]: sets ABS and REL; fails when the path can't be known
  local path="$1" base="${2-$SHELL_DIR}" out="" part
  ABS=""
  REL=""
  [ -n "$path" ] && [ "${#path}" -le "$MAX_PATH" ] || return 1
  case "$path" in *"$ENCODED_NEWLINE"* | *"$NEWLINE"*) return 1 ;; esac
  # shellcheck disable=SC2016,SC2088 # the literal text of the command
  case "$path" in
    '$CLAUDE_PROJECT_DIR'*) path="$ROOT${path#'$CLAUDE_PROJECT_DIR'}" ;;
    '${CLAUDE_PROJECT_DIR}'*) path="$ROOT${path#'${CLAUDE_PROJECT_DIR}'}" ;;
    '$'*) return 1 ;; # a variable; $ later in a name is a name (posts.$id.tsx)
    '~') path="${HOME:-/}" ;;
    '~/'*) path="${HOME:-}/${path#'~/'}" ;;
  esac
  case "$path" in
    /*) ;;
    *)
      [ -n "$base" ] || return 1
      path="$base/$path" ;;
  esac
  local IFS=/
  for part in $path; do
    case "$part" in
      '' | .) ;;
      ..) out="${out%/*}" ;;
      *) out="$out/$part" ;;
    esac
  done
  ABS="${out:-/}"
  set_rel "$ABS"
}

physical_path() { # the same reading as guard-paths.sh: lexical, then through links
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

in_dir() { # <project path> <folder>
  local result=1
  shopt -s nocasematch
  case "$1" in "$2" | "$2"/*) result=0 ;; esac
  shopt -u nocasematch
  return $result
}
is_code() {
  local result=1
  shopt -s nocasematch
  case "$1" in *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.mts | *.cts | *.vue | *.svelte | *.astro) result=0 ;; esac
  shopt -u nocasematch
  return $result
}
is_test_path() {
  local result=1
  shopt -s nocasematch
  case "$1" in
    node_modules/* | */node_modules/* | dist/* | build/* | coverage/*) ;;
    *.test.* | *.spec.* | *.snap | __tests__/* | */__tests__/* | __snapshots__/* | */__snapshots__/* | e2e/* | */e2e/* | tests/* | */tests/* | test/* | */test/*) result=0 ;;
  esac
  shopt -u nocasematch
  return $result
}
is_test_dir() {
  local result=1
  shopt -s nocasematch
  case "$1" in
    node_modules/* | */node_modules/* | dist/* | build/* | coverage/*) ;;
    tests | */tests | test | */test | e2e | */e2e | __tests__ | */__tests__ | __snapshots__ | */__snapshots__) result=0 ;;
  esac
  shopt -u nocasematch
  return $result
}
is_snapshot_path() {
  local result=1
  shopt -s nocasematch
  case "$1" in __snapshots__/* | */__snapshots__/* | *.snap | *.spec.*-snapshots/* | *.test.*-snapshots/*) result=0 ;; esac
  shopt -u nocasematch
  return $result
}
is_tool_config() { # the file whose change moves dependencies, versions or what the checks accept
  local result=1
  shopt -s nocasematch
  case "$1" in node_modules/* | */node_modules/*) ;; *)
    case "${1##*/}" in
      package.json | package-lock.json | pnpm-lock.yaml | pnpm-workspace.yaml | yarn.lock | bun.lock | bun.lockb | .npmrc | .yarnrc | .yarnrc.yml | .nvmrc | .node-version | .tool-versions) result=0 ;;
      tsconfig*.json | jsconfig.json | vite.config.* | vitest.config.* | jest.config.* | next.config.* | nuxt.config.* | svelte.config.* | astro.config.* | angular.json | webpack.config.* | rollup.config.* | turbo.json | nx.json | deno.json | deno.jsonc | cypress.config.* | playwright.config.*) result=0 ;;
      tailwind.config.* | postcss.config.* | babel.config.* | eslint.config.* | .eslintrc* | .oxlintrc* | oxlint.config.* | oxfmt.config.* | .oxfmtrc* | .prettierrc* | prettier.config.* | biome.json | biome.jsonc | commitlint.config.* | lint-staged.config.* | .lintstagedrc*) result=0 ;;
    esac ;;
  esac
  shopt -u nocasematch
  return $result
}

# The files that hold the mode: by their exact place, never by a word in a name. A glob below .claude counts.
is_state_file() {
  local result=1
  shopt -s nocasematch
  case "$1" in
    .claude/frontend-kit.json | .claude/state/task-mode.json) result=0 ;;
    .claude/*'*'* | .claude/*'?'* | .claude/*'['*)
      # shellcheck disable=SC2254 # the word is a pattern here
      case .claude/frontend-kit.json in $1) result=0 ;; esac
      # shellcheck disable=SC2254
      case .claude/state/task-mode.json in $1) result=0 ;; esac ;;
  esac
  shopt -u nocasematch
  return $result
}
is_state_tree() { # what takes those files along when it is removed or moved
  local result=1
  shopt -s nocasematch
  case "$1" in
    .claude | .claude/state) result=0 ;;
    .claude/*'*'* | .claude/*'?'* | .claude/*'['*)
      # shellcheck disable=SC2254
      case .claude/state in $1) result=0 ;; esac ;;
  esac
  shopt -u nocasematch
  return $result
}
is_switch_script() { # a word that runs mode-switch.sh, spelled out or as a glob
  local base="${1##*/}" result=1
  case "$base" in
    mode-switch.sh) result=0 ;;
    mode*'*'* | mode*'?'* | mode*'['*)
      # shellcheck disable=SC2254
      case mode-switch.sh in $base) result=0 ;; esac ;;
  esac
  return $result
}

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

# The whole file as this call would leave it: what a JSON rule has to judge, not the fragments. Empty when old_string
# is not there as written: the Edit tool also matches loosely (curly quotes), and that result can't be known here.
after_edit() {
  case "$TOOL" in
    Write) printf '%s' "$NEW_TEXT" ;;
    Edit | MultiEdit)
      if [ -f "$FILE" ]; then
        printf '%s' "$HOOK_INPUT" | jq -j --rawfile text "$FILE" '
          reduce ((.tool_input.edits // [.tool_input])[]) as $e ($text | split("\r\n") | join("\n");
            ($e.old_string // "") as $old | ($e.new_string // "") as $new
            | if $old == "" then (if . == "" then $new else error("not empty") end)
              else split($old) as $parts
                | if ($parts | length) < 2 then error("old_string not found")
                  elif $e.replace_all == true then ($parts | join($new))
                  else $parts[0] + $new + ($parts[1:] | join($old)) end
              end)' 2>/dev/null
      else
        printf '%s' "$NEW_TEXT"
      fi ;;
  esac
}

SKIP_RE='(^|[^A-Za-z0-9_.])(((it|test|describe)(\.[A-Za-z]+)*\.(skip|only|fixme)|xit|xtest|xdescribe|fdescribe)[[:space:]]*[(.`]|fit(\([[:space:]]*["'\''`]|\.each))'
CASE_RE='(^|[^A-Za-z0-9_.])(it|test)(\.(each|for|concurrent|sequential|only|skip|fixme|fail|fails|failing|todo|runIf|skipIf|slow))*[(`]'
SUPPRESS_RE='@ts-ignore|@ts-expect-error|@ts-nocheck|eslint-disable|oxlint-disable|biome-ignore'
TEST_LINE_RE='\.(test|spec)\.|\.snap$|(^|/)(__tests__|__snapshots__|e2e|tests?)/'

check_edit() {
  local mode rel real_rel path shown
  FILE="$(hook_field '.tool_input.file_path')"
  [ -n "$FILE" ] || FILE="$(hook_field '.tool_input.notebook_path')"
  [ -n "$FILE" ] || return 0
  resolve "$FILE" "$ROOT" || return 0
  FILE="$ABS"
  rel="$REL"
  set_rel "$(physical_path "$FILE")"
  real_rel="$REL"
  [ -n "$rel" ] || rel="$real_rel"
  [ -n "$real_rel" ] || real_rel="$rel"
  # A file outside the project (the scratchpad, ~/.claude) is not what a mode is about.
  [ -n "$rel" ] || return 0
  shown="$rel"
  edit_texts

  if in_dir "$rel" .claude/state/task-mode.json || in_dir "$real_rel" .claude/state/task-mode.json; then
    deny "$MODE_NAMES" "$shown holds the mode itself." "Say what should change instead. "
  fi
  if in_dir "$rel" .claude/frontend-kit.json || in_dir "$real_rel" .claude/frontend-kit.json; then
    config_edit_check
  fi

  for mode in $MODES; do
    for path in "$rel" "$real_rel"; do
      case "$mode" in
        read-only)
          in_dir "$path" "$MODE_REPORT_DIR" ||
            deny read-only "an edit of $shown. Nothing in the project changes; only $MODE_REPORT_DIR/ may be written (the report)." "Put the exact change you would make in your report instead. " ;;
        prototype)
          in_dir "$path" "$MODE_PROTOTYPE_DIR" ||
            deny prototype "an edit of $shown outside $MODE_PROTOTYPE_DIR/." "Put the experiment in $MODE_PROTOTYPE_DIR/<name>/ and say what production code would have to change. " ;;
        freeze | hotfix)
          if is_tool_config "$path"; then
            deny "$mode" "an edit of $shown: dependencies, versions and tool configuration do not change in this mode." "Tell the user what you would change; a security advisory is theirs to make an exception for. "
          fi ;;
      esac
    done
  done
  if has_mode maintenance; then
    case "${real_rel##*/}" in [Pp][Aa][Cc][Kk][Aa][Gg][Ee].[Jj][Ss][Oo][Nn]) maintenance_deps_check ;; esac
  fi

  if [ -n "$INTEGRITY" ]; then
    if is_snapshot_path "$rel" || is_snapshot_path "$real_rel"; then
      deny "$INTEGRITY" "an edit of the snapshot file $shown: a snapshot is not refreshed to get a check green." "Show the user the visual or output difference and let them decide. "
    fi
    if is_code "$real_rel" && is_test_path "$real_rel"; then
      [ "$(count_matches "$SKIP_RE" "$NEW_TEXT")" -gt "$(count_matches "$SKIP_RE" "$OLD_TEXT")" ] &&
        deny "$INTEGRITY" "a test skipped or narrowed (.skip, .only, .fixme, xit, fit) in $shown." "Fix the code or the test; tell the user if the test is wrong. "
      if [ "$TOOL" != NotebookEdit ] && [ "$(count_matches "$CASE_RE" "$NEW_TEXT")" -lt "$(count_matches "$CASE_RE" "$OLD_TEXT")" ]; then
        deny "$INTEGRITY" "fewer test cases in $shown than before this edit." "A test is removed by the user, or after they said why. "
      fi
    fi
  fi
  # Only in code: the plans and reports have to be able to name these comments.
  case "$MODE_PROJECT" in
    refactor | upgrade)
      if is_code "$real_rel" && [ "$(count_matches "$SUPPRESS_RE" "$NEW_TEXT")" -gt "$(count_matches "$SUPPRESS_RE" "$OLD_TEXT")" ]; then
        deny "$MODE_PROJECT" "a new suppression comment (@ts-ignore, eslint-disable, ...) in $shown: a check is fixed, not silenced." "Fix the cause, or list it in the plan as found, not fixed. "
      fi ;;
  esac
  has_mode hotfix && hotfix_budget_check "$real_rel"
  return 0
}

# The mode of a project is changed by /frontend-kit:mode: the file is judged as the edit would leave it.
config_edit_check() {
  local after before_state after_state after_mode
  after="$(after_edit)"
  jq -e 'type == "object"' >/dev/null 2>&1 <<<"$after" ||
    deny "$MODE_NAMES" "a change that leaves .claude/frontend-kit.json without a valid JSON object, or whose old_string is not in it as written." "Edit single keys, quote the text exactly and keep it valid. "
  case "$MODE_PROJECT" in
    new | existing) ;;
    *) # the cheap check before jq reads the text, so the mode has to stay readable there
      mode_raw_text "$after" ||
        deny "$MODE_NAMES" "a change that stops .claude/frontend-kit.json naming the mode in plain text." "The user switches modes with /frontend-kit:mode. " ;;
  esac
  if [ -n "$MODE_BROKEN" ]; then # a repair may go through, with the mode that was read from the text
    after_mode="$(jq -r '.mode // "existing"' <<<"$after" 2>/dev/null)"
    [ "$after_mode" = "$MODE_PROJECT" ] && return 0
  else
    local state='[(.mode // "existing"), .modeState, .modes, .guards]'
    if [ -f "$FILE" ]; then before_state="$(jq -c "$state" "$FILE" 2>/dev/null)"; else before_state="$(jq -nc "{} | $state")"; fi
    after_state="$(jq -c "$state" <<<"$after" 2>/dev/null)"
    [ -n "$after_state" ] && [ "$before_state" = "$after_state" ] && return 0
  fi
  deny "$MODE_NAMES" "a change of \"mode\", \"modeState\", \"modes\" or \"guards\" in .claude/frontend-kit.json." "Edit other keys freely; the user switches modes with /frontend-kit:mode. "
}

DEP_NAMES='[.dependencies, .devDependencies, .optionalDependencies, .peerDependencies | objects | keys[]] | .[]'
# maintenance: package.json may change versions and scripts, not gain a package.
maintenance_deps_check() {
  local old_names new_names name after
  old_names=""
  if [ -f "$FILE" ]; then
    old_names="$(jq -r "$DEP_NAMES" "$FILE" 2>/dev/null)" || return 0 # broken already: nothing to compare with
  fi
  after="$(after_edit)"
  jq -e 'type == "object"' >/dev/null 2>&1 <<<"$after" ||
    deny maintenance "an edit that leaves package.json without valid JSON, or whose old_string is not in it as written, so new dependencies can't be judged." "Quote the text exactly and keep the JSON valid. "
  new_names="$(jq -r "$DEP_NAMES" <<<"$after" 2>/dev/null)"
  while IFS= read -r name; do
    [ -n "$name" ] || continue
    grep -qxF -- "$name" <<<"$old_names" ||
      deny maintenance "a new dependency ($name) in package.json: nothing new comes in while the app is only maintained." "Say what a fix would need, and why. "
  done <<<"$new_names"
}

# hotfix: the smallest change. Tests are not counted; the files already changed are, and editing one again is free.
hotfix_budget_check() {
  local rel="$1" budget base changed me count watched=1
  is_test_path "$rel" && return 0
  shopt -s nocasematch
  kit_watched "$rel" && watched=0
  shopt -u nocasematch
  [ "$watched" -eq 0 ] || return 0
  budget="$(mode_file_budget)"
  base="$(mode_detail hotfix base)"
  changed="$(
    {
      hook_changed_src_files
      if [ -n "$base" ] && git -C "$HOOK_ROOT" rev-parse -q --verify "$base^{commit}" >/dev/null 2>&1; then
        git -C "$HOOK_ROOT" diff -z --name-only --relative --no-renames "$base...HEAD" -- "${KIT_SRC_PATHS[@]}" 2>/dev/null | tr '\0' '\n'
      fi
    } | tr '[:upper:]' '[:lower:]' | grep -Ev "$TEST_LINE_RE" | sed '/^$/d' | sort -u
  )"
  me="$(printf '%s' "$rel" | tr '[:upper:]' '[:lower:]')"
  grep -qxF -- "$me" <<<"$changed" && return 0
  count=$(($(printf '%s' "$changed" | grep -c '') + 1))
  if [ "$count" -gt "$budget" ]; then
    deny hotfix "this would be source file number $count; the budget is $budget (a hotfix is the smallest change that stops the harm)." "If the fix really needs more, the user raises it: /frontend-kit:mode hotfix --files <n>. "
  fi
}

# --- Skill, EnterWorktree, MCP ------------------------------------------------------------------------------------
check_skill() {
  local args
  case "$(hook_field '.tool_input.skill')" in
    frontend-kit:mode | frontend-kit:refactor-mode | frontend-kit:upgrade-mode) ;;
    *) return 0 ;;
  esac
  args="$(hook_field '.tool_input.args')"
  args="${args#"${args%%[![:space:]]*}"}"
  case "${args%%[[:space:]]*}" in
    '' | status | list | audit | plan | next)
      case "$args" in *"$NEWLINE"*) ;; *) return 0 ;; esac ;;
  esac
  deny "$MODE_NAMES" "a mode switch through the Skill tool." "Ask the user to type the command as a message of its own. "
}

# read-only: an MCP tool is judged by its name alone.
check_mcp() {
  has_mode read-only || return 0
  local leaf first token reads="" writes="" joined="" hard=""
  leaf="$(printf '%s' "${TOOL##*__}" | sed -E 's/([a-z0-9])([A-Z])/\1_\2/g' | tr 'A-Z-' 'a-z_')"
  first="${leaf%%_*}"
  local IFS=_
  for token in $leaf; do
    case "$token" in
      create | update | patch | put | post | delete | remove | set | write | send | execute | exec | run | add | move | transition | mark | upload | edit | insert | replace | append | trash | publish | merge | push | approve | reject | assign | archive | cancel | close | submit | drop | truncate | rename | install | deploy | click | type | fill | evaluate | press | drag | start | stop | reset | revoke | import | apply | modify | save | switch | restart | kill | invoke | trigger | login | logout) writes=1 ;;
      get | list | read | search | view | find | fetch | lookup | query | resolve | describe | show | status | whoami | snapshot | screenshot | navigate | wait | messages | requests) reads=1 ;;
      and | or) joined=1 ;;
    esac
    case "$token" in replace | write | delete) hard=1 ;; esac
  done
  case "$leaf" in new_page | select_page) reads=1 ;; esac
  # A name that starts as a read is one, whatever noun follows (get_merge_request); get_or_create is not.
  case "$first" in
    get | list | search | describe | view | find | read | fetch | lookup)
      if [ -z "$hard" ]; then [ -n "$joined" ] && [ -n "$writes" ] || return 0; fi ;;
    *) [ -n "$reads" ] && [ -z "$writes" ] && return 0 ;;
  esac
  deny read-only "the tool $TOOL: only tools named like a read are allowed." "Say what you would have done with it. "
}

# --- Shell: what one command writes ---------------------------------------------------------------------------------
SHELL_DIR="$ROOT"
DIR_STACK=()
SEG_WORDS=()
SEG_TARGETS=()
SEG_STDIN=()
SEG_FROM_SUBST=""
NESTING=0
ASSIGNMENT_RE='^[A-Za-z_][A-Za-z0-9_]*\+?='

holds_tests() { # what a removal there can take: code, snapshots, a glob, or a folder (a name without a dot)
  case "${1##*/}" in *'*'* | *'?'*) return 0 ;; esac
  case "${1##*/}" in *.*) ;; *) return 0 ;; esac
  is_code "$1" || is_snapshot_path "$1"
}

config_dirty() { # the switch is not committed yet, so git can throw it away
  case "$MODE_PROJECT" in new | existing) return 1 ;; esac
  git -C "$ROOT" rev-parse -q --verify HEAD >/dev/null 2>&1 || return 1
  ! git -C "$ROOT" diff --quiet HEAD -- .claude/frontend-kit.json 2>/dev/null
}

write_target() { # <path> <redirect | write | remove>
  local path="$1" kind="$2"
  check_deadline
  case "$path" in /dev/null | /dev/stdout | /dev/stderr | /dev/tty) return 0 ;; esac
  resolve "$path" || return 0
  [ -n "$REL" ] || return 0
  if is_state_file "$REL" || { [ "$kind" = remove ] && is_state_tree "$REL"; }; then
    deny "$MODE_NAMES" "a shell change of $REL, which holds the mode." "The user changes the mode with /frontend-kit:mode; edit other keys of the config with the Edit tool. "
  fi
  if [ -n "$INTEGRITY" ]; then
    if [ "$kind" = remove ]; then
      if is_test_dir "$REL" || { is_test_path "$REL" && holds_tests "$REL"; }; then
        deny "$INTEGRITY" "deleting $REL: a test file or folder is never deleted to get a check green." "Tell the user which test is obsolete and why. "
      fi
    elif [ "$kind" = redirect ] && [ -e "$ABS" ] && is_test_path "$REL" && { is_code "$REL" || is_snapshot_path "$REL"; }; then
      deny "$INTEGRITY" "a shell write over the existing test file $REL: tests are not rewritten from the shell." "Use the Edit tool, so that the change can be checked. "
    fi
  fi
  if [ -n "$LOCKED" ] && is_tool_config "$REL"; then
    deny "$LOCKED" "a shell change of $REL: dependencies, versions and tool configuration do not change in this mode." "Tell the user what you would change. "
  fi
  if has_mode prototype && ! in_dir "$REL" "$MODE_PROTOTYPE_DIR"; then
    deny prototype "a shell write into $REL outside $MODE_PROTOTYPE_DIR/." "Keep the experiment in $MODE_PROTOTYPE_DIR/<name>/. "
  fi
}

copy_targets() { # <cp | mv | ln | install | rsync> <args...>
  local tool="$1" arg skip="" into="" args=() n i dest
  shift
  for arg in "$@"; do
    if [ -n "$skip" ]; then
      [ "$skip" = into ] && into="$arg"
      skip=""
      continue
    fi
    case "$arg" in
      --target-directory=*) into="${arg#*=}" ;;
      -t | --target-directory) case "$tool" in rsync) ;; *) skip=into ;; esac ;;
      -m | -o | -g) [ "$tool" = install ] && skip=value ;;
      -*) ;;
      *) args+=("$arg") ;;
    esac
  done
  n=${#args[@]}
  if [ -z "$into" ]; then
    [ "$n" -ge 2 ] || return 0
    n=$((n - 1))
    into="${args[$n]}"
  fi
  if [ "$tool" = mv ]; then
    for ((i = 0; i < n; i++)); do write_target "${args[$i]}" remove; done
  fi
  case "$into" in
    */) dest=1 ;;
    *)
      dest=""
      resolve "$into" && [ -d "$ABS" ] && dest=1 ;;
  esac
  if [ -n "$dest" ]; then
    for ((i = 0; i < n; i++)); do
      arg="${args[$i]%/}"
      write_target "${into%/}/${arg##*/}" write
    done
  else
    write_target "$into" write
  fi
}

sed_targets() {
  local arg skip="" script="" inplace="" files=()
  for arg in "$@"; do
    if [ -n "$skip" ]; then skip=""; continue; fi
    case "$arg" in
      --in-place*) inplace=1 ;;
      -e | -f | --expression | --file) skip=1; script=1 ;;
      --expression=* | --file=*) script=1 ;;
      -*)
        [[ "$arg" =~ ^-[nErsuzl]*[iI] ]] && inplace=1
        if [[ "$arg" =~ ^-[nErsuzl]*[ef]$ ]]; then skip=1; script=1; fi ;;
      '') ;; # BSD: -i ''
      *) if [ -n "$script" ]; then files+=("$arg"); else script=1; fi ;;
    esac
  done
  [ -n "$inplace" ] || return 0
  for arg in ${files[@]+"${files[@]}"}; do write_target "$arg" write; done
}

perl_targets() {
  local arg skip="" inplace="" files=()
  for arg in "$@"; do
    if [ -n "$skip" ]; then skip=""; continue; fi
    case "$arg" in
      -*)
        [[ "$arg" =~ ^-[pnlwW0-7]*i ]] && inplace=1
        [[ "$arg" =~ ^-[A-Za-z0-9]*[eE]$ ]] && skip=1 ;;
      *) files+=("$arg") ;;
    esac
  done
  [ -n "$inplace" ] || return 0
  for arg in ${files[@]+"${files[@]}"}; do write_target "$arg" write; done
}

writer_targets() { # <command name> <args...>
  local name="$1" arg skip="" first=""
  shift
  case "$name" in
    tee | sponge)
      for arg in "$@"; do case "$arg" in -*) ;; *) write_target "$arg" redirect ;; esac; done ;;
    rm | unlink | trash | shred | rmdir)
      for arg in "$@"; do case "$arg" in -*) ;; *) write_target "$arg" remove ;; esac; done ;;
    truncate | touch)
      for arg in "$@"; do
        if [ -n "$skip" ]; then skip=""; continue; fi
        case "$arg" in -s | -r | -d | -t) skip=1 ;; -*) ;; *) write_target "$arg" write ;; esac
      done ;;
    chmod | chown)
      for arg in "$@"; do
        case "$arg" in -*) ;; *) if [ -z "$first" ]; then first=1; else write_target "$arg" write; fi ;; esac
      done ;;
    dd) for arg in "$@"; do case "$arg" in of=*) write_target "${arg#of=}" redirect ;; esac; done ;;
    cp | mv | ln | install | rsync) copy_targets "$name" "$@" ;;
    sed | gsed) sed_targets "$@" ;;
    perl) perl_targets "$@" ;;
    find | gfind)
      case " $* " in *' -delete '*) ;; *) return 0 ;; esac
      for arg in "$@"; do case "$arg" in -* | '(' | '!') break ;; *) write_target "$arg" remove ;; esac; done ;;
  esac
}

interpreter_check() { # code in a word or on stdin that writes the mode's files
  local arg code=""
  for arg in "$@" ${SEG_STDIN[@]+"${SEG_STDIN[@]}"}; do code="$code $arg"; done
  [ "${#code}" -le 16000 ] || return 0
  case "$code" in
    *frontend-kit.json* | *task-mode.json*)
      case "$code" in
        *[Ww]rite* | *"'w'"* | *'"w"'* | *unlink* | *remove* | *rename* | *truncate* | *rmSync*)
          deny "$MODE_NAMES" "code that writes the file holding the mode." "Only the user switches modes. " ;;
      esac ;;
    *mode-switch.sh*)
      case "$code" in
        *spawn* | *exec* | *system* | *subprocess*) deny "$MODE_NAMES" "code that runs the mode switch." "Only the user switches modes. " ;;
      esac ;;
  esac
}

# --- Shell: package managers and test runners -----------------------------------------------------------------------
snapshot_flag_check() {
  [ -n "$INTEGRITY" ] || return 0
  local arg
  for arg in "$@"; do
    case "$arg" in
      --update=false) ;;
      -u | --update | --update=* | --updateSnapshot | --updateSnapshot=* | --update-snapshots | --update-snapshots=* | --update-snapshot)
        deny "$INTEGRITY" "a test run that refreshes snapshots ($arg): a snapshot is not refreshed to get a check green." "Show the user the difference and let them decide. " ;;
    esac
  done
}

pm_parse() { # <manager> <args...>: PM_SUB, PM_AT (words up to it), PM_ARGS, PM_REST, PM_DIR
  local pm="$1" arg skip="" at=0
  shift
  PM_SUB=""
  PM_AT=0
  PM_ARGS=()
  PM_REST=()
  PM_DIR=""
  for arg in "$@"; do
    at=$((at + 1))
    if [ -n "$skip" ]; then
      [ "$skip" = dir ] && PM_DIR="$arg"
      skip=""
      continue
    fi
    [ -z "$PM_SUB" ] || PM_REST+=("$arg")
    case "$arg" in
      --prefix | --dir | --cwd | -C) skip=dir ;;
      --prefix=* | --dir=* | --cwd=*) PM_DIR="${arg#*=}" ;;
      --workspace | --filter | --registry | --cache | --loglevel | --reporter | --tag | --omit | --include | --network-concurrency) skip=value ;;
      -F) [ "$pm" = pnpm ] && skip=value ;;
      -w) [ "$pm" = npm ] && skip=value ;;
      -*) ;;
      *)
        if [ -n "$PM_SUB" ]; then PM_ARGS+=("$arg")
        elif [ "$arg" = workspace ] && [ "$pm" = yarn ]; then skip=value
        else
          PM_SUB="$arg"
          PM_AT=$at
        fi ;;
    esac
  done
}

KNOWN_DEPS=""
known_dep() { # <package spec>: is that package already in a package.json here?
  local name="$1" dir files=()
  case "$name" in @*) name="${name#@}"; name="@${name%%@*}" ;; *) name="${name%%@*}" ;; esac
  if [ -z "$KNOWN_DEPS" ]; then
    files=()
    for dir in "$ROOT" "$SHELL_DIR" "$PM_DIR"; do
      [ -n "$dir" ] && resolve "$dir" && [ -f "$ABS/package.json" ] && files+=("$ABS/package.json")
    done
    [ ${#files[@]} -gt 0 ] || return 1
    KNOWN_DEPS="$NEWLINE$(jq -r "$DEP_NAMES" "${files[@]}" 2>/dev/null)$NEWLINE"
  fi
  case "$KNOWN_DEPS" in *"$NEWLINE$name$NEWLINE"*) return 0 ;; esac
  return 1
}

pm_checks() { # <manager>, after pm_parse
  local pm="$1" sub="$PM_SUB" kind="" arg
  case "$sub" in
    test | t) snapshot_flag_check ${PM_REST[@]+"${PM_REST[@]}"} ;;
    run | run-script)
      case "${PM_ARGS[0]:-}" in *test* | *e2e* | *snap* | *vitest* | *jest* | *playwright*) snapshot_flag_check ${PM_REST[@]+"${PM_REST[@]}"} ;; esac ;;
    vitest | jest | playwright) snapshot_flag_check ${PM_REST[@]+"${PM_REST[@]}"} ;;
    *test* | *e2e*) case "$pm" in yarn | pnpm) snapshot_flag_check ${PM_REST[@]+"${PM_REST[@]}"} ;; esac ;;
  esac
  case "$sub" in
    install | i | in | ins | inst | insta | instal | isntall) if [ ${#PM_ARGS[@]} -gt 0 ]; then kind=add; else kind=install; fi ;;
    add) kind=add ;;
    link) if [ ${#PM_ARGS[@]} -gt 0 ]; then kind=add; else kind=change; fi ;;
    ci) kind=install ;;
    '') [ "$pm" = yarn ] && kind=install ;;
    remove | rm | uninstall | un | unlink | update | up | upgrade | dedupe) kind=change ;;
    audit)
      for arg in ${PM_REST[@]+"${PM_REST[@]}"}; do case "$arg" in fix | --fix) kind=fix ;; esac; done ;;
    pkg) case "${PM_ARGS[0]:-}" in set | delete | rm | fix) kind=edit ;; esac ;;
  esac
  [ -n "$kind" ] || return 0
  if has_mode upgrade; then
    shift
    for arg in "$@"; do
      case "$arg" in --force | -f | --legacy-peer-deps | --no-peer-deps | --strict-peer-dependencies=false | --config.strict-peer-dependencies=false)
        deny upgrade "an install with $arg: it ignores the peer-dependency contract the upgrade exists to satisfy." "Resolve the peer conflict, or tell the user which package blocks. " ;;
      esac
    done
  fi
  [ "$kind" != install ] || return 0
  if [ -n "$LOCKED" ]; then
    deny "$LOCKED" "\"$pm $sub\" changes dependencies or package.json, which do not change in this mode." "Tell the user what you would change; a security advisory is theirs to make an exception for. "
  fi
  if has_mode prototype; then
    deny prototype "\"$pm $sub\": a prototype does not change the project's dependencies." "Write the prototype with what is installed, or say what it would need. "
  fi
  if has_mode maintenance && [ "$kind" = add ]; then
    for arg in ${PM_ARGS[@]+"${PM_ARGS[@]}"}; do
      known_dep "$arg" ||
        deny maintenance "\"$pm $sub $arg\": nothing new comes in while the app is only maintained (a new version of a package that is there is fine)." "Say what a fix would need, and why. "
    done
  fi
}

# --- Shell: git -----------------------------------------------------------------------------------------------------
git_checks() {
  local sub="" arg skip="" keep_dir="$SHELL_DIR" args=() paths=() staged="" worktree="" dry="" ignored="" whole=""
  for arg in "$@"; do
    if [ -n "$skip" ]; then
      if [ "$skip" = dir ]; then if resolve "$arg"; then SHELL_DIR="$ABS"; else SHELL_DIR=""; fi; fi
      skip=""
      continue
    fi
    if [ -z "$sub" ]; then
      case "$arg" in -C) skip=dir ;; -c | --git-dir | --work-tree | --namespace) skip=value ;; -*) ;; *) sub="$arg" ;; esac
      continue
    fi
    args+=("$arg")
    case "$arg" in
      --staged | -S) staged=1 ;;
      --worktree | -W) worktree=1 ;;
      --dry-run) dry=1 ;;
      -m | --message) [ "$sub" = stash ] && skip=value ;;
      --*) ;;
      -*)
        case "$arg" in *[xX]*) ignored=1 ;; esac
        case "$arg" in *n*) dry=1 ;; esac ;;
      *) paths+=("$arg") ;;
    esac
  done
  case "$sub" in
    commit | push)
      if has_mode prototype; then
        deny prototype "git $sub: a prototype is never committed and never leaves this machine." "Say what the experiment showed; rebuild what is worth keeping after the mode is off. "
      fi ;;
    rm)
      for arg in ${paths[@]+"${paths[@]}"}; do write_target "$arg" remove; done ;;
    mv)
      for arg in ${paths[@]+"${paths[@]}"}; do
        resolve "$arg" || continue
        if is_state_file "$REL" || is_state_tree "$REL"; then write_target "$arg" remove
        elif has_mode prototype || [ -n "$LOCKED" ]; then write_target "$arg" write; fi
      done ;;
    checkout | restore)
      if [ "$sub" != restore ] || [ -z "$staged" ] || [ -n "$worktree" ]; then
        for arg in ${paths[@]+"${paths[@]}"}; do
          resolve "$arg" || continue
          if is_state_file "$REL"; then
            deny "$MODE_NAMES" "git $sub of $REL, which holds the mode." "Only the user switches modes. "
          fi
          case "$arg" in :/) whole=1 ;; esac
          case "$REL" in . | .claude) whole=1 ;; esac
        done
        if [ -n "$whole" ] && config_dirty; then
          deny "$MODE_NAMES" "git $sub of the whole tree would throw away the mode switch, which is not committed yet." "Name the files you mean. "
        fi
      fi ;;
    stash)
      case "${paths[0]:-push}" in
        push | save)
          if [ ${#paths[@]} -le 1 ]; then
            whole=1
          else
            for arg in "${paths[@]:1}"; do
              resolve "$arg" || continue
              case "$REL" in . | .claude | .claude/frontend-kit.json) whole=1 ;; esac
            done
            [ "${paths[0]}" = save ] && whole=1
          fi
          if [ -n "$whole" ] && config_dirty; then
            deny "$MODE_NAMES" "git stash would put away the mode switch, which is not committed yet." "Stash named paths instead (git stash push -- <paths>). "
          fi ;;
      esac ;;
    clean)
      if [ -n "$MODE_TASK" ] && [ -n "$ignored" ] && [ -z "$dry" ]; then
        [ ${#paths[@]} -gt 0 ] || whole=1
        for arg in ${paths[@]+"${paths[@]}"}; do
          resolve "$arg" || continue
          if [ "$REL" = . ] || is_state_tree "$REL"; then whole=1; fi
        done
        if [ -n "$whole" ]; then
          deny "$MODE_NAMES" "git clean of ignored files would delete the task mode in .claude/state." "Name the folder you mean. "
        fi
      fi ;;
  esac
  SHELL_DIR="$keep_dir"
}

# --- Shell: read-only's short list ----------------------------------------------------------------------------------
SED_ADDRESS='([0-9]+|[$]|/[^][/\]*/)' # no bracket or backslash: sed and a regex would end such an address differently
SED_STEP="$SED_ADDRESS?(,$SED_ADDRESS)?[p=]"
SED_READ_RE="^$SED_STEP(; *$SED_STEP)*\$"

ro_git() {
  local sub="" arg skip="" args=() listing=""
  for arg in "$@"; do
    if [ -n "$skip" ]; then skip=""; continue; fi
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
    case "$arg" in --output | --output=* | --ext-diff | --open-files-in-pager* | --open-files*) return 1 ;; esac
  done
  case "$sub" in
    status | diff | log | show | blame | ls-files | ls-tree | rev-parse | rev-list | describe | shortlog | cat-file | merge-base | show-ref | for-each-ref | count-objects | whatchanged | version | var | check-ignore | diff-tree | name-rev | diff-index | diff-files) return 0 ;;
    grep)
      for arg in ${args[@]+"${args[@]}"}; do case "$arg" in --*) ;; -*O*) return 1 ;; esac; done
      return 0 ;;
    reflog)
      case "${args[0]:-show}" in show | -n* | --oneline | --date=* | HEAD) return 0 ;; esac
      return 1 ;;
    branch | tag)
      for arg in ${args[@]+"${args[@]}"}; do
        case "$arg" in
          --list | -l | --contains | --no-contains | --merged | --no-merged | --points-at) listing=1 ;;
          --sort=* | --format=*) ;;
          -a | -r | -v | -vv | -av | -rv | -avv | --show-current | --all | --remotes | --verbose) [ "$sub" = branch ] || return 1 ;;
          -n | -n[0-9]*) [ "$sub" = tag ] || return 1; listing=1 ;;
          -*) return 1 ;;
        esac
      done
      [ -n "$listing" ] && return 0
      for arg in ${args[@]+"${args[@]}"}; do case "$arg" in -*) ;; *) return 1 ;; esac; done
      return 0 ;;
    remote)
      for arg in ${args[@]+"${args[@]}"}; do
        case "$arg" in -v | --verbose) ;; show | get-url) return 0 ;; *) return 1 ;; esac
      done
      return 0 ;;
    stash) case "${args[0]:-}" in list | show) return 0 ;; esac ;;
    config)
      for arg in ${args[@]+"${args[@]}"}; do
        case "$arg" in --unset* | --add | --replace-all | --edit | -e | --rename-section | --remove-section) return 1 ;; esac
      done
      for arg in ${args[@]+"${args[@]}"}; do
        case "$arg" in
          --global | --local | --system | --worktree | --show-origin | --show-scope) ;;
          --get | --get-all | --get-regexp | --list | -l) return 0 ;;
          *) return 1 ;;
        esac
      done ;;
    worktree) [ "${args[0]:-}" = list ] && return 0 ;;
  esac
  return 1
}

ro_ok() { # <name> <args...>: is this one plain read?
  local name="$1" arg skip="" script="" count=0
  shift
  case "$name" in
    ls | cat | head | tail | wc | grep | egrep | fgrep | stat | du | df | pwd | echo | printf | true | false | test | '[' | '[[' | basename | dirname | realpath | readlink | cut | tr | column | comm | diff | cmp | which | type | cd | pushd | popd | nl | rev | tac | md5sum | shasum | sha256sum | cksum | od | hexdump | strings | jq | sleep) return 0 ;;
    command)
      case "${1:-}" in -v | -V) return 0 ;; esac ;;
    date)
      for arg in "$@"; do case "$arg" in +* | -u | --utc | -R | -I | -I* | --iso-8601*) ;; *) return 1 ;; esac; done
      return 0 ;;
    file)
      for arg in "$@"; do case "$arg" in --com*) return 1 ;; --*) ;; -*C*) return 1 ;; esac; done
      return 0 ;;
    uniq)
      for arg in "$@"; do
        if [ -n "$skip" ]; then skip=""; continue; fi
        case "$arg" in -f | -s | -w) skip=1 ;; -*) ;; *) count=$((count + 1)) ;; esac
      done
      [ "$count" -le 1 ] && return 0 ;;
    tree)
      for arg in "$@"; do case "$arg" in --o* | -R) return 1 ;; --*) ;; -*o*) return 1 ;; esac; done
      return 0 ;;
    rg)
      for arg in "$@"; do case "$arg" in --pre | --pre=* | --hostname-bin | --hostname-bin=*) return 1 ;; esac; done
      return 0 ;;
    sort)
      for arg in "$@"; do case "$arg" in --o* | --co*) return 1 ;; --*) ;; -*o*) return 1 ;; esac; done
      return 0 ;;
    find | gfind)
      for arg in "$@"; do case "$arg" in -exec | -execdir | -ok | -okdir | -delete | -fprint* | -fls) return 1 ;; esac; done
      return 0 ;;
    sed | gsed) # only print by line or pattern
      for arg in "$@"; do
        if [ -z "$script" ]; then
          case "$arg" in
            -n | -nE | -En | -nr | -rn) skip=1 ;;
            -E | -r) ;;
            -*) return 1 ;;
            *)
              script=1
              [ -n "$skip" ] && [[ "$arg" =~ $SED_READ_RE ]] || return 1 ;;
          esac
        else
          case "$arg" in -*) return 1 ;; esac
        fi
      done
      [ -n "$script" ] && return 0 ;;
    awk | gawk | mawk) # a program with no way to write or to run something
      for arg in "$@"; do
        if [ -n "$skip" ]; then skip=""; continue; fi
        if [ -z "$script" ]; then
          case "$arg" in
            -F | -v) skip=1 ;;
            -F* | -v*) ;;
            -*) return 1 ;;
            *)
              script=1
              case "$arg" in *system* | *getline* | *'>'* | *'|'* | *'@'*) return 1 ;; esac ;;
          esac
        else
          case "$arg" in -*) return 1 ;; esac
        fi
      done
      [ -n "$script" ] && return 0 ;;
    git) ro_git "$@"; return $? ;;
    gh)
      for arg in "$@"; do case "$arg" in --web | -w) return 1 ;; esac; done
      case "${1:-}" in
        search) return 0 ;;
        pr | issue | run | release | repo | workflow | label | cache | ruleset)
          case "${2:-}" in view | list | status | diff | checks) return 0 ;; esac ;;
      esac ;;
    npm | pnpm | yarn | bun)
      pm_parse "$name" "$@"
      case "$PM_SUB" in
        ls | list | la | ll | why | view | info | show | outdated | explain | licenses) return 0 ;;
        audit)
          for arg in "$@"; do case "$arg" in fix | --fix) return 1 ;; esac; done
          return 0 ;;
      esac ;;
  esac
  return 1
}

# --- Shell: one simple command --------------------------------------------------------------------------------------
check_segment() {
  local words=() name="" depth=0 target arg flag skip script value
  words=(${SEG_WORDS[@]+"${SEG_WORDS[@]}"})
  # keywords in front of the command: then npm install x, do rm y
  while [ ${#words[@]} -gt 0 ]; do
    case "${words[0]}" in
      then | do | else | elif | if | while | until | '!' | '{') words=("${words[@]:1}") ;;
      for | select | case | done | fi | esac | '}') words=() ;; # substitutions in them are judged as their own commands
      *) break ;;
    esac
  done
  # assignments in front of the command (VAR=value cmd)
  while [ ${#words[@]} -gt 0 ] && [[ "${words[0]}" =~ $ASSIGNMENT_RE ]]; do
    if has_mode read-only; then
      deny read-only "a command that sets variables in front of it." "Run the plain read command. "
    fi
    words=("${words[@]:1}")
  done

  for target in ${SEG_TARGETS[@]+"${SEG_TARGETS[@]}"}; do
    case "$target" in /dev/null | /dev/stderr | /dev/stdout | '&'* | - | [0-9]) continue ;; esac
    if has_mode read-only; then
      deny read-only "a shell redirection into $target: nothing is written." "Use the Write tool for the report in $MODE_REPORT_DIR/ if you need to save something. "
    fi
    write_target "$target" redirect
  done
  [ ${#words[@]} -gt 0 ] || return 0

  if has_mode read-only; then
    value="${words[0]}"
    name="${value##*/}"
    case "$value" in
      /bin/"$name" | /usr/bin/"$name" | /usr/local/bin/"$name" | /opt/homebrew/bin/"$name") ;;
      */*) name="$value" ;; # a file of the project or of anyone else is code, whatever it is called
    esac
    if [ "$name" != eval ] || [ -z "$SEG_FROM_SUBST" ]; then
      ro_ok "$name" "${words[@]:1}" ||
        deny read-only "the command \"$name\": read-only mode runs only plain reads (ls, cat, grep, rg, find without -exec, sed -n, git status/diff/log/show, npm ls/view/outdated ...), runs no project code and installs nothing." "Say which check you want run; the user runs it or turns the mode off. "
    fi
  fi

  # down to the command that really runs: env, timeout, npx, pnpm exec ...
  while [ "$depth" -lt 8 ] && [ ${#words[@]} -gt 0 ]; do
    depth=$((depth + 1))
    name="${words[0]##*/}"
    case "$name" in
      command)
        case "${words[1]:-}" in -v | -V) return 0 ;; esac ;;
      env | builtin | exec | nohup | time | sudo | nice | ionice | stdbuf | timeout | gtimeout | xargs) ;;
      npx | bunx | corepack)
        words=("${words[@]:1}")
        while [ ${#words[@]} -gt 0 ]; do
          case "${words[0]}" in
            -p | --package) words=("${words[@]:1}"); [ ${#words[@]} -eq 0 ] || words=("${words[@]:1}") ;;
            -*) words=("${words[@]:1}") ;;
            *) break ;;
          esac
        done
        if [ ${#words[@]} -gt 0 ]; then
          value="${words[0]##*/}"
          case "$value" in ?*@*) value="${value%%@*}" ;; esac
          words[0]="$value"
        fi
        continue ;;
      npm | pnpm | yarn | bun)
        pm_parse "$name" "${words[@]:1}"
        case "$name:$PM_SUB" in
          npm:exec | npm:x | pnpm:exec | pnpm:dlx | yarn:exec | yarn:dlx | bun:x)
            words=("${words[@]:$((PM_AT + 1))}")
            while [ ${#words[@]} -gt 0 ]; do
              case "${words[0]}" in -*) words=("${words[@]:1}") ;; *) break ;; esac
            done
            continue ;;
        esac
        break ;;
      *) break ;;
    esac
    words=("${words[@]:1}")
    skip=""
    while [ ${#words[@]} -gt 0 ]; do
      value="${words[0]}"
      if [ -n "$skip" ]; then
        skip=""
      else
        case "$name:$value" in
          env:-u | env:-C | exec:-a | sudo:-u | sudo:-g | nice:-n | ionice:-c | ionice:-n | timeout:-s | timeout:-k | gtimeout:-s | gtimeout:-k | xargs:-n | xargs:-P | xargs:-I | xargs:-L | xargs:-s | xargs:-E | xargs:-d) skip=1 ;;
          *:-*) ;;
          env:*=* | timeout:[0-9]* | gtimeout:[0-9]*) ;;
          *) break ;;
        esac
      fi
      words=("${words[@]:1}")
    done
  done
  [ ${#words[@]} -gt 0 ] || return 0
  name="${words[0]##*/}"

  if is_switch_script "${words[0]}"; then
    deny "$MODE_NAMES" "the mode switch run by a tool." "Only the user switches modes. "
  fi
  case "$name" in
    cd | pushd)
      value=""
      for arg in "${words[@]:1}"; do case "$arg" in -?*) ;; *) value="$arg"; break ;; esac; done
      if [ -z "$value" ] && [ "$name" = cd ]; then value="${HOME:-/}"; fi
      if [ "$value" != - ] && resolve "$value"; then SHELL_DIR="$ABS"; else SHELL_DIR=""; fi ;;
    sh | bash | zsh | dash | ksh | ash | fish | source | .)
      flag=""
      script=""
      skip=""
      for arg in "${words[@]:1}"; do
        if [ -n "$skip" ]; then skip=""; continue; fi
        case "$arg" in
          -o | +o | -O | +O) skip=1 ;;
          --*) ;;
          -*c*) flag=1 ;;
          -* | +*) ;;
          *) script="$arg"; break ;;
        esac
      done
      if [ -n "$flag" ]; then
        [ -z "$script" ] || scan_nested "$script"
      elif [ -n "$script" ]; then
        if is_switch_script "$script"; then deny "$MODE_NAMES" "the mode switch run by a tool." "Only the user switches modes. "; fi
      else
        for arg in ${SEG_STDIN[@]+"${SEG_STDIN[@]}"}; do scan_nested "$arg"; done
      fi ;;
    eval) scan_text "${words[*]:1}" ;;
    python | python[0-9]* | node | nodejs | deno | perl | ruby | php | osascript)
      interpreter_check "${words[@]:1}"
      [ "$name" != perl ] || perl_targets "${words[@]:1}" ;;
    npm | pnpm | yarn | bun)
      pm_parse "$name" "${words[@]:1}"
      pm_checks "$name" "${words[@]:1}"
      [ "$name" != bun ] || interpreter_check "${words[@]:1}" ;;
    git) git_checks "${words[@]:1}" ;;
    vitest | jest | playwright) snapshot_flag_check "${words[@]:1}" ;;
    *) writer_targets "$name" "${words[@]:1}" ;;
  esac
  return 0
}

scan_nested() { # code for another shell: its cd stays there
  local keep_dir="$SHELL_DIR"
  scan_text "$1"
  SHELL_DIR="$keep_dir"
}

eval_records() { # <records>
  local records="$1" record value last="" depth
  SEG_WORDS=()
  SEG_TARGETS=()
  SEG_STDIN=()
  SEG_FROM_SUBST=""
  while IFS= read -r record; do
    [ -n "$record" ] || continue
    check_deadline
    case "$record" in
      '(' | '[')
        DIR_STACK+=("$SHELL_DIR")
        last="$record"
        continue ;;
      ')' | ']')
        depth=${#DIR_STACK[@]}
        if [ "$depth" -gt 0 ]; then
          depth=$((depth - 1))
          SHELL_DIR="${DIR_STACK[$depth]}"
          unset "DIR_STACK[$depth]"
        fi
        last="$record"
        continue ;;
    esac
    value="${record:1}"
    case "$value" in *"$ENCODED_NEWLINE"*) value="$(printf '%s' "$value" | tr '\036' '\n')" ;; esac
    case "$record" in
      W*)
        [ "$last" = '[' ] && [ "$value" = eval ] && [ ${#SEG_WORDS[@]} -eq 0 ] && SEG_FROM_SUBST=1
        SEG_WORDS+=("$value") ;;
      R*) SEG_TARGETS+=("$value") ;; # a write; what is only read comes as I
      S* | H*) SEG_STDIN+=("$value") ;;
      X*)
        SEG_STDIN+=("$value")
        case "$value" in *'$('* | *'`'*) scan_text "$value" body ;; esac ;;
      E*)
        if [ ${#SEG_WORDS[@]} -gt 0 ] || [ ${#SEG_TARGETS[@]} -gt 0 ]; then check_segment; fi
        SEG_WORDS=()
        SEG_TARGETS=()
        SEG_STDIN=()
        SEG_FROM_SUBST="" ;;
    esac
    last=""
  done <<<"$records"
}

scan_text() { # <text> [command | body]
  local text="$1" kind="${2:-command}" records saved_subst="$SEG_FROM_SUBST"
  local saved_words saved_targets saved_stdin start_dir="$SHELL_DIR"
  NESTING=$((NESTING + 1))
  [ "$NESTING" -le 8 ] || deny "$MODE_NAMES" "this command nests shells too deeply to check." "Run the inner command directly. "
  saved_words=(${SEG_WORDS[@]+"${SEG_WORDS[@]}"})
  saved_targets=(${SEG_TARGETS[@]+"${SEG_TARGETS[@]}"})
  saved_stdin=(${SEG_STDIN[@]+"${SEG_STDIN[@]}"})
  records="$(printf '%s\n' "$text" | awk -v mode="$kind" -f "$HOOK_DIR/shell-words.awk")" ||
    deny "$MODE_NAMES" "this command cannot be read by the guard (too deeply nested, too many heredocs)." "Split it into simpler commands. "
  eval_records "$records"
  # bash 3.2 ends a $(...) elsewhere when a comment, a case or a heredoc is inside: judge that reading as well
  case "$text" in
    *'$('*)
      case "$kind:$text" in
        command:*'#'* | command:*'<<'* | command:*case*)
          SHELL_DIR="$start_dir"
          records="$(printf '%s\n' "$text" | awk -v mode=old-bash -f "$HOOK_DIR/shell-words.awk")" || true
          eval_records "$records" ;;
      esac ;;
  esac
  SEG_WORDS=(${saved_words[@]+"${saved_words[@]}"})
  SEG_TARGETS=(${saved_targets[@]+"${saved_targets[@]}"})
  SEG_STDIN=(${saved_stdin[@]+"${saved_stdin[@]}"})
  SEG_FROM_SUBST="$saved_subst"
  NESTING=$((NESTING - 1))
}

case "$TOOL" in
  Edit | Write | MultiEdit | NotebookEdit) check_edit ;;
  Bash | Monitor | PowerShell | mcp__terminal__run_in_terminal) # the tools that take a command line
    COMMAND="$(hook_field '.tool_input.command')"
    [ -n "$COMMAND" ] || exit 0
    [ "${#COMMAND}" -le 100000 ] || deny "$MODE_NAMES" "this command is too long to check." "Write long text with the Write tool. "
    CWD="$(hook_field '.tool_input.cwd // .cwd')"
    if [ -n "$CWD" ] && resolve "$CWD" "$ROOT"; then SHELL_DIR="$ABS"; fi
    scan_text "$COMMAND" ;;
  Skill) check_skill ;;
  EnterWorktree)
    if has_mode read-only; then deny read-only "a new worktree: nothing is created." "Read in the checkout you are in. "; fi ;;
  mcp__*) check_mcp ;;
esac
exit 0
