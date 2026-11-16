# Evals for frontend-kit skills

Run with `claude plugin eval` (Claude Code 2.1.269 or later). Every run calls the API and costs money.

```sh
bash scripts/eval.sh dev        # dev cases, 3 runs each, no-plugin arm skipped
bash scripts/eval.sh save       # keep the last dev result as the baseline
# change ONE thing in a skill, then:
bash scripts/eval.sh dev
bash scripts/eval.sh compare    # baseline vs current, per case
bash scripts/eval.sh heldout    # ONLY at the end, once
```

- `dev/` cases are for tuning. `heldout/` cases are never run by `dev`; if you change a skill after seeing a heldout
  result, they stop being heldout.
- Cases are `prompt.md` + `graders/*.md`. Code graders (`regex`) first; an `llm` grader only where no pattern fits (clean snippets).
- The child session loads only this plugin in an empty folder: the project's `.claude/rules` are not there, so the cases
  test what the skills and the model do on their own.
- Results go to `evals/results/` (git-ignored).
- To add a case: `claude plugin eval init --bare <name>`, move it under `dev/`, name it `dev-...`.
