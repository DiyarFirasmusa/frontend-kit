import type { Copy } from './types.ts'

export const en: Copy = {
  dir: 'ltr',
  meta: {
    title: 'Wajiha Kit: a tidy, fast frontend built with Claude, for vibe coders and backend developers',
    description:
      'A free kit for the Claude app. Answer a few simple questions and Claude builds your website or dashboard in Arabic and English, on one clean structure you can maintain, then checks it with tests and a reviewer. For vibe coders and backend developers.',
  },
  chrome: {
    skip: 'Skip to content',
    sections: 'Sections',
    menu: 'Menu',
    install: 'Start',
    switchLanguage: 'العربية',
    pause: 'Pause motion',
    play: 'Play motion',
  },
  facts: { skills: 'skills', agents: 'specialists', rules: 'rules', events: 'safety-check events' },
  box: {
    title: 'Everything the kit contains. Each project gets the part that fits it.',
    lead: 'Nothing below is a plan. All of it ships in the current version.',
    contents: ({ skills, agents, events, rules, servers, denied, examples }) => [
      [skills, 'skills, from one component to a whole feature'],
      [agents, 'specialists that plan, build, test and review'],
      [rules, 'rule files, most of them loaded by path'],
      [events, 'session events watched by hooks'],
      [4, 'project types (three ready setups, plus one for other stacks), each with its own setup'],
      [servers, 'Optional MCP servers: two browser helpers and documentation lookup (setup asks first)'],
      [denied, 'deny rules in the biggest ready settings file'],
      [examples, 'example projects to read'],
    ],
  },
  gate: {
    title: 'Try the safety check yourself.',
    lead: 'Pick a command and send it as the assistant. Each answer is the real output of the safety check in the plugin. It catches known patterns and is not a sandbox.',
    commands: 'Commands to try',
    waiting: 'Waiting for a command.',
    denied: 'Blocked',
    allowed: 'Let through',
    quiet: 'The safety check stays silent and the command runs.',
    notes: {
      force: 'A force push would rewrite shared history.',
      verify: 'This would skip the checks of your repo.',
      main: 'Work should reach main through your review.',
      reset: 'This would throw away unsaved work.',
      secrets: 'This would bring secrets into the conversation.',
      live: 'This would touch real customers. The live hosts come from your config.',
      typecheck: 'Ordinary work goes straight through.',
    },
    after: 'When the assistant stops after changing source, committed or not, typecheck and related tests run. Then a reviewer reads the change.',
  },
  install: {
    title: 'Start in two steps.',
    lead: 'Open the Claude app, choose Code, pick a folder for your project, then send this message.',
    needs: 'Everything happens in the Claude app. You send one message, and Claude does the installing for you.',
    copy: 'Copy',
    copied: 'Copied',
    failed: 'Press copy',
  },
  footer: { source: 'GitHub', changelog: 'Changelog', examples: 'Examples', notices: 'Third-party licences' },
}
