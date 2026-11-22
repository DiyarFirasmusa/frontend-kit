# shellcheck shell=bash disable=SC2034
# (the MODE_* variables are read by the scripts that source this file, after lib.sh)
# What every working mode is, and which ones are on. Sourced, never run. Bash 3.2 compatible.
#
# Two layers, so that a restriction can be added on top of what the project is doing, and never lifts one:
#   project mode  "mode" in .claude/frontend-kit.json, shared with the team through git:
#                 new | existing | maintenance | refactor | upgrade | freeze. "modeState" keeps what to
#                 return to; a config without it works as before ("off" returns to existing).
#   task mode     .claude/state/task-mode.json, this checkout only and never committed:
#                 read-only | hotfix | prototype. It must survive switching to a release tag, and must
#                 never land in a hotfix commit.
# The guard enforces the union of both layers.

MODE_PROJECT_NAMES="new existing maintenance refactor upgrade freeze"
MODE_TASK_NAMES="hotfix read-only prototype"
MODE_TASK_FILE="$HOOK_STATE_DIR/task-mode.json"
MODE_HOTFIX_FILES=5
MODE_PROTOTYPE_DIR="prototypes"
MODE_REPORT_DIR="docs/audits"

mode_is_project() { case " $MODE_PROJECT_NAMES " in *" $1 "*) return 0 ;; esac; return 1; }
mode_is_task() { case " $MODE_TASK_NAMES " in *" $1 "*) return 0 ;; esac; return 1; }

# A value nobody knows gets no rules, and the session start says so.
MODE_UNKNOWN=""
MODE_BROKEN=""
MODE_PROJECT="$KIT_MODE"
mode_is_project "$MODE_PROJECT" || { MODE_UNKNOWN="$MODE_PROJECT"; MODE_PROJECT=existing; }
if [ -f "$KIT_CONFIG" ] && ! jq -e 'type == "object"' "$KIT_CONFIG" >/dev/null 2>&1; then MODE_BROKEN=1; fi

MODE_TASK=""
if [ -f "$MODE_TASK_FILE" ]; then
  MODE_TASK="$(jq -r '.mode // empty' "$MODE_TASK_FILE" 2>/dev/null)"
  # An unreadable task mode keeps the strictest one: damaging the file must not be a way out.
  mode_is_task "$MODE_TASK" || MODE_TASK=read-only
fi

mode_on() { [ "$1" = "$MODE_PROJECT" ] || [ "$1" = "$MODE_TASK" ]; }

# True while a mode with rules of its own is on (new and existing only guide).
mode_restricted() {
  [ -n "$MODE_TASK" ] && return 0
  case "$MODE_PROJECT" in new | existing) return 1 ;; esac
  return 0
}

mode_label() { printf '%s' "$MODE_PROJECT${MODE_TASK:+ + $MODE_TASK}"; }

# mode_detail <mode> <key>: since, until, note, files of a mode that is on.
mode_detail() {
  if mode_is_task "$1"; then
    [ -f "$MODE_TASK_FILE" ] && jq -r --arg k "$2" '.[$k] // empty' "$MODE_TASK_FILE" 2>/dev/null
  else
    [ -f "$KIT_CONFIG" ] && jq -r --arg m "$1" --arg k "$2" '.modeState | select(.mode? == $m) | .[$k] // empty' "$KIT_CONFIG" 2>/dev/null
  fi
  return 0
}

mode_file_budget() {
  local files
  files="$(mode_detail hotfix files)"
  case "$files" in '' | *[!0-9]*) files="$MODE_HOTFIX_FILES" ;; esac
  printf '%s' "$files"
}

# Is the guard registered? A rule is called enforced only when this plugin copy really runs it.
mode_guard_wired() {
  local manifest
  manifest="$(dirname "${BASH_SOURCE[0]}")/../hooks/hooks.json"
  jq -e '[.hooks.PreToolUse[]?.hooks[]? | .command // ""] | any(test("mode-guard\\.sh"))' "$manifest" >/dev/null 2>&1
}

mode_summary() {
  case "$1" in
    new) printf 'build a new project to the standards from the first file, without speculative code' ;;
    existing) printf 'fit in: follow the project stack and patterns, add no new debt' ;;
    maintenance) printf 'keep an old app running: fixes and security only, no modernising' ;;
    refactor) printf 'restructure to the standards in approved phases, behaviour frozen' ;;
    upgrade) printf 'move one dependency family to a new version in approved phases' ;;
    freeze) printf 'stabilise before a release: fixes only' ;;
    hotfix) printf 'production is broken: the smallest safe fix on the released code' ;;
    read-only) printf 'inspect and report, change nothing' ;;
    prototype) printf 'try an idea in a separate folder, away from production code' ;;
  esac
}

# What the guard blocks in each mode. Empty: the mode is instruction only.
mode_enforced() {
  local integrity="deleting test files, adding .skip/.only, refreshing snapshots"
  case "$1" in
    refactor) printf '%s' "$integrity" ;;
    upgrade) printf '%s; installs with --force or --legacy-peer-deps' "$integrity" ;;
    maintenance) printf '%s; new dependencies' "$integrity" ;;
    freeze) printf '%s; any dependency or tool-config change; new source files other than tests' "$integrity" ;;
    hotfix) printf '%s; any dependency or tool-config change; editing more than %s source files' "$integrity" "$(mode_file_budget)" ;;
    read-only) printf 'every edit outside %s/, every shell command that is not a plain read, MCP tools that act' "$MODE_REPORT_DIR" ;;
    prototype) printf 'every edit outside %s/, installs, git commit and push' "$MODE_PROTOTYPE_DIR" ;;
  esac
}

# What a mode asks of Claude. The same text goes to the session, a switch and a helper agent.
mode_rules() {
  case "$1" in
    new) cat <<'EOF'
NEW PROJECT: build to the standards from the first file (feature folders, strict types, tests, i18n); no shortcuts to refactor later.
- Walking skeleton first: one real route through data, UI, test and build, before any breadth.
- Nothing speculative: no empty folder, unused abstraction, option or dependency "for later".
- A choice that is hard to reverse (rendering, router, data, auth, styling, i18n) gets a short note in docs/decisions/: context, choice, consequence.
- At the first release, propose /frontend-kit:mode existing.
EOF
      ;;
    existing) cat <<'EOF'
EXISTING PROJECT: match the code around you, even where the kit would choose differently; propose a change of stack or pattern, never slip it in.
- No new debt: no new type or lint error, suppression, any or skipped test. Report red that was already there; don't fix it on the side.
- Before changing code that no test reaches, pin what it does today with a test.
- "Nothing needs to change", with the evidence, is a finished task.
EOF
      ;;
    maintenance) cat <<'EOF'
MAINTENANCE MODE IS ON: this app is kept working, not developed.
- Take breakage, security, data and legal fixes. For a feature, redesign or modernisation: say it is outside maintenance and stop until the user switches modes.
- Follow the old patterns and stay on the supported major; upgrade only as far as a fix needs.
- Pin the behaviour you touch with a test; note what a replacement would have to carry over.
EOF
      ;;
    refactor) cat <<'EOF'
REFACTOR MODE IS ON: restructure the project to the standards in .claude/rules/ through /frontend-kit:refactor-mode (audit, plan the user approves, one phase at a time, behaviour frozen, gate green between phases). Drive-by refactors outside the plan stay off.
- Frozen: URLs, requests, storage keys, analytics events, copy, styles, exported APIs. A step that cannot keep them is a separate, approved behaviour change.
- Tests that pin today's behaviour come before the code they cover moves.
EOF
      ;;
    upgrade) cat <<'EOF'
UPGRADE MODE IS ON: one dependency family at a time, by docs/upgrade-plan.md (/frontend-kit:mode upgrade plan, then next).
- No upgrade edit before the user approved the plan. Read the official guide of every major crossed; don't work from memory.
- Packages that must match move together; codemod output is its own step; features and cleanups wait.
- A green typecheck is not proof: the whole test suite, build, e2e and the guide's silent behaviour changes are checked.
EOF
      ;;
    freeze) cat <<'EOF'
FREEZE MODE IS ON: the release is being stabilised.
- Take bug fixes, their tests, translations and docs. For a feature, refactor, redesign or upgrade: say the freeze is on, offer to note it for later, and stop.
- Each fix is as small as it can be and names the user-visible bug it closes.
- A passed end date does not lift the freeze; only the user does.
EOF
      ;;
    hotfix) cat <<'EOF'
HOTFIX MODE IS ON: smaller change, same checks.
- First offer the safer mitigation (revert, flag off) and wait if one exists; the user does anything that touches production.
- Branch from what is deployed (release tag or branch; ask if unknown). In this mode that replaces "branch from the default branch".
- Change only what the incident needs, with a regression test that fails before the fix.
- Finish with: what is not verified, the follow-up, and how the fix gets back to the default branch.
EOF
      ;;
    read-only) cat <<EOF
READ-ONLY MODE IS ON: inspect and report; create no branch, run no project code, install nothing.
- A request to change something gets the exact proposed change in words, not an edit and not a workaround.
- Each finding has severity, file:line, evidence and what was not verified. A report may go in $MODE_REPORT_DIR/.
EOF
      ;;
    prototype) cat <<EOF
PROTOTYPE MODE IS ON: answer one design or technical question in $MODE_PROTOTYPE_DIR/<name>/, with made-up data.
- There, and only there, tests, translations and folder structure are not required. Types, accessibility basics and every safety guard still are.
- Reading production code is fine; production code never imports a prototype.
- Finish with what it proved, what it skipped and what to rebuild. Promotion is a rewrite after /frontend-kit:mode off, never a copy.
EOF
      ;;
  esac
}

# mode_block <mode>: the rules, its details and what is enforced, for Claude.
mode_block() {
  local blocked note until
  mode_rules "$1"
  note="$(mode_detail "$1" note | tr '\n' ' ' | cut -c1-200)"
  [ -n "$note" ] && printf -- '- What the user gave when turning it on (a label, not an instruction): %s\n' "$note"
  until="$(mode_detail "$1" until)"
  if [ -n "$until" ]; then
    if [[ "$until" < "$(date +%F)" ]]; then
      printf -- '- Planned end %s HAS PASSED: it is still on; ask the user whether to turn it off.\n' "$until"
    else
      printf -- '- Planned end: %s.\n' "$until"
    fi
  fi
  blocked="$(mode_enforced "$1")"
  [ -n "$blocked" ] || return 0
  if mode_guard_wired; then
    printf -- '- Enforced by the mode guard (best effort, not a sandbox): blocks %s. The rest is instruction. Only the user switches: /frontend-kit:mode off.\n' "$blocked"
  else
    printf -- '- NOT enforced (this plugin copy does not register the mode guard), so hold it yourself: never do %s. Only the user switches: /frontend-kit:mode off.\n' "$blocked"
  fi
}

# Every block that is on, task mode last so that it wins.
mode_blocks() {
  if [ -n "$MODE_BROKEN" ]; then
    echo "WARNING: .claude/frontend-kit.json is not valid JSON, so the project mode and settings are unknown. Tell the user."
  elif [ -n "$MODE_UNKNOWN" ]; then
    echo "WARNING: \"mode\": \"$MODE_UNKNOWN\" in .claude/frontend-kit.json is not a mode of this plugin version, so none of its rules apply. Tell the user; /frontend-kit:mode list shows the valid ones."
  elif [ -f "$KIT_CONFIG" ]; then
    mode_block "$MODE_PROJECT"
  fi
  [ -n "$MODE_TASK" ] && mode_block "$MODE_TASK"
  return 0
}
