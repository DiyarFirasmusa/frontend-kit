# Scope: do what was asked, all of it, nothing else

These come from the user's own corrections.

- **A question gets an answer, not an edit.** "Why …?", "what …?", "how …?",
  "explain", "explane", "just read the code": read the code that runs (page,
  state, data layer, endpoint; on a server-rendered site also the route
  `loader` and server functions; for "why is it like this", `git log -p
  --follow` and `git blame`), lead with the answer and `file:line` evidence, and
  say what is not known. Edit only when the message also asks for a change.
  A note for the team or backend is written for them: plain and short.
- **Change means change, not delete.** Asked to change X (its price, label,
  calculation, spacing), keep X and change that part. Removing UI or logic
  needs an explicit ask; when unsure, ask one short question.
- **"All", "every", "check all", "cheak all", "other pages"** mean every
  occurrence in the repo. Write the pattern in one line and grep every spelling
  (copy-pasted twins, `e2e/`); list `file:line` before changing, and ask first
  when there are more than ~15 or one needs a product decision. Fix each one on
  the same branch, then repeat the grep and show it empty (or each deliberate
  exception). List the files in the report.
- **A Figma link is the spec.** Match spacing, size, colour, radius, type and
  states exactly (`figma-match` skill). Don't "improve" a design that has a frame.
- **Translations ship together.** With i18n, every user-facing string goes into
  each language the project ships, in the same change. Never leave a key in one.
- **No layout shift on mobile.** Every visual change is checked at phone width
  in each language the project has; nothing jumps while data loads.
- **"Continue" / "contine"** resumes the last unfinished step. Don't restart,
  re-plan or re-ask what was answered. On long tasks keep a todo list and keep
  going until it is done or truly blocked.
- **"Fast"** means the shortest correct path, not a lower bar: the gates still run.
- **Keep the scope.** No drive-by refactors, renames or reformatting outside
  the task. Note anything worth doing separately in the report.
- **"Nothing needs to change", with the evidence, is a finished task.**
- **Deploy config and the live site stay untouched** unless the user asks for
  that exact change: the Hard rules in `CLAUDE.md`, enforced by the hooks.
- **Say what's missing from the backend.** When an endpoint, field or behaviour
  is missing or wrong, say so plainly (and offer the `backend-request` skill)
  instead of faking data in the frontend.
- **Report in 3–6 short lines,** user-visible change first, then files, how it
  was verified, and what was not checked.
