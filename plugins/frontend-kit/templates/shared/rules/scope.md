# Scope: do what was asked, all of it, nothing else

These come from the user's own corrections.

- **A question gets an answer, not an edit.** "Why …?", "what …?", "how …?",
  "explain", "explane", "just read the code": read and explain. Edit only when
  the message also asks for a change.
- **Change means change, not delete.** Asked to change X (its price, label,
  calculation, spacing), keep X and change that part. Removing UI or logic
  needs an explicit ask; when unsure, ask one short question.
- **"All", "every", "check all", "cheak all", "other pages"** mean every
  occurrence in the repo. Find them with grep, fix each one on the same branch,
  and finish with the grep that shows none are left. List the files in the report.
- **A Figma link is the spec.** Match spacing, size, colour, radius, type and
  states exactly (`figma-match` skill). Don't "improve" a design that has a frame.
- **Translations ship together.** Every user-facing string goes into both
  Arabic and English in the same change. Never leave a key in one language.
- **No layout shift on mobile.** Every visual change is checked at phone width
  in Arabic and English; nothing jumps while data loads.
- **"Continue" / "contine"** resumes the last unfinished step. Don't restart,
  re-plan or re-ask what was answered. On long tasks keep a todo list and keep
  going until it is done or truly blocked.
- **"Fast"** means the shortest correct path, not a lower bar: the gates still run.
- **Keep the scope.** No drive-by refactors, renames or reformatting outside
  the task. Note anything worth doing separately in the report.
- **Never touch deploy config** (`.github/`, `deploy/`, the `build` script and
  any path `CLAUDE.md` protects) unless the user asks for that exact change.
- **Never test against the live site** ({{LIVE_HOST}}). Use local mocks or
  UAT ({{UAT_HOST}}).
- **Say what's missing from the backend.** When an endpoint, field or behaviour
  is missing or wrong, say so plainly (and offer the `backend-request` skill)
  instead of faking data in the frontend.
- **Report in 3–6 short lines,** user-visible change first, then files, how it
  was verified, and what was not checked.
