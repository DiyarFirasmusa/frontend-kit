#!/bin/bash
# Scores the diff of one benchmark run against a fixed rubric with an LLM judge and prints one JSON object.
#   bench-judge.sh <diff-file>
# The judge sees only the diff (no arm name), so it cannot favour the kit. Each criterion is 0 or 1.
set -u
DIFF="${1:?diff file}"
[ -s "$DIFF" ] || { echo '{"error":"empty diff"}'; exit 0; }
RUBRIC='You are grading the code a developer added for one task in a React + TypeScript app that ships in Arabic (RTL) and English (LTR), phone first. Grade ONLY what is in the diff. Answer with ONE JSON object and nothing else, each value 0 or 1:
{"accessibleName": every interactive control has a visible label or aria-label (not only a placeholder),
 "noHardcodedText": user-facing text is passed in (props or a translation function), not hardcoded in one language,
 "logicalDirection": layout CSS/classes use logical properties (inline-start/end, padding-inline, start/end), no physical left/right,
 "touchTarget": interactive controls are at least 44px high/wide or use a 44px minimum,
 "statesHandled": loading/empty/disabled/out-of-stock or other states in the task are handled, not ignored,
 "testsMeaningful": the tests assert behaviour (not just that it renders) and cover the main cases of the task,
 "noAnyOrCasts": no any, no @ts-ignore, no unsafe casts,
 "focusAndKeyboard": keyboard use works (real buttons/inputs, visible focus, clear button returns focus where relevant),
 "smallAndFocused": the diff only contains what the task asked for}'
claude -p "$RUBRIC

DIFF:
$(cat "$DIFF")" --output-format json --model haiku --setting-sources project --strict-mcp-config --no-session-persistence \
  --disable-slash-commands 2>/dev/null </dev/null | jq -r '.result' | sed -n '/{/,/}/p' | jq -c . 2>/dev/null || echo '{"error":"judge failed"}'
