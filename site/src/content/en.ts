import type { Copy } from './types.ts'

export const en: Copy = {
  dir: 'ltr',
  meta: {
    title: 'frontend-kit, a Claude Code plugin for React frontends',
    description:
      'A Claude Code plugin that gives React and TypeScript projects the skills, agents, rules and guards of a careful frontend team, in English and Arabic.',
  },
  chrome: {
    skip: 'Skip to content',
    home: 'frontend-kit, back to the top',
    nav: { why: 'Why', features: 'Features', profiles: 'Profiles', gate: 'The gate', parts: 'Skills', answers: 'Questions' },
    install: 'Install',
    switchLanguage: 'العربية',
    pause: 'Pause motion',
    play: 'Play motion',
  },
  hero: {
    line: 'Every part of a great frontend team, in one box.',
    lead: 'A Claude Code plugin for React and TypeScript. Claude writes the code; the kit supplies the parts, the instructions and the final inspection.',
    install: 'Install the plugin',
    jump: 'Make Kit jump',
  },
  runner: {
    title: 'It all comes on one runner.',
    lead: () =>
      'Like a model kit, nothing is loose and nothing is guessed. Claude clips off the part the job needs and fits it the way your project does.',
    box: 'In the box',
    contents: ({ skills, agents, events, rules, servers, denied, examples }) => [
      [String(skills), 'skills, from one component to a whole feature'],
      [String(agents), 'agents that plan, build, test and review'],
      [String(events), 'session events watched by hooks'],
      ['4', 'project profiles, each with its own rules'],
      [String(rules), 'rule files that load by path'],
      [String(servers), 'MCP servers for browsers and docs'],
      [String(denied), 'deny rules in the ready settings file'],
      [String(examples), 'example projects to read'],
    ],
  },
  build: {
    title: 'Three steps. No glue.',
    steps: [
      { title: 'Add it', text: 'Install the plugin from its marketplace with two commands.' },
      { title: 'Fit it', text: 'Setup detects your framework, router, tests, linter and folders, shows one proposal and waits for your yes.' },
      { title: 'Build', text: 'Ask in your own words. The kit names the skill that fits, formats each edit and checks the work before Claude finishes.' },
    ],
  },
  profiles: {
    title: 'Same parts. Your kind of build.',
    list: 'Project profiles',
    items: {
      website: {
        name: 'Website',
        title: 'Made to be found.',
        text: 'Public pages rendered on the server, with loaders, SEO, share previews and server functions.',
        stack: ['TanStack Start', 'SSR', 'SEO', 'Server functions'],
      },
      dashboard: {
        name: 'Dashboard',
        title: 'Made for long days of work.',
        text: 'Tables, forms, filters and permissions, with one folder map for each framework you can pick.',
        stack: ['Vite + TanStack Router', 'TanStack Start SPA', 'Next.js'],
      },
      react: {
        name: 'Any React app',
        title: 'Made to fit what you have.',
        text: 'Setup reads the project and adapts the rules, commands and permissions to the stack it finds.',
        stack: ['Next.js', 'React Router', 'Remix', 'Expo web'],
      },
      fullstack: {
        name: 'Site + admin',
        title: 'Two apps, one tree.',
        text: 'A public site and its admin side by side. Each keeps its own rules, skills and checks.',
        stack: ['TanStack Start', 'Public site', 'Admin panel'],
      },
    },
  },
  gate: {
    title: 'Try to get past the gate.',
    lead: 'Pick a command and send it through as Claude. Each answer below is the real output of the hook that ships in the plugin.',
    commands: 'Commands to try',
    waiting: 'The gate is waiting for a command.',
    denied: 'Blocked',
    allowed: 'Let through',
    quiet: 'The hook stays silent and the command runs.',
    notes: {
      force: 'Shared history is never rewritten.',
      verify: 'The checks of your repo cannot be skipped.',
      main: 'Work reaches main through your review.',
      reset: 'Unsaved work is never thrown away.',
      secrets: 'Secrets stay out of the conversation.',
      live: 'Testing never touches real customers. The live hosts come from your config.',
      typecheck: 'Ordinary work is never slowed down.',
    },
    after: 'When Claude stops, typecheck and related tests run. Then a reviewer agent reads the change.',
  },
  parts: {
    title: 'Pick a part. Snap it off.',
    lead: ({ skills }) => `All ${skills} skills, sorted by job. Select one to see what it does.`,
    empty: 'Nothing snapped off yet',
    emptyText: 'Select any part on the runners.',
    auto: 'Claude picks it when your request fits. You can also call it by name.',
    manual: 'Runs only when you call it by name.',
  },
  crew: {
    title: 'A crew that checks its own work.',
    lead: ({ agents }) => `${agents} agents, each with one job. Point at a name to call them forward.`,
  },
  install: {
    title: 'Open the box.',
    lead: 'Run these inside Claude Code, in your project. Restart it after setup.',
    steps: ['Add the marketplace', 'Install the plugin', 'Fit it to the project'],
    needs: 'Needs jq, Node 20 or newer, and git.',
    copy: 'Copy',
    copied: 'Copied',
    failed: 'Selected, press copy',
    source: 'Read the source on GitHub',
  },
  footer: { source: 'GitHub', changelog: 'Changelog', examples: 'Examples', notices: 'Third-party licences' },
}
