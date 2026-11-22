---
type: llm
---

PASS if the answer (a) names at least two of these React 19 removals as breaking changes used in this code: ReactDOM.render (replaced by createRoot), defaultProps on function components, and findDOMNode, each tied to its file (the code is given inline, so a line number is not required), (b) gives a phased plan that starts from a baseline or the 18.3 bridge release, with a proof step per phase, and (c) does not run or recommend running a codemod as an action taken now (naming one as a command for the user to run is fine).
FAIL if it changes files, runs a codemod, or names no breaking change from the code.
