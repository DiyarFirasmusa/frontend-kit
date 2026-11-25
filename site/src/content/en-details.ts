import type { Details } from './types.ts'

export const enDetails: Details = {
  why: {
    without: 'Without the kit',
    with: 'With the kit',
    pairs: [
      ['The assistant arranges your files differently every time', 'One folder map and one naming rule, read before it touches your files'],
      ['A third copy of the same button', 'Skills that look for what you already have before they build anything'],
      ['“Done”, but the app is broken', 'It checks the code for mistakes and runs related tests before it may say it is finished'],
      ['Only the case where everything goes well', 'Loading, errors, empty lists and success are all part of done'],
      ['Uploading straight to main, or reading your .env file of secrets', 'Safety checks that catch the common ways of doing this before they run'],
      ['Arabic pages that break', 'Layout rules that work right-to-left, and a checker for translations'],
      ['The assistant forgets everything after /clear', 'Your branch, the last check result and the hard rules are given back every time'],
      ['Typing the same long instructions again and again', 'A short request is enough, and the right skill is named for the assistant'],
    ],
    fit: {
      title: 'Use it when',
      items: [
        'You want a website or a dashboard and you do not know frontend (the part of an app people see and use). You describe it, and the kit helps build it.',
        'The work has to pass a review and last for years.',
        'Several people, or several assistant sessions, work in the same project folder.',
        'You publish in Arabic, English or both.',
      ],
    },
    skip: {
      title: 'Skip it when',
      items: [
        'Your project is not built with React (a popular tool for building screens). The kit is made for it.',
        'It is a throwaway prototype, and checks would only slow you down.',
        'You want the assistant to upload to main or ask for a merge by itself. It always waits for you.',
      ],
    },
  },
  features: {
    groups: [
      {
        title: 'It learns your project',
        items: [
          ['Finds your tools', 'It finds out which tools your project already uses: how packages are installed, the framework, page routing, how data is loaded, styling, tests, code checkers and formatters, translations and where the code lives. Anything it cannot find stays empty instead of being guessed.'],
          ['Projects with several parts', 'Some projects hold several apps in one folder (a monorepo). The kit finds each part and runs the tests inside the part that changed.'],
          ['One proposal', 'You see the whole setup and approve it. For files you already have, it shows what would change first.'],
          ['One settings file', 'Ports (the numbered doors your app runs on), commands, protected branches, live sites and paths are all in one file: .claude/wajiha-kit.json.'],
        ],
      },
      {
        title: 'It keeps a high standard',
        items: [
          ['Quality', 'Strict TypeScript with no any (a shortcut that turns type checking off), small files, real names, no dead code and no forgotten debug messages.'],
          ['Every situation', 'Every screen change covers loading, errors, empty lists and success.'],
          ['Only what you asked', 'All of what you asked and nothing else. No extra clean-up on the side.'],
          ['Speed', 'No requests that wait for each other, no needless redrawing, images with set sizes, and pages that do not jump while they load.'],
        ],
      },
      {
        title: 'It protects your project',
        items: [
          ['Git safety check', 'Git is the tool that keeps the history of your files. This check catches saving or uploading straight to protected branches, forced uploads, skipped safety checks and commands that throw work away.'],
          ['File safety check', 'Catches edits to secrets, lock files (the files that fix package versions), generated files, deploy settings and the build script.'],
          ['Live-site safety check', 'Catches requests, tests and browser visits to the sites you mark as live.'],
          ['Working modes', 'Freeze, urgent fix, read-only and six more. They set how careful and how fast the assistant works. A safety check enforces what it can see, and the rest is instruction.'],
          ['Permissions', 'A ready settings file that lists what the assistant may do, what it must ask about and what it may never do, adapted to your commands.'],
        ],
      },
      {
        title: 'It checks itself',
        items: [
          ['After each edit', 'Your own formatter and checker run on the file, and mistakes go straight back to the assistant.'],
          ['Before finishing', 'On code changed in the session, saved or not, it checks the code for mistakes and runs the related tests. When translation files changed, it also runs the translation checker.'],
          ['A second reader', 'Once the checks pass, the reviewer specialist reads the change. You can turn this off.'],
          ['Before saving a version', 'The assistant is warned when the change has not passed the checks.'],
        ],
      },
      {
        title: 'It speaks both directions',
        items: [
          ['Right-to-left and left-to-right', 'Layout rules that flip for Arabic and keep working for English.'],
          ['Translations', 'Every text has a two-level name, like orders.emptyTitle, in every language, and a checker verifies them.'],
          ['Accessibility', 'Meaningful structure, labels, focus, keyboard use, contrast and touch targets of at least 44px, with an auditor for WCAG 2.2 AA (an international standard for sites everyone can use).'],
          ['Figma', 'A skill that matches a Figma design in size, colour, text style and state.'],
        ],
      },
      {
        title: 'It comes with tools',
        items: [
          ['Chrome DevTools', 'An MCP server (a small helper program that gives the assistant a new ability) for inspecting pages, requests and speed.'],
          ['Playwright', 'An MCP server that drives a browser, with a skill for stable end-to-end tests (a robot that uses your app like a person).'],
          ['Context7', 'An MCP server that brings up-to-date documentation for the tools you use.'],
          ['Frontend report', 'A report format that says what changed, what was checked and what was not.'],
          ['Audit report', 'A report format for read-only reviews: findings first, with evidence.'],
        ],
      },
      {
        title: 'It fits a team',
        items: [
          ['Lives in your project folder', 'CLAUDE.md, rules, settings and the kit’s settings file are plain files your team can read, review and save.'],
          ['Easy to update', 'Setup leaves automatic updates off, so nothing changes until you decide. You update by hand from the command window, after you read the changelog.'],
          ['Cleans up safely', 'Files from another setup are moved to a dated backup, never deleted.'],
          ['Worked examples', 'Reference projects for Next.js, React Router, Jest, several apps in one folder, a site plus an admin, and fixing an old project.'],
        ],
      },
      {
        title: 'It leaves the decisions to you',
        items: [
          ['You save versions', 'Saving a version and uploading it wait for your clear yes.'],
          ['You ask for the merge', 'The assistant gives you the link and the description. The click is yours.'],
          ['You choose', 'Skill hints and the automatic review each have a switch.'],
          ['You hear back', 'On macOS a desktop alert tells you when the assistant is waiting for you.'],
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
      react: 'Any other project with screens',
    },
  },
  session: {
    events: {
      SessionStart: ['A session starts', 'A session is one conversation with the assistant. At the start, it is given your branch, the result of the last check and the hard rules. This happens again after you clear or shorten the conversation.', 'You start: it gets the rules and your branch'],
      UserPromptSubmit: ['You send a message', 'Short phrases are understood and the skills that fit are named for the assistant.', 'You ask: the fitting skills are named'],
      PreToolUse: ['The assistant is about to use a tool', 'Known dangerous commands, files and addresses are refused before they run.', 'Before an action: known dangerous ones are refused'],
      PostToolUse: ['A file is edited', 'It is formatted and checked with your project’s own tools.', 'A file changes: it is formatted and checked'],
      PostToolUseFailure: ['An action fails', 'The failure is written down, so repeated failures become visible.', 'An action fails: it is written down'],
      SubagentStart: ['A specialist starts', 'It is given the hard rules and the current mode, which it would not see otherwise.', 'A specialist starts: it gets the hard rules'],
      SubagentStop: ['A specialist that writes code reports back', 'For specialists that change code, the code must pass the mistake check first, or the specialist gets one more turn to fix it.', 'A specialist returns: the code is checked'],
      Notification: ['The assistant needs you', 'A desktop alert appears on macOS.', 'The assistant needs you: an alert appears'],
      Stop: ['The assistant wants to finish', 'The quality checks run on code changed in the session, saved or not, and then a review is requested. After three blocks in a row it gives up, so it cannot loop forever.', 'The assistant finishes: tests, then a review'],
      SessionEnd: ['The session ends', 'Its temporary working files are cleaned up.', 'Session ends: temporary files are cleaned up'],
    },
  },
  refactor: {
    steps: [
      ['/wajiha-kit:refactor-mode on', 'Switch the project into fix-an-old-project mode.'],
      ['/wajiha-kit:refactor-mode audit', 'Measure structure, types, data, forms and tests without editing any code, then write a plan in phases.'],
      ['/wajiha-kit:refactor-mode next', 'Carry out one phase you approved. The app behaves the same, and the checks must pass.'],
      ['/wajiha-kit:refactor-mode off', 'Return to normal work. Unfinished phases stay in the plan.'],
    ],
    note: 'Bugs found on the way are written down, not fixed in silence.',
  },
  answers: {
    title: 'Fair questions.',
    items: [
      ['Will it work on a project I already have?', 'Yes. Setup has a mode for existing projects: it finds out which tools you use, adapts to them and shows every change to existing files before it writes.'],
      ['Do I have to use TanStack (a set of tools for building web apps)?', 'No. The website kind is built on TanStack Start. Dashboards can use Vite, TanStack Start or Next.js, and the React kind adapts to other tools. For a new project the kit picks its own tested setup, so you do not have to choose.'],
      ['Does it cost more to run?', 'Yes, somewhat. Checks and reviews use tokens (the units of text the assistant is charged by) and time. On two small test tasks it cost about 1.5 times as much and scored higher on our own scoring sheet. That is a small sample.'],
      ['Are the safety checks a real security sandbox?', 'No. They are small scripts that catch known patterns, so a command written in a different way can get past them. Keep the branch protection of your code host and your normal access rules.'],
      ['Can I turn parts off or change the rules?', 'Yes. The rules are files in your project folder. The automatic review and the skill hints have switches in the settings file.'],
      ['Will it delete my rules?', 'No. Setup shows what would change before it touches an existing file, and clean-up moves files to a backup folder.'],
      ['Does it send my code anywhere?', 'The safety checks are local scripts. The bundled MCP servers (helper programs) are downloaded through npx (a tool that fetches and runs them), and Context7 sends documentation questions to its service.'],
      ['Does it only speak Arabic and English?', 'Those two are fully supported. With one left-to-right language, setup leaves out the right-to-left and translation rules.'],
    ],
  },
}
