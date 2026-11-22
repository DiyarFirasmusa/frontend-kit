#!/usr/bin/env bash
# SubagentStart: a subagent does not see the SessionStart banner, so it never learns the project's hard rules
# (protected branches, no PR, no live site, protected paths). This hands it the short version, plus the mode.
# Context only; quiet in a project that was never set up (no .claude/frontend-kit.json). Switch:
# {"guards": {"subagentContext": false}} in .claude/frontend-kit.json.
set -u
. "$(dirname "$0")/lib.sh"
hook_read_input
[ -f "$KIT_CONFIG" ] || exit 0
kit_switch subagentContext on || exit 0

MODE_LINE=""
case "$KIT_MODE" in
  refactor) MODE_LINE=" Refactor mode is on: change structure only, behaviour frozen, no drive-by fixes." ;;
  new) MODE_LINE=" New project: build to the standards from the first file." ;;
esac
hook_context SubagentStart "$KIT_PROJECT_NAME rules for this agent (hooks enforce them): work on a task branch, never commit, push or merge on $KIT_PROTECTED_BRANCHES and never commit or push without the user's yes; never open or merge a pull request; never test against the live site ($KIT_LIVE_HOSTS), use localhost:$KIT_DEV_PORT or $KIT_UAT_HOST; never read .env files or edit deploy config, lockfiles or generated files (protectedPaths and generatedPaths in .claude/frontend-kit.json); no any, casts or skipped tests; Arabic and English strings. Follow CLAUDE.md and .claude/rules/.$MODE_LINE"
exit 0
