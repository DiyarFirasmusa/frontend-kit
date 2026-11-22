---
type: llm
---

PASS if the final answer reports at least three of these five: (1) the Arabic plural set lacks the `_few` form (and the Arabic sentence needs it), (2) `<html lang="ar" dir="ltr">` is hard-coded to LTR, (3) `ml-4` and `text-left` are physical properties instead of logical ones, (4) `toLocaleString`/`Intl.NumberFormat` is pinned to en-US and not the active locale, (5) the "Save" label is hard-coded text outside t(). Arabic forms that English does not have are correct and never a parity finding.
FAIL otherwise.
