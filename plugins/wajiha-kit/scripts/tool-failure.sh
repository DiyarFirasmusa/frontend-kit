#!/usr/bin/env bash
# PostToolUseFailure: keeps a short log of failed tool calls (tool, command or path, error) in
# .claude/state/tool-failures.log, so a flaky command or a guard that keeps refusing shows up as a pattern.
set -u
. "$(dirname "$0")/lib.sh"
hook_read_input

TOOL="$(hook_field '.tool_name')"
TARGET="$(hook_field '.tool_input.command')"
[ -n "$TARGET" ] || TARGET="$(hook_field '.tool_input.file_path')"
# The log is read again later: what looks like a credential is not kept.
redact() {
  LC_ALL=C sed -E 's/([Bb]earer|[Bb]asic) [^ "'"'"']+/\1 [redacted]/g
    s/([A-Za-z0-9_-]*([Tt]oken|TOKEN|[Ss]ecret|SECRET|[Pp]assword|PASSWORD|[Pp]asswd|API_KEY|[Aa]pi[Kk]ey|api_key|PRIVATE_KEY|ACCESS_KEY)[A-Za-z0-9_-]*=)[^ &"'"'"']+/\1[redacted]/g
    s#(://[^/:@ ]+:)[^@/ ]+@#\1[redacted]@#g' | LC_ALL=C sed -E "s/($KIT_TOKEN_RE)/[redacted]/g"
}
ERROR="$(hook_field '.error' | tr '\n' ' ' | redact | cut -c1-300)"
TARGET="$(printf '%s' "$TARGET" | redact)"
[ -n "$TOOL" ] || exit 0

LOG="$HOOK_STATE_DIR/tool-failures.log"
mkdir -p "$HOOK_STATE_DIR" 2>/dev/null || exit 0
printf '%s\t%s\t%s\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$TOOL" "$(printf '%s' "$TARGET" | tr '\n' ' ' | cut -c1-200)" "$ERROR" >>"$LOG" 2>/dev/null
# Keep the last 500 lines only.
if [ "$(wc -l <"$LOG" 2>/dev/null || echo 0)" -gt 500 ]; then
  tail -n 500 "$LOG" >"$LOG.tmp" 2>/dev/null && mv "$LOG.tmp" "$LOG"
fi
exit 0
