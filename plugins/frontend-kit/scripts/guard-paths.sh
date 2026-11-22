#!/bin/bash -p
# PreToolUse(file tools, searches, browser file fields): keeps Claude's tools off files they must not touch.
#
#   read + write: .env and .env.* and the other credential files (lib.sh: kit_secret_name, kit_key_file);
#                 the templates (.env.example, .env.sample …) stay readable and editable
#   write only:   .git/ (at any depth), lockfiles (the package manager owns them), the package.json build scripts,
#                 any .js/.jsx/.mjs/.cjs file under the source folders of a TypeScript project (allowJs lifts it),
#                 and from .claude/frontend-kit.json: protectedPaths (by default .github/, deploy/ and, unless the
#                 framework keeps app code there, server/) and generatedPaths (generated files, e.g. the route tree);
#                 the gate state and the git hooks; credentials written into a file
#   ask the user: a change that loosens the kit's own protections (frontend-kit.json, Claude Code's settings,
#                 the installed plugin)
#
# The rules hold in every worktree of the project. Names are compared without regard to case (on macOS .ENV is
# .env), and a link is checked both as the path given and as the file it points at.
set -u
# shellcheck disable=SC2034 # read by lib.sh
HOOK_KIND=guard # fail closed: see lib.sh
. "$(dirname "$0")/lib.sh"

hook_read_input
CALL="$(printf '%s' "$HOOK_INPUT" | jq -r '
  if (.tool_input | type) != "object" then "!input"
  elif any(.tool_input | .file_path?, .notebook_path?, .filePath?, .filename? | strings; test("[\\x00-\\x1f]")) then "!control"
  else (.tool_name // "" | tostring) end' 2>/dev/null)" || CALL='!input'
case "$CALL" in
  '!input') hook_deny "Blocked: this call has no input the guard can read, so it is refused." ;;
  '!control') hook_deny "Blocked: a file path with a line break or another control character can't be checked. Use a plain path." ;;
esac
TOOL="$CALL"

lower() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]'; }

# rel_under <root> <path> → the lower-case path below root, empty when it isn't below it.
rel_under() {
  local root path
  root="$(lower "${1%/}")"
  path="$(lower "$2")"
  case "$path" in "$root"/*) printf '%s' "${path:${#root}+1}" ;; esac
}

# A name is compared without invisible characters (zero-width space, joiner, BOM) and without trailing dots or
# blanks: all of them name the same file to the operating system.
clean_name() {
  local name
  name="$(printf '%s' "$1" | LC_ALL=C sed $'s/\xe2\x80[\x8b-\x8d]//g; s/\xe2\x81\xa0//g; s/\xef\xbb\xbf//g; s/[. ]*$//')"
  lower "$name"
}

# --- Secrets: every path the call names ----------------------------------------------------------------

deny_secret() {
  hook_deny "Blocked: $1 holds secrets and stays out of Claude's context. Use .env.example for names and defaults, and ask the user for any value you need."
}

check_secret() {
  local given real path base
  given="$(hook_normalise_path "$1")"
  real="$(hook_physical_path "$given")"
  for path in "$given" "$real"; do
    base="$(clean_name "${path##*/}")"
    if kit_secret_name "$base" || kit_key_file "$base"; then deny_secret "${path##*/}"; fi
    [ "$real" != "$given" ] || break
  done
}

while IFS= read -r named; do
  [ -n "$named" ] && check_secret "$named"
done <<<"$(printf '%s' "$HOOK_INPUT" | jq -r '.tool_input | [.file_path?, .notebook_path?, .path?, .filePath?, (.filePaths? | arrays | .[]), (.paths? | arrays | .[])] | .[] | strings' 2>/dev/null)"

if [ "$TOOL" = Grep ]; then
  GLOB="$(hook_field '.tool_input.glob')"
  base="$(lower "${GLOB##*/}")"
  case "$GLOB" in
    '' | '!'*) ;;
    *)
      case "$base" in
        .env* | '*.env' | '*.env*') kit_env_template "$base" || deny_secret "$GLOB" ;;
        *) if kit_secret_name "$base" || kit_key_file "$base"; then deny_secret "$GLOB"; fi ;;
      esac
      ;;
  esac
fi

case "$TOOL" in
  Read | Grep | Glob | LSP) exit 0 ;;
  mcp__*upload* | mcp__*browser_drop | mcp__*set_storage_state) exit 0 ;;
  mcp__*) FILE="$(hook_field '.tool_input.filePath')"; [ -n "$FILE" ] || FILE="$(hook_field '.tool_input.filename')" ;;
  *) FILE="$(hook_field '.tool_input.file_path')"; [ -n "$FILE" ] || FILE="$(hook_field '.tool_input.notebook_path')" ;;
esac
[ -n "$FILE" ] || exit 0
# src/../.github/x must be checked as .github/x.
FILE="$(hook_normalise_path "$FILE")"
REAL="$(hook_physical_path "$FILE")"
ROOT_REAL="$(hook_physical_path "$HOOK_ROOT")"

# --- Where the file is: the project, and the same path in another worktree of it -------------------------

RELS=()
add_rel() {
  local rel="$1" known
  [ -n "$rel" ] || return 0
  case "$rel" in .claude/worktrees/*/*) rel="${rel#.claude/worktrees/}"; rel="${rel#*/}" ;; esac
  for known in ${RELS[@]+"${RELS[@]}"}; do [ "$known" = "$rel" ] && return 0; done
  RELS+=("$rel")
}

common_git_dir() {
  local common
  common="$(git -C "$1" rev-parse --git-common-dir 2>/dev/null </dev/null)" || return 1
  [ -n "$common" ] || return 1
  (cd "$1" && cd "$common" && pwd -P) 2>/dev/null
}

# A linked worktree lies beside the project (or inside it): its .github/ is the project's .github/.
worktree_rel() {
  local top="$REAL" ours theirs prefix
  while [ -n "$top" ] && [ ! -e "$top/.git" ]; do top="${top%/*}"; done
  [ -n "$top" ] && [ "$top" != "$ROOT_REAL" ] || return 0
  theirs="$(common_git_dir "$top")" || return 0
  ours="$(common_git_dir "$HOOK_ROOT")" || return 0
  [ "$ours" = "$theirs" ] || return 0
  prefix="$(git -C "$HOOK_ROOT" rev-parse --show-prefix 2>/dev/null </dev/null)"
  rel_under "$top/${prefix%/}" "$REAL"
}

add_rel "$(rel_under "$HOOK_ROOT" "$FILE")"
add_rel "$(rel_under "$ROOT_REAL" "$REAL")"
case "$TOOL" in mcp__*) ;; *) add_rel "$(worktree_rel)" ;; esac

# --- The kit's own protections: loosening them is the user's decision -----------------------------------

# The text of the file after this call. An old_string that isn't there leaves it as it is (the tool then fails).
next_text() {
  local source="$FILE"
  [ -f "$source" ] || source=/dev/null
  printf '%s' "$HOOK_INPUT" | jq -j --rawfile body "$source" '
    if .tool_name == "Write" then (.tool_input.content // "")
    else
      reduce ((.tool_input.edits // [.tool_input])[]) as $edit ($body;
        ($edit.old_string // "") as $old | ($edit.new_string // "") as $new |
        if $old == "" then (if . == "" then $new else . end)
        else split($old) as $parts |
          if ($parts | length) < 2 then .
          elif $edit.replace_all == true then ($parts | join($new))
          else $parts[0] + $new + ($parts[1:] | join($old)) end
        end)
    end' 2>/dev/null
}

JQ_SHARED='
  def parse: if test("^[ \t\r\n]*$") then {} else (try fromjson catch "bad") | if type == "object" then . else "bad" end end;
  def real: select(contains("{{") | not);
  def items: if type == "array" then [.[] | strings | real] elif type == "string" then [real] else [] end;
  def get($path): try getpath($path) catch null;
'

# What the next frontend-kit.json would loosen (empty: nothing). A template placeholder is no protection yet.
kit_loosened() {
  local source="$FILE" fresh=false
  if [ ! -f "$source" ]; then source=/dev/null; fresh=true; fi
  jq -rRs --rawfile old "$source" --argjson fresh "$fresh" --arg defaults "$(kit_default_protected)" "$JQ_SHARED"'
    def or_default($fallback): if length == 0 then $fallback else . end;
    def paths: items | or_default($defaults | split("\n") | map(select(. != "")))
      | map(sub("/\\*\\*$"; "") | select(startswith(".env") | not)
        | select(IN("package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb") | not));
    def off: tostring | IN("false", "off", "0", "no");
    def commands: (get(["commands"]) | objects | to_entries[] | {key: .key, value: .value}),
      (get(["apps"]) | arrays | .[] | objects | (.name | tostring) as $app | get(["commands"]) | objects | to_entries[] | {key: ($app + "." + .key), value: .value});
    def gate_commands: [commands | select(.key | test("(^|\\.)(typecheck|relatedTests|allTests|i18nValidate|formatFile|lintFile)$")) | select(.value | type == "string")] | from_entries;
    ($old | parse) as $o | parse as $n |
    if $n == "bad" then "the file would no longer be a JSON object"
    elif $o == "bad" then "the file can not be read, so the change can not be compared"
    else [
      (($n.guards | objects | to_entries[] | select(.value | off) | .key) as $key
        | select(($o | get(["guards", $key]) | off) | not) | "guards." + $key + " switched off"),
      (select((($o.liveHosts | items) - ($n.liveHosts | items)) | length > 0) | "a live host removed"),
      (select((($o.protectedBranches | items | or_default(["main", "master"])) - ($n.protectedBranches | items | or_default(["main", "master"]))) | length > 0) | "a protected branch removed"),
      (select((($o.protectedPaths | paths) - ($n.protectedPaths | paths)) | length > 0) | "a protected path removed"),
      (select((($o.generatedPaths | items) - ($n.generatedPaths | items)) | length > 0) | "a generated path removed"),
      (select(($n | get(["stopGate", "review"])) == false and ($o | get(["stopGate", "review"])) != false) | "the review switched off"),
      (select(($o | get(["stopGate", "tests"])) == "all" and ($n | get(["stopGate", "tests"])) != "all") | "the full test gate switched off"),
      (if $fresh then empty else
        (select($n.allowJs == true and $o.allowJs != true) | "allowJs switched on"),
        (select((($o.srcDirs | items) - ($n.srcDirs | items)) | length > 0) | "a watched source folder removed"),
        (($o | gate_commands) as $was | ($n | gate_commands) as $will
          | (($was | keys) + ($will | keys) | unique | .[]) as $key
          | select(($was[$key] // "" | contains("{{")) | not)
          | select(($was[$key] // "") != ($will[$key] // ""))
          | "the gate command " + $key + " changed")
      end)
    ] | unique | join(", ") end'
}

# What the next settings file would switch off (empty: nothing).
settings_loosened() {
  local source="$FILE"
  [ -f "$source" ] || source=/dev/null
  jq -rRs --rawfile old "$source" "$JQ_SHARED"'
    ($old | parse) as $o | parse as $n |
    if $n == "bad" then "the file would no longer be a JSON object"
    elif $o == "bad" then "the file can not be read, so the change can not be compared"
    else [
      (select($n.disableAllHooks == true and $o.disableAllHooks != true) | "disableAllHooks switches every guard off"),
      (($o | get(["enabledPlugins"]) | if type == "object" then . else {} end) as $was
        | ($n | get(["enabledPlugins"]) | if type == "object" then . else {} end) as $will
        | (($was | keys) + ($will | keys) | unique | .[] | select(startswith("frontend-kit@"))) as $key
        | select($will[$key] == false and $was[$key] != false or ($was[$key] == true and $will[$key] != true))
        | "the plugin switched off"),
      (($n | get(["env"]) | objects | to_entries[]) as $entry
        | select($entry.key | test("^(BASH_ENV|ENV|PATH|HOME|TMPDIR|CLAUDE_PROJECT_DIR|CLAUDE_CONFIG_DIR|CLAUDE_CODE_SHELL_PREFIX|HOOK_.*)$"))
        | select(($o | get(["env", $entry.key])) != $entry.value)
        | "env." + $entry.key + " changes how the hooks run"),
      (select(($o.hooks // {}) != ($n.hooks // {})) | "the hooks changed"),
      (select((($o | get(["permissions", "deny"]) | items) - ($n | get(["permissions", "deny"]) | items)) | length > 0) | "a deny rule removed"),
      (select((($o | get(["sandbox", "network", "deniedDomains"]) | items) - ($n | get(["sandbox", "network", "deniedDomains"]) | items)) | length > 0) | "a denied domain removed"),
      (select(($o | get(["sandbox", "enabled"])) == true and ($n | get(["sandbox", "enabled"])) != true) | "the sandbox switched off"),
      (select(($n | get(["permissions", "defaultMode"])) == "bypassPermissions" and ($o | get(["permissions", "defaultMode"])) != "bypassPermissions") | "permission checks switched off"),
      (($o | get(["extraKnownMarketplaces", "frontend-kit", "source"])) as $was
        | select($was != null and $was != ($n | get(["extraKnownMarketplaces", "frontend-kit", "source"])))
        | "the source of the plugin changed")
    ] | unique | join(", ") end'
}

# ask_if_loosened <kit|settings> <name for the message>
ask_if_loosened() {
  local next changes
  case "$TOOL" in
    Write | Edit | MultiEdit) ;;
    *) hook_ask_later "this call writes $2, which holds the protections."; return 0 ;;
  esac
  if next="$(next_text)"; then
    if [ "$1" = kit ]; then changes="$(printf '%s' "$next" | kit_loosened 2>/dev/null)"; else changes="$(printf '%s' "$next" | settings_loosened 2>/dev/null)"; fi || changes="the change can not be compared"
  else
    changes="the change can not be read"
  fi
  [ -z "$changes" ] || hook_ask_later "this edit of $2 loosens the protections ($changes)."
}

for rel in ${RELS[@]+"${RELS[@]}"}; do
  case "$rel" in
    .claude/frontend-kit.json) ask_if_loosened kit "$rel"; break ;;
    .claude/settings.json | .claude/settings.local.json) ask_if_loosened settings "$rel"; break ;;
  esac
done
if [ -n "${HOME:-}" ]; then
  HOME_REL="$(rel_under "$(hook_physical_path "$HOME")" "$REAL")"
  case "$HOME_REL" in
    .claude/settings.json | .claude/settings.local.json) [ -n "$HOOK_ASK" ] || ask_if_loosened settings "~/$HOME_REL" ;;
    .claude/plugins/cache/* | .claude/plugins/marketplaces/* | .claude/plugins/installed_plugins.json | .claude/plugins/known_marketplaces.json)
      hook_ask_later "this writes into the installed plugins (~/$HOME_REL), where the guards themselves live." ;;
  esac
fi

# Files outside the project and its worktrees (the scratchpad, other repositories) are not this repo's business.
[ ${#RELS[@]} -gt 0 ] || hook_finish

# --- Files that are never Claude's to write -------------------------------------------------------------

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
PROTECTED="$(printf '%s' "$RAW_PROTECTED_PATHS" | tr '\037' '\n' | tr '[:upper:]' '[:lower:]')"
[ -n "$PROTECTED" ] || PROTECTED="$(kit_default_protected)"
GENERATED="$(printf '%s' "$RAW_GENERATED" | tr '\037' '\n' | tr '[:upper:]' '[:lower:]')"

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
    package-lock.json | npm-shrinkwrap.json | pnpm-lock.yaml | yarn.lock | bun.lock | bun.lockb | deno.lock | .pnp.cjs | .pnp.loader.mjs)
      hook_deny "Blocked: $base is written by the package manager. Change package.json and ask the user to run the install." ;;
  esac
  # The gate state and the git-hook folders are not Claude's to write.
  case "$rel" in
    .claude/state/* | .husky/* | lefthook.yml | lefthook.yaml | .lefthook/*)
      kit_switch integrity &&
        hook_deny "Blocked: $rel is guard state or a git hook. Tell the user the change instead of making it." ;;
  esac
  case "$TOOL" in mcp__*) return 0 ;; esac
  # A TypeScript project keeps its source folders TypeScript only; "allowJs": true in .claude/frontend-kit.json
  # (or no tsconfig.json at all) lifts this for JavaScript projects.
  case "$base" in
    *.js | *.jsx | *.mjs | *.cjs)
      shopt -s nocasematch
      kit_in_src "$rel" && in_src=1
      shopt -u nocasematch
      if [ -n "$in_src" ] && [ -f "$HOOK_ROOT/tsconfig.json" ] && [ "$RAW_ALLOW_JS" != true ]; then
        hook_deny "Blocked: every source file is .ts or .tsx here. Name it ${base%.*}.ts (or .tsx for JSX)."
      fi
      ;;
  esac
}
for rel in "${RELS[@]}"; do check_write "$rel"; done
case "$TOOL" in mcp__*) hook_finish ;; esac

# Real-looking credentials are never written into source files. Documentation, tests, mocks and templates may carry fakes.
if kit_switch secretsInCode; then
  case "/${RELS[0]}" in
    *.md | *.mdx | *.example | *.sample | *.template | *.test.* | *.spec.* | */mocks/* | */__mocks__/* | */fixtures/* | */__fixtures__/*) ;;
    *)
      HIT="$(printf '%s' "$HOOK_INPUT" |
        jq -r '.tool_input | [.content?, .new_string?, .new_source?, (.edits? | arrays | .[] | .new_string?)] | .[] | strings' 2>/dev/null |
        kit_token_hit | head -n 1)"
      [ -z "$HIT" ] ||
        hook_deny "Blocked: this content holds what looks like a real credential (${HIT:0:8}…). Secrets never go into source files: read them from the environment (a server-side variable, never one with a public prefix such as VITE_ or NEXT_PUBLIC_), and ask the user for the value."
      ;;
  esac
fi

# The package.json "build" script (with the pre and post scripts that run around it) is what CI and the deploy
# run; an existing one is never changed from here. A project that has none yet may get one (a new app needs a
# build script to exist at all).
check_build_script() {
  local current build next wanted edit old_lines new_lines
  build="$(jq -r '.scripts.build // ""' "$FILE" 2>/dev/null)"
  [ -n "$build" ] || return 0
  current="$(jq -c '.scripts | [.build, .prebuild, .postbuild]' "$FILE" 2>/dev/null)"
  wanted=""
  if next="$(next_text)"; then
    wanted="$(printf '%s' "$next" | jq -c '.scripts | [.build, .prebuild, .postbuild]' 2>/dev/null)" || wanted=""
  fi
  if [ "$TOOL" = Write ]; then
    [ "$wanted" = "$current" ] ||
      hook_deny "Blocked: the package.json \"build\" script (and prebuild, postbuild) is deploy config. Keep it exactly as it is: $build"
    return 0
  fi
  if [ -n "$wanted" ] && [ "$wanted" != "$current" ]; then
    hook_deny "Blocked: the package.json \"build\" script (and prebuild, postbuild) is deploy config. Edit around it and leave it unchanged."
  fi
  # An edit that can't be applied here (or leaves no valid JSON) is judged by the lines that name the script.
  build_lines() { grep -E '"build"[[:space:]]*:' | sed -E 's/[[:space:]]+//g; s/,$//'; }
  while IFS= read -r edit; do
    [ -n "$edit" ] || continue
    old_lines="$(printf '%s' "$edit" | jq -r '.old' | build_lines)"
    new_lines="$(printf '%s' "$edit" | jq -r '.new' | build_lines)"
    [ "$old_lines" = "$new_lines" ] ||
      hook_deny "Blocked: the package.json \"build\" script is deploy config. Edit around it and leave that line unchanged."
  done <<<"$(printf '%s' "$HOOK_INPUT" | jq -c '(.tool_input.edits // [.tool_input]) | .[] | {old: (.old_string // ""), new: (.new_string // "")}')"
}
case "$TOOL" in
  Write | Edit | MultiEdit)
    for rel in "${RELS[@]}"; do
      if [ "$rel" = package.json ]; then check_build_script; break; fi
    done
    ;;
esac

hook_finish
