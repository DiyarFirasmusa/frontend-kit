import { agents, skillGroups } from '../content/catalogue.ts'
import { agentGuides } from '../content/guide/agents.ts'
import { basics } from '../content/guide/basics.ts'
import { gate, guards, limits } from '../content/guide/checks.ts'
import { concepts, journey } from '../content/guide/concepts.ts'
import { settings } from '../content/guide/configuration.ts'
import { exampleProjects, recipes } from '../content/guide/examples.ts'
import { problems } from '../content/guide/problems.ts'
import { projects, type ProfileId } from '../content/guide/projects.ts'
import { rescue } from '../content/guide/refactor.ts'
import { ruleGuides } from '../content/guide/rules.ts'
import { skillGuides } from '../content/guide/skills/index.ts'
import { after, questions, written } from '../content/guide/start.ts'
import { tourWords as words } from '../content/guide/tour.ts'
import { skillUse } from '../content/guide/ui.ts'
import { content } from '../content/index.ts'
import type { SceneId } from '../content/scenes.ts'
import type { HookEvent, Locale } from '../content/types.ts'
import { agentUrl, hookUrl, pageUrl, skillUrl } from './links.ts'
import { hookEvents, ruleGroups } from './plugin.ts'
import { ruleFiles } from './plugin-details.ts'

export interface Line {
  text: string
  /** Said first, on its own line. */
  name?: string
  mark?: 'tick' | 'cross'
}

/** One thought of an explanation: it holds the stage alone until the next takes its place. */
export interface Moment {
  title: string
  /** Where its full documentation is. */
  doc: string
  id?: string
  /** A skill or agent: a name that never translates, counted in the guide bar. */
  named?: boolean
  /** The object on the stage it is about. */
  stop?: number
  text?: string
  say?: string
  lines?: Line[]
  chips?: string[]
}

/** More lines than this do not fit beside the stage on a short screen. */
const LINES = 4

function chunks<T>(items: readonly T[], size = LINES): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size))
}

export function momentsOf(scene: SceneId, locale: Locale): Moment[] {
  const copy = content[locale]
  const page = (id: Parameters<typeof pageUrl>[1]): string => pageUrl(locale, id)

  const project = (...ids: ProfileId[]): Moment[] =>
    projects
      .filter(({ id }) => ids.includes(id))
      .map(({ name, fits, gets }) => ({
        title: name[locale],
        text: fits[locale],
        lines: gets.map((item) => ({ text: item[locale], mark: 'tick' as const })),
        doc: page('project-types'),
      }))

  switch (scene) {
    case 'intro': {
      const doc = page('guide')
      return [
        { title: basics.problem[locale], text: basics.problemText[locale], doc },
        { title: basics.answer[locale], text: basics.answerText[locale], doc },
        ...concepts.map(({ name, like, text, example, page: id }) => ({
          title: name[locale],
          text: text[locale],
          lines: [{ name: like[locale], text: example[locale] }],
          doc: page(id),
        })),
      ]
    }
    case 'with': {
      const doc = page('guide')
      return [
        ...chunks(copy.why.pairs.slice(0, LINES)).map((pairs) => ({
          title: words.compare[locale],
          lines: pairs.map(([without, withKit]) => ({ name: without, text: withKit })),
          doc,
        })),
        ...chunks(journey).map((steps) => ({
          title: words.journey[locale],
          lines: steps.map(({ who, what }) => ({ name: who[locale], text: what[locale] })),
          doc,
        })),
        { title: copy.why.fit.title, lines: copy.why.fit.items.map((text) => ({ text, mark: 'tick' as const })), doc },
        { title: copy.why.skip.title, lines: copy.why.skip.items.map((text) => ({ text, mark: 'cross' as const })), doc },
      ]
    }
    case 'how': {
      const doc = page('get-started')
      return [
        { title: words.setupQuestions[locale], lines: questions.map(({ question }) => ({ text: question[locale] })), doc },
        { title: words.approve[locale], text: words.approveText[locale], doc },
        { title: words.files[locale], chips: written.map(({ path }) => path), doc },
        { title: words.after[locale], lines: after.map((step) => ({ text: step[locale], mark: 'tick' as const })), doc },
      ]
    }
    case 'website':
      return project('website')
    case 'dashboard':
      return project('dashboard')
    case 'both':
      return project('fullstack', 'react')
    case 'skills':
      // The order of the plates on the wall.
      return skillGroups
        .flatMap((group) => Object.keys(group.skills))
        .map((name, stop) => {
          const guide = skillGuides[name]!
          return {
            id: `skill-${name}`,
            title: name,
            named: true,
            stop,
            text: guide.plain[locale],
            say: guide.ask[0]![locale],
            lines: [
              ...guide.result.slice(0, 1).map((item) => ({ text: item[locale], mark: 'tick' as const })),
              ...guide.limits.slice(0, 1).map((item) => ({ text: item[locale], mark: 'cross' as const })),
            ],
            doc: skillUrl(locale, name),
          }
        })
    case 'agents':
      return Object.keys(agents).map((name, stop) => {
        const guide = agentGuides[name]!
        return {
          id: `agent-${name}`,
          title: name,
          named: true,
          stop,
          text: guide.plain[locale],
          say: guide.ask[locale],
          lines: guide.checks.map((check) => ({ text: check[locale], mark: 'tick' as const })),
          doc: agentUrl(locale, name),
        }
      })
    case 'rules':
      return ruleGroups.flatMap(({ group }, stop) =>
        chunks(ruleFiles[group]!).map((files) => ({
          title: copy.rules.groups[group] ?? group,
          stop,
          lines: files.map(({ key, name }) => ({ name, text: ruleGuides[key]![locale] })),
          doc: page('rules'),
        })),
      )
    case 'checks': {
      const events = (Object.keys(copy.session.events) as HookEvent[]).filter((event) => hookEvents.includes(event))
      const doc = page('checks')
      return events.flatMap((event, stop): Moment[] => {
        const [title, text] = copy.session.events[event]
        const moment = { title, text, stop, chips: [event], doc: hookUrl(locale, event) }
        if (event !== 'Stop') return [moment]
        const steps = chunks(gate).map((part) => ({
          title: words.gate[locale],
          stop,
          lines: part.map((step) => ({ text: step[locale], mark: 'tick' as const })),
          doc,
        }))
        return [moment, ...steps]
      })
    }
    case 'guards': {
      const doc = page('checks')
      return [
        ...guards.flatMap(({ title, items }) =>
          chunks(items).map((part) => ({ title: title[locale], lines: part.map((item) => ({ text: item[locale], mark: 'cross' as const })), doc })),
        ),
        { title: copy.gate.title, text: copy.gate.lead, doc: `${doc}#try-guard` },
        ...chunks(limits).map((part) => ({ title: words.limits[locale], lines: part.map((item) => ({ text: item[locale], mark: 'cross' as const })), doc })),
      ]
    }
    case 'features':
      return [
        ...copy.features.groups.map(({ title, items }) => ({
          title,
          lines: items.map(([text]) => ({ text, mark: 'tick' as const })),
          doc: page('features'),
        })),
        {
          title: copy.scenes.features.text ?? '',
          lines: settings.map(({ title }) => ({ text: title[locale] })),
          doc: page('configuration'),
        },
      ]
    case 'rescue': {
      const doc = page('refactor')
      return [
        ...chunks(copy.refactor.steps, 2).map((steps) => ({
          title: copy.scenes.rescue.text ?? '',
          lines: steps.map(([name, text]) => ({ name, text })),
          doc,
        })),
        { title: words.measured[locale], lines: rescue.measures.map((item) => ({ text: item[locale] })), doc },
        { title: words.phases[locale], lines: rescue.phaseList.map((item) => ({ text: item[locale] })), doc },
      ]
    }
    case 'examples':
      return [
        ...skillUse.ways.map(({ name, text, example }) => ({ title: name[locale], text: text[locale], say: example[locale], doc: page('skills') })),
        ...recipes.map(({ title, items }) => ({
          title: title[locale],
          lines: items.slice(0, 3).map(({ want, skills }) => ({ name: want[locale], text: skillGuides[skills[0]!]!.ask[0]![locale] })),
          doc: page('examples'),
        })),
        { title: words.projects[locale], chips: Object.keys(exampleProjects), doc: page('examples') },
      ]
    case 'questions':
      return [
        ...copy.answers.items.map(([title, text]) => ({ title, text, doc: page('questions') })),
        ...chunks(problems).map((part) => ({
          title: words.troubles[locale],
          lines: part.map(([problem]) => ({ text: problem[locale] })),
          doc: page('questions'),
        })),
      ]
    default:
      return []
  }
}
