import type { Details } from './types.ts'

export const enDetails: Details = {
  why: {
    without: 'Without the kit',
    with: 'With the kit',
    pairs: [
      ['A new folder structure every session', 'One folder map and naming rule, loaded for the files being edited'],
      ['A third copy of the same button', 'Skills that look for what exists before they write'],
      ['“Done”, and the build is red', 'Typecheck and related tests before the assistant can finish'],
      ['Only the happy path', 'Loading, error, empty and success are part of done'],
      ['A push to main, a peek at .env', 'A hook that catches the common forms before they run'],
      ['Arabic pages that break', 'Logical CSS rules and a translation validator'],
      ['Context lost after /clear', 'Branch, gate result and hard rules put back every time'],
      ['The same long prompt, again', 'A short request, and the fitting skill is named for the assistant'],
    ],
    fit: {
      title: 'Use it when',
      items: [
        'You build frontends with a coding assistant, in React and TypeScript or another stack.',
        'The code has to pass review and live for years.',
        'Several people or sessions share one codebase.',
        'You ship in Arabic, English or both.',
      ],
    },
    skip: {
      title: 'Skip it when',
      items: [
        'The project is not React.',
        'It is a throwaway prototype and checks would only slow you down.',
        'You want the assistant to open pull requests or push to main by itself.',
      ],
    },
  },
  features: {
    groups: [
      {
        title: 'It learns your project',
        items: [
          ['Stack detection', 'Package manager, framework, router, data layer, styling, tests, linter, formatter, i18n and source folders. What it cannot find stays empty instead of guessed.'],
          ['Monorepos', 'Workspace packages are found, and tests run inside the package that changed.'],
          ['One proposal', 'You see the whole setup and approve it. Files you already have are shown as a diff first.'],
          ['One config file', 'Ports, commands, protected branches, live hosts and paths live in .claude/frontend-kit.json.'],
        ],
      },
      {
        title: 'It holds a high bar',
        items: [
          ['Quality bar', 'Strict types with no any, small files, real names, no dead code, no leftover logs.'],
          ['Every state', 'Loading, error, empty and success are designed in each UI change.'],
          ['Scope', 'All of what was asked and nothing else. No drive-by refactors.'],
          ['Performance', 'No request waterfalls or needless renders; images are sized and layouts stay still.'],
        ],
      },
      {
        title: 'It protects the repo',
        items: [
          ['Git guard', 'Catches commits and pushes on protected branches, force pushes, skipped hooks and commands that discard work.'],
          ['File guard', 'Catches edits to secrets, lockfiles, generated files, deploy config and the build script.'],
          ['Live-site guard', 'Catches requests, tests and browser visits to the hosts you mark as live.'],
          ['Working modes', 'Freeze, hotfix, read-only and six more. A guard holds what a hook can see, and the rest is instruction.'],
          ['Permissions', 'A ready settings file with allow, ask and deny lists, adapted to your commands.'],
        ],
      },
      {
        title: 'It checks itself',
        items: [
          ['After each edit', 'Your own formatter and linter run on the file, and errors go straight back to the assistant.'],
          ['Before finishing', 'On source changed in the session, committed or not: typecheck, related tests and, when locale files changed, the translation validator.'],
          ['A second reader', 'Once the gate passes, the reviewer agent reads the change. You can turn this off.'],
          ['Before a commit', 'The assistant is warned when the change has not passed the gate.'],
        ],
      },
      {
        title: 'It speaks both directions',
        items: [
          ['RTL and LTR', 'Logical properties, mirrored layouts and rules for Arabic and English.'],
          ['Translations', 'Two-level keys in every language, checked by a validator.'],
          ['Accessibility', 'Semantics, labels, focus, keyboard, contrast, 44px targets and a WCAG 2.2 AA auditor.'],
          ['Figma', 'A skill that matches a frame in size, colour, type and state.'],
        ],
      },
      {
        title: 'It comes with tools',
        items: [
          ['Chrome DevTools', 'An MCP server for inspecting pages, requests and performance.'],
          ['Playwright', 'An MCP server for driving a browser, with a skill for stable end-to-end tests.'],
          ['Context7', 'An MCP server for current library documentation.'],
          ['Frontend report', 'An output style that says what changed, what was checked and what was not.'],
          ['Audit report', 'An output style for read-only reviews: findings first, with evidence.'],
        ],
      },
      {
        title: 'It fits a team',
        items: [
          ['Lives in the repo', 'CLAUDE.md, rules, settings and config are plain files your team reviews and commits.'],
          ['Easy to update', 'Setup turns automatic updates on. Where the updater is switched off, you update by hand from the terminal.'],
          ['Cleans up safely', 'Files of another profile are moved to a dated backup, never deleted.'],
          ['Worked examples', 'Reference projects for Next.js, React Router, Jest, monorepos, site plus admin and refactors.'],
        ],
      },
      {
        title: 'It respects your hands',
        items: [
          ['You commit', 'Commit and push wait for your explicit yes.'],
          ['You open the PR', 'The assistant prints the compare link and the description. The click is yours.'],
          ['You choose', 'Skill hints and the automatic review each have a switch.'],
          ['You hear back', 'On macOS a desktop alert tells you when the assistant is waiting.'],
        ],
      },
    ],
  },
  rules: {
    groups: {
      shared: 'Every project',
      website: 'Website',
      dashboard: 'Dashboard',
      'dashboard/variants/next': 'Dashboard on Next.js',
      'dashboard/variants/tanstack-start': 'Dashboard on TanStack Start',
      react: 'Any other frontend',
    },
  },
  session: {
    events: {
      SessionStart: ['A session starts', 'Branch state, the last gate result and the hard rules are handed to the assistant, also after clear and compact.', 'Session starts: rules and branch state are handed over'],
      UserPromptSubmit: ['You send a prompt', 'Short phrases are understood and the skills that fit are named.', 'You ask: the fitting skills are named'],
      PreToolUse: ['The assistant reaches for a tool', 'Known dangerous commands, files and addresses are refused before they run.', 'A tool runs: known dangerous actions are refused'],
      PostToolUse: ['A file is edited', 'It is formatted and linted with your project’s tools.', 'A file changes: it is formatted and linted'],
      PostToolUseFailure: ['A tool fails', 'The failure is logged, so repeats become visible.', 'A tool fails: the failure is logged'],
      SubagentStart: ['An agent starts', 'It is handed the hard rules and the mode, which it would not see otherwise.', 'An agent starts: the hard rules are handed over'],
      SubagentStop: ['A coding agent reports back', 'The typecheck must pass first for the agents that change code, or the agent gets one more turn to fix it.', 'An agent returns: the typecheck runs'],
      Notification: ['The assistant needs you', 'A desktop alert appears on macOS.', 'The assistant needs you: a desktop alert appears'],
      Stop: ['The assistant wants to finish', 'The quality gate runs on source changed in the session, committed or not, then asks for a review. It gives up after three blocks in a row, so it cannot loop.', 'The assistant stops: tests, then a code review'],
      SessionEnd: ['The session ends', 'Its working files are cleaned up.', 'Session ends: working files are cleaned up'],
    },
  },
  refactor: {
    steps: [
      ['/frontend-kit:refactor-mode on', 'Switch the project into refactor mode.'],
      ['/frontend-kit:refactor-mode audit', 'Measure structure, types, data, forms and tests without editing code, then write a phased plan.'],
      ['/frontend-kit:refactor-mode next', 'Carry out one phase you approved, with behaviour frozen and the gate green.'],
      ['/frontend-kit:refactor-mode off', 'Return to normal work. Unfinished phases stay in the plan.'],
    ],
    note: 'Bugs found on the way are written down, not silently fixed.',
  },
  answers: {
    title: 'Fair questions.',
    items: [
      ['Will it work on a project I already have?', 'Yes. Setup has a mode for existing projects: it detects the stack, adapts to it and shows every change to existing files before writing.'],
      ['Do I have to use TanStack?', 'No. The website profile is built on TanStack Start. Dashboards can use Vite, TanStack Start or Next.js, and the React profile adapts to other stacks.'],
      ['Does it cost more to run?', 'Yes, somewhat. Checks and reviews use tokens and time. On two small test tasks it cost about 1.5 times as much and scored higher on our rubric. That is a small sample.'],
      ['Are the guards a security sandbox?', 'No. They are scripts that catch known patterns, so a differently written command can get past them. Keep your branch protection and normal access controls.'],
      ['Can I turn parts off or change the rules?', 'Yes. Rules are files in your repo. The automatic review and the skill hints have switches in the config file.'],
      ['Will it delete my rules?', 'No. Setup shows a diff before touching an existing file, and cleanup moves files to a backup folder.'],
      ['Does it send my code anywhere?', 'The hooks are local scripts. The bundled MCP servers are downloaded through npx, and Context7 sends documentation queries to its service.'],
      ['Does it only speak Arabic and English?', 'Those two are first-class. With one left-to-right language, setup leaves the RTL and translation rules out.'],
    ],
  },
}
