# refactor-legacy

A deliberately messy app, refactor mode.

A synthetic legacy app (7 files: one 255-line component, 40 dead handlers, an import cycle, barrels, direct axios calls,
inline styles with physical directions, no tests). The files under `docs/` are the real output of
`/frontend-kit:refactor-mode audit` run by Claude Code in a headless session.

Read `docs/refactor-plan.md`: the baseline numbers, the findings with `file:line`, the ordered phases (each one commit,
behaviour frozen) and the bugs it found but did **not** fix because fixing them would change behaviour.

The `.claude/frontend-kit.json` here is the one setup would write (`mode: "refactor"`). In the original headless run the
config could not be written (Claude Code asked for permission inside `.claude/`, nobody granted it), which is why setup now
writes that file first and stops without copying anything else when it is refused.

Back to the [examples index](../README.md).
