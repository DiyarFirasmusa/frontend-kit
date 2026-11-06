#!/bin/bash
# Records the result of the last quality gate in .claude/state/last-gate.json (gitignored), which
# the session banner and the status band read.
#
#   "${CLAUDE_PLUGIN_ROOT}"/scripts/record-gate.sh <pass|fail> <source> "<one-line summary>"
#   e.g. "${CLAUDE_PLUGIN_ROOT}"/scripts/record-gate.sh pass verify "typecheck, lint, 812 tests, i18n, build"
set -u
. "$(dirname "$0")/lib.sh"

RESULT="${1:-}"
SOURCE="${2:-manual}"
SUMMARY="${3:-}"
case "$RESULT" in
  pass | fail) ;;
  *) echo "usage: record-gate.sh <pass|fail> <source> <summary>" >&2; exit 64 ;;
esac

mkdir -p "$HOOK_STATE_DIR"
jq -n \
  --arg result "$RESULT" \
  --arg source "$SOURCE" \
  --arg summary "$SUMMARY" \
  --arg branch "$(git -C "$HOOK_ROOT" branch --show-current 2>/dev/null)" \
  --arg head "$(git -C "$HOOK_ROOT" rev-parse --short HEAD 2>/dev/null)" \
  --arg fingerprint "$(hook_src_fingerprint)" \
  --arg at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '{result: $result, source: $source, summary: $summary, branch: $branch, head: $head, fingerprint: $fingerprint, at: $at}' \
  >"$HOOK_STATE_DIR/last-gate.json.tmp" &&
  mv "$HOOK_STATE_DIR/last-gate.json.tmp" "$HOOK_STATE_DIR/last-gate.json"
