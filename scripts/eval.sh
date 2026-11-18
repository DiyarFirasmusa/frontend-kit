#!/bin/bash
# Runs the frontend-kit skill evals (plugins/frontend-kit/evals) with `claude plugin eval`.
# EVERY run calls the API and costs money. Cases per run: see the count it prints before it starts.
#
#   bash scripts/eval.sh dev       run the dev cases (3 runs each, no no-plugin arm)
#   bash scripts/eval.sh save      keep the last dev result as the baseline
#   bash scripts/eval.sh compare   baseline vs the last dev result, per case
#   bash scripts/eval.sh info      run the informational cases (implicit agent delegation)
#   bash scripts/eval.sh heldout   run the heldout cases (ONLY at the end, asks first)
#
# Optional: EVAL_MODEL=<model id> to pin the model, EVAL_MAX_COST_USD=<n> for a hard cost ceiling,
# EVAL_JOBS=<1-8> to run cases in parallel, EVAL_TRUST=1 to skip the "trust this plugin directory" prompt (CI, your own plugin).
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLUGIN="$ROOT/plugins/frontend-kit"
RESULTS="$PLUGIN/evals/results"
THRESHOLD=0.8

run() { # <dev|heldout>
  local group="$1" count
  count="$(find "$PLUGIN/evals/$group" -name prompt.md | wc -l | tr -d ' ')"
  echo "$group: $count cases x 3 runs = $((count * 3)) agent runs (plus judge calls for llm graders)."
  mkdir -p "$RESULTS"
  local args=(plugin eval "$PLUGIN" --case "$group-*" --ablation none --threshold "$THRESHOLD" --no-publish --json "$RESULTS/$group-current.json")
  [ -n "${EVAL_MODEL:-}" ] && args+=(--model "$EVAL_MODEL")
  [ -n "${EVAL_MAX_COST_USD:-}" ] && args+=(--max-cost-usd "$EVAL_MAX_COST_USD")
  [ -n "${EVAL_JOBS:-}" ] && args+=(--concurrency "$EVAL_JOBS")
  [ "${EVAL_TRUST:-}" = 1 ] && args+=(--trust-plugin)
  claude "${args[@]}"
}

case "${1:-}" in
  dev) run dev ;;
  info) run info ;;
  heldout)
    echo "Heldout cases are for the very end. If you change a skill after this, they stop being heldout."
    printf 'Run them now? [y/N] '
    read -r answer
    [ "$answer" = y ] || exit 1
    run heldout ;;
  save)
    [ -f "$RESULTS/dev-current.json" ] || { echo "No result yet: run 'bash scripts/eval.sh dev' first." >&2; exit 1; }
    cp "$RESULTS/dev-current.json" "$RESULTS/dev-baseline.json"
    echo "Saved the last dev result as the baseline." ;;
  compare)
    [ -f "$RESULTS/dev-baseline.json" ] && [ -f "$RESULTS/dev-current.json" ] || { echo "Need a baseline (save) and a current result (dev)." >&2; exit 1; }
    jq -n --slurpfile b "$RESULTS/dev-baseline.json" --slurpfile c "$RESULTS/dev-current.json" '
      def score: .aggregates.overallScore;
      def per: [.cases[] | {key: .name, value: .aggregates.score}] | from_entries;
      ($b[0]) as $base | ($c[0]) as $cur |
      "baseline: \(($base | score) * 1000 | round / 10)%   current: \(($cur | score) * 1000 | round / 10)%   diff: \((($cur | score) - ($base | score)) * 1000 | round / 10) points",
      ( ($base | per) as $bp | ($cur | per) as $cp
        | ([$bp, $cp] | add | keys[]) as $name
        | select(($bp[$name]) != ($cp[$name]))
        | "  \($name): \($bp[$name] // "-") -> \($cp[$name] // "-")" )' -r ;;
  *) sed -n 2,11p "$0"; exit 64 ;;
esac
