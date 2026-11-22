---
type: llm
---

PASS if the answer (a) names at least two of these React 19 removals as breaking changes used in this code: ReactDOM.render (replaced by createRoot), defaultProps on function components, and findDOMNode, each with its file and line, (b) gives a phased plan with a proof step per phase, and (c) does not run or recommend running a codemod as an action taken now (naming one as a command for the user to run is fine).
FAIL if it changes files, runs a codemod, or names no breaking change from the code.
