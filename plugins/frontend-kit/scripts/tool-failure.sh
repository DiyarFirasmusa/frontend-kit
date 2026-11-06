#!/usr/bin/env bash
# PostToolUseFailure: keeps a short log of failed tool calls (tool, command or path, error) in
# .claude/state/tool-failures.log, so a flaky command or a guard that keeps refusing shows up as a pattern.
set -u
. "$(dirname "$0")/lib.sh"
hook_read_input

TOOL="$(hook_field '.tool_name')"
TARGET="$(hook_field '.tool_input.command')"
[ -n "$TARGET" ] || TARGET="$(hook_field '.tool_input.file_path')"
ERROR="$(hook_field '.error' | tr '\n' ' ' | cut -c1-300)"
[ -n "$TOOL" ] || exit 0

LOG="$HOOK_STATE_DIR/tool-failures.log"
mkdir -p "$HOOK_STATE_DIR" 2>/dev/null || exit 0
printf '%s\t%s\t%s\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$TOOL" "$(printf '%s' "$TARGET" | tr '\n' ' ' | cut -c1-200)" "$ERROR" >>"$LOG" 2>/dev/null
# Keep the last 500 lines only.
if [ "$(wc -l <"$LOG" 2>/dev/null || echo 0)" -gt 500 ]; then
  tail -n 500 "$LOG" >"$LOG.tmp" 2>/dev/null && mv "$LOG.tmp" "$LOG"
fi
exit 0
