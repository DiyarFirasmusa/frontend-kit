#!/usr/bin/env bash
# SubagentStart: a subagent does not see the SessionStart banner, so it never learns the project's hard rules
# (protected branches, no PR, no live site, protected paths). This hands it the short version, plus the mode.
# Context only; quiet in a project that was never set up (no .claude/frontend-kit.json). Switch:
# {"guards": {"subagentContext": false}} in .claude/frontend-kit.json.
set -u
. "$(dirname "$0")/lib.sh"
hook_read_input
[ -f "$KIT_CONFIG" ] || exit 0
kit_switch subagentContext || exit 0

# The modes with rules of their own (refactor, upgrade …) are mode-subagent.sh's to tell; new only guides.
MODE_LINE=""
[ "$KIT_MODE" = new ] && MODE_LINE=" New project: build to the standards from the first file."
LANGUAGES=""
case "$(kit_get '.stack.i18n' '')" in '' | none | *'{{'*) ;; *) LANGUAGES=", user-facing text in every language the project has" ;; esac
LIVE="${KIT_LIVE_HOSTS:-any production host}"
hook_context SubagentStart "$KIT_PROJECT_NAME rules for this agent: work on a task branch, never commit, push or merge on $KIT_PROTECTED_BRANCHES and never commit or push without the user's yes; never open or merge a pull request; never test against the live site ($LIVE), use localhost:$KIT_DEV_PORT or $KIT_UAT_HOST; never read .env files or edit deploy config, lockfiles or generated files (protectedPaths and generatedPaths in .claude/frontend-kit.json); no test skipped without the user's yes and no silenced checks$LANGUAGES. Follow CLAUDE.md and this project's type, test and language rules in .claude/rules/.$MODE_LINE"
exit 0
