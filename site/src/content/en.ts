import type { Copy } from './types.ts'

export const en: Copy = {
  dir: 'ltr',
  meta: {
    title: 'frontend-kit, a Claude Code plugin for React frontends',
    description:
      'A Claude Code plugin that makes Claude build React and TypeScript like a careful frontend team: skills, agents, rules, guards and quality checks, in English and Arabic.',
  },
  chrome: {
    skip: 'Skip to content',
    sections: 'Sections',
    menu: 'Menu',
    install: 'Install',
    switchLanguage: 'العربية',
    pause: 'Pause motion',
    play: 'Play motion',
    cue: 'Scroll to see how it works',
  },
  scenes: {
    intro: {
      title: 'Claude, building like your best frontend team.',
      text: 'frontend-kit is a Claude Code plugin for React and TypeScript. It gives Claude skills, rules, a review crew and guards, then checks the work.',
    },
    without: {
      title: 'Without the kit, Claude guesses.',
      text: 'Fast code that falls apart in review.',
      points: ['A new folder structure every session', 'A third copy of the same button', '“Done”, with a failing build', 'A layout that breaks in Arabic'],
    },
    with: {
      title: 'With the kit, every piece has its place.',
      text: 'The same request. The standard of a team.',
      points: [
        'One folder map and one naming rule',
        'Existing components found and reused',
        'Typecheck and tests before it finishes',
        'Arabic RTL and English from the start',
      ],
    },
    how: {
      title: 'Three steps to a production standard.',
      steps: [
        ['Install', 'Two commands add the plugin to Claude Code.'],
        ['Set up', 'It reads your stack, shows one proposal and waits for your yes.'],
        ['Build', 'Ask in your own words. It picks the skill and checks the result.'],
      ],
    },
    website: {
      title: 'For websites.',
      text: 'Server rendering, SEO, share previews and server functions on TanStack Start.',
    },
    dashboard: {
      title: 'For dashboards.',
      text: 'Tables, forms, filters and permissions on Vite, Next.js or TanStack Start.',
    },
    both: {
      title: 'For both together, or any React app.',
      text: 'A site and its admin in one project, or your existing stack, detected and adapted to.',
    },
    skills: {
      title: ({ skills }) => `${skills} skills, a playbook for each job.`,
      text: 'A skill is a set of written steps for one job. Say “add a table”, and Claude follows the table skill.',
    },
    agents: {
      title: ({ agents }) => `${agents} agents behind every change.`,
      text: 'An agent is a second Claude with one role and fresh eyes: it plans, builds, tests, reviews or audits.',
    },
    rules: {
      title: ({ rules }) => `${rules} rules, loaded where they matter.`,
      text: 'A rule is a standard saved in your repo. Editing a form loads the forms rule.',
    },
    checks: { title: 'Watched from first prompt to last check.' },
    guards: {
      title: 'Dangerous commands hit a wall.',
      text: 'Force pushes, skipped hooks, secrets and live hosts. The guards catch known patterns before they run.',
    },
    install: {
      title: 'Give Claude your standard.',
      text: 'Run these three inside Claude Code, in your project.',
    },
  },
  facts: { skills: 'skills', agents: 'agents', rules: 'rules', events: 'hook events' },
  box: {
    title: 'Everything the kit puts in your project.',
    lead: 'Nothing below is a plan. All of it ships in the current version.',
    contents: ({ skills, agents, events, rules, servers, denied, examples }) => [
      [skills, 'skills, from one component to a whole feature'],
      [agents, 'agents that plan, build, test and review'],
      [rules, 'rule files that load by path'],
      [events, 'session events watched by hooks'],
      [4, 'project types, each with its own setup'],
      [servers, 'MCP servers for browsers and docs'],
      [denied, 'deny rules in the ready settings file'],
      [examples, 'example projects to read'],
    ],
  },
  gate: {
    title: 'Try the guard yourself.',
    lead: 'Pick a command and send it as Claude. Each answer is the real output of the hook in the plugin. It catches known patterns and is not a sandbox.',
    commands: 'Commands to try',
    waiting: 'Waiting for a command.',
    denied: 'Blocked',
    allowed: 'Let through',
    quiet: 'The hook stays silent and the command runs.',
    notes: {
      force: 'A force push would rewrite shared history.',
      verify: 'This would skip the checks of your repo.',
      main: 'Work should reach main through your review.',
      reset: 'This would throw away unsaved work.',
      secrets: 'This would bring secrets into the conversation.',
      live: 'This would touch real customers. The live hosts come from your config.',
      typecheck: 'Ordinary work goes straight through.',
    },
    after: 'When Claude stops after changing source, committed or not, typecheck and related tests run. Then a reviewer agent reads the change.',
  },
  install: {
    title: 'Install it in three commands.',
    lead: 'Run them inside Claude Code, in your project. Restart it after setup.',
    steps: ['Add the marketplace', 'Install the plugin', 'Set up the project'],
    needs: 'Needs Claude Code 2.1.295 or newer, jq, Node 20 or newer, and git.',
    copy: 'Copy',
    copied: 'Copied',
    failed: 'Press copy',
  },
  footer: { source: 'GitHub', changelog: 'Changelog', examples: 'Examples', notices: 'Third-party licences' },
}
