import type { Bilingual } from '../catalogue.ts'
import { t } from './text.ts'

export type PageId =
  | 'docs'
  | 'modes'
  | 'changelog'
  | 'guide'
  | 'get-started'
  | 'skills'
  | 'agents'
  | 'features'
  | 'project-types'
  | 'rules'
  | 'checks'
  | 'configuration'
  | 'refactor'
  | 'examples'
  | 'questions'

export interface PageInfo {
  id: PageId
  name: Bilingual
  title: Bilingual
  lead: Bilingual
  /** Which frame of the film stands behind its title. */
  still: string
}

export interface PageSection {
  title: Bilingual
  pages: PageId[]
}

export const PAGES: Record<PageId, PageInfo> = {
  docs: {
    id: 'docs',
    still: 'skills',
    name: t('Documentation', 'التوثيق'),
    title: t('The complete documentation.', 'التوثيق الكامل.'),
    lead: t(
      'Every skill, agent, rule, hook, mode and setting: what it is, why it exists, when it applies and its full source.',
      'كل مهارة ووكيل وقاعدة وحارس ونمط وإعداد: ما هو، ولماذا وُجد، ومتى يعمل، ونصه الكامل.',
    ),
  },
  modes: {
    id: 'modes',
    still: 'layers',
    name: t('Modes', 'الأنماط'),
    title: t('Modes: how the assistant approaches the project.', 'الأنماط: كيف يتعامل المساعد مع المشروع.'),
    lead: t('Nine modes, from building new to a release freeze. You switch them with one command.', 'تسعة أنماط، من البناء الجديد إلى تجميد الإصدار، تبدّلها بأمر واحد.'),
  },
  changelog: {
    id: 'changelog',
    still: 'mark',
    name: t('Changelog', 'سجل التغييرات'),
    title: t('What changed, version by version.', 'ماذا تغيّر في كل إصدار.'),
    lead: t('The plugin’s own changelog, in full.', 'سجل تغييرات الإضافة كاملاً، بالإنجليزية كما كُتب.'),
  },
  guide: {
    id: 'guide',
    still: 'screen',
    name: t('What is it?', 'ما هي؟'),
    title: t('What is frontend-kit?', 'ما هي frontend-kit؟'),
    lead: t(
      'A kit that teaches your coding assistant how a good frontend team builds, and puts checks around it so the work is proven before you see it.',
      'عدّة تعلّم مساعدك البرمجي كيف يبني فريق واجهات جيد، وتحيطه بفحوص حتى يُثبَت العمل قبل أن يصلك.',
    ),
  },
  'get-started': {
    id: 'get-started',
    still: 'layers',
    name: t('Get started', 'البدء'),
    title: t('Get started in five minutes.', 'ابدأ في خمس دقائق.'),
    lead: t('Install it, answer two questions, approve one proposal. Every step is below, with what you will see.', 'ثبّتها وأجب عن سؤالين ووافق على مقترح واحد. كل خطوة هنا مع ما ستراه.'),
  },
  skills: {
    id: 'skills',
    still: 'skills',
    name: t('Skills', 'المهارات'),
    title: t('Skills: how the assistant knows the job.', 'المهارات: كيف يعرف المساعد العمل.'),
    lead: t(
      'A skill is a written playbook for one job, such as building a table. When your request matches, the assistant reads the playbook and follows its steps.',
      'المهارة دليل مكتوب لعمل واحد، مثل بناء جدول. عندما يطابقها طلبك يقرأ المساعد الدليل ويتبع خطواته.',
    ),
  },
  agents: {
    id: 'agents',
    still: 'agents',
    name: t('Agents', 'الوكلاء'),
    title: t('Agents: a team behind the assistant.', 'الوكلاء: فريق خلف المساعد.'),
    lead: t(
      'An agent is a separate assistant with one role, its own tools and a clean memory. The main assistant hands it a job and gets a report back.',
      'الوكيل مساعد منفصل بدور واحد وأدوات خاصة وذاكرة نظيفة. يسلّمه المساعد الرئيسي عملاً ويستلم منه تقريراً.',
    ),
  },
  features: {
    id: 'features',
    still: 'dashboard',
    name: t('All features', 'كل الميزات'),
    title: t('Every feature, explained.', 'كل ميزة مشروحة.'),
    lead: t('Everything the current version does, in one page, with a link to the part that explains each.', 'كل ما يفعله الإصدار الحالي في صفحة واحدة، مع رابط لشرح كل جزء.'),
  },
  'project-types': {
    id: 'project-types',
    still: 'both',
    name: t('Project types', 'أنواع المشاريع'),
    title: t('Four project types.', 'أربعة أنواع من المشاريع.'),
    lead: t('You choose one during setup. It decides which rules are installed and which skills are switched on.', 'تختار واحداً عند الإعداد، فيحدد القواعد التي تُثبَّت والمهارات التي تُفعَّل.'),
  },
  rules: {
    id: 'rules',
    still: 'rules',
    name: t('Rules', 'القواعد'),
    title: t('Rules: what good means here.', 'القواعد: معنى الجودة هنا.'),
    lead: t(
      'A rule is a short file of standards in your repo. Most load only when the assistant works on files they apply to.',
      'القاعدة ملف معايير قصير في مستودعك، وأغلبها لا يُحمَّل إلا عندما يعمل المساعد على ملفات تخصّه.',
    ),
  },
  checks: {
    id: 'checks',
    still: 'checks',
    name: t('Checks and guards', 'الفحوص والحرّاس'),
    title: t('Checks and guards.', 'الفحوص والحرّاس.'),
    lead: t(
      'Hooks are scripts that run at fixed moments. The assistant does not have to remember them and cannot choose to forget them.',
      'الـ hooks سكربتات تعمل في لحظات ثابتة، فلا تعتمد على ذاكرة المساعد ولا على اختياره.',
    ),
  },
  configuration: {
    id: 'configuration',
    still: 'website',
    name: t('Configuration', 'الإعدادات'),
    title: t('One file to configure it.', 'ملف واحد لضبطها.'),
    lead: t('Setup writes .claude/frontend-kit.json. Change a value there and the skills, agents and hooks follow.', 'يكتب الإعداد ملف ‎.claude/frontend-kit.json. غيّر قيمة فيه فتتبعها المهارات والوكلاء والحرّاس.'),
  },
  refactor: {
    id: 'refactor',
    still: 'broken',
    name: t('Old projects', 'المشاريع القديمة'),
    title: t('Rescue an old project.', 'أنقذ مشروعاً قديماً.'),
    lead: t('Refactor mode measures the mess, plans six phases and runs one at a time, without changing what the app does.', 'يقيس نمط إعادة الهيكلة الفوضى ويخطط ست مراحل وينفّذها واحدة واحدة، دون تغيير ما يفعله التطبيق.'),
  },
  examples: {
    id: 'examples',
    still: 'mark',
    name: t('Examples', 'أمثلة'),
    title: t('What do I type?', 'ماذا أكتب؟'),
    lead: t('Find what you want to do, copy the sentence and say it to the assistant in your own words.', 'جد ما تريد فعله، وانسخ الجملة أو قلها للمساعد بكلماتك.'),
  },
  questions: {
    id: 'questions',
    still: 'gate',
    name: t('Questions', 'الأسئلة'),
    title: t('Questions and problems.', 'أسئلة ومشاكل.'),
    lead: t('Honest answers about cost, safety and limits, and what to do when something does not work.', 'أجوبة صريحة عن الكلفة والأمان والحدود، وما تفعله عندما لا يعمل شيء.'),
  },
}

export const SECTIONS: PageSection[] = [
  { title: t('Start here', 'ابدأ من هنا'), pages: ['docs', 'guide', 'get-started', 'examples'] },
  { title: t('What is inside', 'ماذا بداخلها'), pages: ['skills', 'agents', 'rules', 'checks', 'features'] },
  { title: t('Your project', 'مشروعك'), pages: ['project-types', 'modes', 'configuration', 'refactor'] },
  { title: t('Help', 'المساعدة'), pages: ['questions', 'changelog'] },
]

/** The links in the header. */
export const HEADER_PAGES: PageId[] = ['guide', 'get-started', 'skills', 'agents', 'project-types', 'checks']
